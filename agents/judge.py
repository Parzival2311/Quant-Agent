import time
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate

class JudgeAgent:
    """
    The Logic Auditor.
    Compares baseline vs friction metrics, and parses the hypothesis for rationality.
    """
    def __init__(self, model_name="llama-3.3-70b-versatile"):
        self.llm = ChatGroq(model_name=model_name, temperature=0.1, max_retries=2)
        
        self.prompt = PromptTemplate(
            input_variables=["hypothesis"],
            template="""You are the Logic Auditor (Judge).
Review the following trading strategy hypothesis.

Hypothesis:
{hypothesis}

Does this core reasoning rely on statistical anomalies without economic grounding (e.g., day-of-the-week tracking or random mathematical scaling), or is it a sound economic rationale based on corporate fundamentals or robust market mechanics?
Answer strictly with 'APPROVE' or 'REJECT', followed by a brief 1-sentence reason."""
        )
        self.chain = self.prompt | self.llm
        
    def audit_strategy(self, backtest_metrics: dict, stress_test_metrics: dict, hypothesis: str) -> dict:
        """
        Audits the logic and yields decay. Returns a decision (APPROVED, REJECTED).
        """
        base_sharpe = backtest_metrics.get("sharpe_ratio", 0.0)
        stress_sharpe = stress_test_metrics.get("sharpe_ratio", 0.0)
        
        # Rule 1 (Yield Decay):
        if stress_sharpe < 0.5:
            return {
                "decision": "REJECTED",
                "reason": f"Yield Decay: Stress Sharpe ({stress_sharpe:.2f}) fell below 0.5."
            }
        
        if base_sharpe > 0:
            drop_percentage = (base_sharpe - stress_sharpe) / base_sharpe
            if drop_percentage > 0.50:
                return {
                    "decision": "REJECTED",
                    "reason": f"Yield Decay: Sharpe dropped by more than 50% under friction (from {base_sharpe:.2f} to {stress_sharpe:.2f})."
                }

        # Rule 2 (Rationality Check):
        for attempt in range(5):
            try:
                response = self.chain.invoke({
                    "hypothesis": hypothesis
                })
                content = response.content.strip()
                if content.startswith("REJECT"):
                    return {
                        "decision": "REJECTED",
                        "reason": f"Rationality Check Failed: {content}"
                    }
                else:
                    return {
                        "decision": "APPROVED",
                        "reason": "Strategy passed Yield Decay and Rationality checks."
                    }
            except Exception as e:
                print(f"Judge Agent: API error ({e}), retrying in 2s...")
                time.sleep(2)
                continue
                
        return {
            "decision": "REJECTED",
            "reason": "Judge Agent API Error during rationality check."
        }
        
        return {"decision": "REJECTED", "reason": "Judge failed to process."}
