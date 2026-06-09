import os
import json
import uuid
from typing import Literal
from langgraph.graph import StateGraph, END
from orchestrator.state import GraphState
from ingestion.pipeline import IngestionPipeline
from agents.creator import CreatorAgent
from agents.critic import CriticAgent
from agents.judge import JudgeAgent
from sandbox.simulator import BacktraderSimulator
from memory.vector_db import VectorMemory

class WorkflowOrchestrator:
    def __init__(self):
        self.pipeline = IngestionPipeline()
        self.creator = CreatorAgent()
        self.critic = CriticAgent()
        self.judge = JudgeAgent()
        self.simulator = BacktraderSimulator()
        self.memory = VectorMemory()
        
        self.base_dir = os.path.dirname(os.path.dirname(__file__))
        self.prod_dir = os.path.join(self.base_dir, "data", "strategies", "production")
        self.logs_dir = os.path.join(self.base_dir, "data", "strategies", "logs")
        os.makedirs(self.prod_dir, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)
        
        self.graph = self._build_graph()
        
    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(GraphState)
        
        # Nodes
        workflow.add_node("data_load", self._data_load_node)
        workflow.add_node("creator_ideation", self._creator_ideation_node)
        workflow.add_node("sandbox_execution", self._sandbox_execution_node)
        workflow.add_node("critic_stress_test", self._critic_stress_test_node)
        workflow.add_node("judge_audit", self._judge_audit_node)
        workflow.add_node("save_to_disk_and_chroma", self._save_node)
        
        # Edges
        workflow.set_entry_point("data_load")
        workflow.add_edge("data_load", "creator_ideation")
        workflow.add_edge("creator_ideation", "sandbox_execution")
        
        # Conditional edge from sandbox_execution
        workflow.add_conditional_edges(
            "sandbox_execution",
            self._sandbox_routing,
            {
                "critic_stress_test": "critic_stress_test",
                "creator_ideation": "creator_ideation",
                "save_to_disk_and_chroma": "save_to_disk_and_chroma" # Escape hatch failure route
            }
        )
        
        workflow.add_edge("critic_stress_test", "judge_audit")
        workflow.add_edge("judge_audit", "save_to_disk_and_chroma")
        workflow.add_edge("save_to_disk_and_chroma", END)
        
        return workflow.compile()
        
    def _data_load_node(self, state: GraphState) -> dict:
        print("--- DATA LOAD NODE ---")
        ticker = state["ticker"]
        # Ensure price data exists (Ingest prices if missing)
        price_path = os.path.join(self.pipeline.prices_dir, f"{ticker}_daily.csv")
        if not os.path.exists(price_path):
            self.pipeline.ingest_prices([ticker])
            
        # Ensure filing data exists
        filing_path = os.path.join(self.pipeline.filings_dir, f"{ticker}_10K_latest.txt")
        if not os.path.exists(filing_path):
            self.pipeline.ingest_filing(ticker)
            
        with open(filing_path, "r", encoding="utf-8") as f:
            raw_filing_text = f.read()
            
        return {"raw_filing_text": raw_filing_text[:15000]} # Limit to 15k chars for safety and quota
        
    def _creator_ideation_node(self, state: GraphState) -> dict:
        print("--- CREATOR IDEATION NODE ---")
        past_failures = self.memory.query_past_failures(state["hypothesis"] if state["hypothesis"] else "initial hypothesis")
        
        result = self.creator.generate_strategy(
            raw_filing_text=state["raw_filing_text"],
            past_failures=past_failures,
            error_traceback=state["error_traceback"]
        )
        
        # Increment iteration count if we are repairing
        iteration_count = state["iteration_count"] + 1 if state["error_traceback"] else 1
        
        return {
            "hypothesis": result.get("hypothesis", ""),
            "generated_code": result.get("code", ""),
            "iteration_count": iteration_count
        }
        
    def _sandbox_execution_node(self, state: GraphState) -> dict:
        print(f"--- SANDBOX EXECUTION NODE (Iteration {state['iteration_count']}) ---")
        price_path = os.path.join(self.pipeline.prices_dir, f"{state['ticker']}_daily.csv")
        
        res = self.simulator.run_strategy(state["generated_code"], data_path=price_path)
        
        if res["success"]:
            return {
                "backtest_success": True,
                "backtest_metrics": res["metrics"],
                "error_traceback": ""
            }
        else:
            return {
                "backtest_success": False,
                "error_traceback": res.get("error_traceback", "Unknown error")
            }
            
    def _sandbox_routing(self, state: GraphState) -> str:
        if state["backtest_success"]:
            return "critic_stress_test"
        else:
            if state["iteration_count"] >= 5:
                print("Escape Hatch Reached: Iteration ceiling hit. Failing strategy.")
                return "save_to_disk_and_chroma"
            return "creator_ideation"
            
    def _critic_stress_test_node(self, state: GraphState) -> dict:
        print("--- CRITIC STRESS TEST NODE ---")
        friction_config = self.critic.generate_friction_config()
        critic_reasoning = f"Latency: {friction_config.get('latency', 0)}, Slippage: {friction_config.get('slippage', 0)}, Commission: {friction_config.get('commission', 0)}"
        price_path = os.path.join(self.pipeline.prices_dir, f"{state['ticker']}_daily.csv")
        
        res = self.simulator.run_strategy(
            state["generated_code"], 
            data_path=price_path, 
            friction_config=friction_config
        )
        
        if res["success"]:
            return {"stress_test_metrics": res["metrics"], "critic_reasoning": critic_reasoning}
        else:
            # If it fails under stress test when it passed baseline, treat as a crash
            return {"stress_test_metrics": {"sharpe_ratio": 0.0}, "critic_reasoning": critic_reasoning}
            
    def _judge_audit_node(self, state: GraphState) -> dict:
        print("--- JUDGE AUDIT NODE ---")
        res = self.judge.audit_strategy(
            backtest_metrics=state["backtest_metrics"],
            stress_test_metrics=state["stress_test_metrics"],
            hypothesis=state["hypothesis"]
        )
        return {"judge_verdict": res["decision"], "judge_reasoning": res["reason"]}
        
    def _save_node(self, state: GraphState) -> dict:
        print("--- SAVE TO DISK AND CHROMA NODE ---")
        strategy_id = f"alpha_{uuid.uuid4().hex[:8]}"
        
        # Escape hatch failure
        if not state["backtest_success"] and state["iteration_count"] >= 5:
            status = "REJECTED"
            error_log = state["error_traceback"]
            print("Logging failed repair loop sequence.")
        else:
            status = state["judge_verdict"]
            error_log = None
            
        self.memory.add_strategy(
            strategy_id=strategy_id,
            ticker=state["ticker"],
            code=state["generated_code"],
            rationale=state["hypothesis"],
            status=status,
            sharpe_ratio=state["backtest_metrics"].get("sharpe_ratio", 0.0),
            max_drawdown=state["backtest_metrics"].get("max_drawdown", 0.0),
            error_log=error_log,
            judge_reasoning=state.get("judge_reasoning", ""),
            critic_reasoning=state.get("critic_reasoning", ""),
            total_return=state["backtest_metrics"].get("total_return", 0.0),
            final_value=state["backtest_metrics"].get("final_value", 0.0),
            win_rate=state["backtest_metrics"].get("win_rate", 0.0),
            stress_sharpe_ratio=state.get("stress_test_metrics", {}).get("sharpe_ratio", 0.0)
        )
        
        try:
            import pandas as pd
            excel_path = os.path.join(self.base_dir, "data", "strategies", "strategies_log.xlsx")
            new_data = {
                "Strategy ID": [strategy_id],
                "Ticker": [state["ticker"]],
                "Status": [status],
                "Sharpe Ratio": [state["backtest_metrics"].get("sharpe_ratio", 0.0)],
                "Stress Sharpe Ratio": [state.get("stress_test_metrics", {}).get("sharpe_ratio", 0.0)],
                "Max Drawdown": [state["backtest_metrics"].get("max_drawdown", 0.0)],
                "Total Return": [state["backtest_metrics"].get("total_return", 0.0)],
                "Final Value": [state["backtest_metrics"].get("final_value", 0.0)],
                "Win Rate (%)": [state["backtest_metrics"].get("win_rate", 0.0)],
                "Hypothesis": [state["hypothesis"]],
                "Critic Reasoning": [state.get("critic_reasoning", "")],
                "Judge Reasoning": [state.get("judge_reasoning", "")],
                "Error Log": [error_log]
            }
            df_new = pd.DataFrame(new_data)
            if os.path.exists(excel_path):
                df_existing = pd.read_excel(excel_path)
                df_combined = pd.concat([df_existing, df_new], ignore_index=True)
                df_combined.to_excel(excel_path, index=False)
            else:
                df_new.to_excel(excel_path, index=False)
        except Exception as e:
            print(f"Failed to append to Excel: {e}")
        
        if status == "APPROVED":
            code_path = os.path.join(self.prod_dir, f"{strategy_id}.py")
            metrics_path = os.path.join(self.logs_dir, f"{strategy_id}_metrics.json")
            
            with open(code_path, "w", encoding="utf-8") as f:
                f.write(state["generated_code"])
                
            with open(metrics_path, "w", encoding="utf-8") as f:
                json.dump(state["backtest_metrics"], f, indent=4)
                
            print(f"Saved production artifacts to {code_path} and {metrics_path}")
            
        return {}

    def run(self, initial_state: GraphState) -> GraphState:
        print(f"Starting workflow for {initial_state['ticker']}...")
        for output in self.graph.stream(initial_state):
            for key, value in output.items():
                pass # Node outputs handled by langgraph
        
        final_state = self.graph.invoke(initial_state)
        return final_state
