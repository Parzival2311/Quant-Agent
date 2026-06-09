from typing import Dict, Any, List, TypedDict

class GraphState(TypedDict):
    ticker: str                     # Target S&P 500 Ticker
    raw_filing_text: str            # Extracted text from local 10-K
    hypothesis: str                 # Plain-text trading logic + economic rationale
    generated_code: str             # Raw Backtrader Python strategy code string
    iteration_count: int             # Current repair loop counter (Max: 5)
    backtest_success: bool        # Boolean flag indicating compilation & baseline run status
    backtest_metrics: Dict[str, Any]           # Clean baseline results (Sharpe, Drawdown, Returns)
    stress_test_metrics: Dict[str, Any]         # Critic-modified friction results
    judge_verdict: str              # APPROVED, REJECTED, or REPAIR
    judge_reasoning: str            # Detailed explanation for the verdict
    critic_reasoning: str           # Stringified dictionary of friction config applied
    error_traceback: str            # Full traceback string if execution fails
    execution_history: List[Any]           # Array logging previous iterations and failures

def create_initial_state(ticker: str) -> GraphState:
    return {
        "ticker": ticker,
        "raw_filing_text": "",
        "hypothesis": "",
        "generated_code": "",
        "iteration_count": 0,
        "backtest_success": False,
        "backtest_metrics": {},
        "stress_test_metrics": {},
        "judge_verdict": "",
        "judge_reasoning": "",
        "critic_reasoning": "",
        "error_traceback": "",
        "execution_history": []
    }
