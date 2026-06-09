import os
import sys
import random
from dotenv import load_dotenv
from orchestrator.graph import WorkflowOrchestrator
from orchestrator.state import create_initial_state

def run_workflow_for_ticker(ticker: str, orchestrator: WorkflowOrchestrator):
    initial_state = create_initial_state(ticker)
    
    print(f"\n--- Starting Orchestration Loop for {ticker} ---")
    final_state = orchestrator.run(initial_state)
    
    print(f"\n--- Final Results for {ticker} ---")
    if not final_state["backtest_success"] and final_state["iteration_count"] >= 5:
        print("Result: FAILED TO COMPILE OR EXECUTE")
        print("Iteration Ceiling Reached (5).")
        print(f"Final Traceback:\n{final_state['error_traceback']}")
    else:
        print(f"Decision: {final_state['judge_verdict']}")
        print(f"Metrics (Baseline): {final_state.get('backtest_metrics', {})}")
        print(f"Metrics (Stress Test): {final_state.get('stress_test_metrics', {})}")

def main():
    load_dotenv()
    
    if not os.getenv("GROQ_API_KEY"):
        print("ERROR: GROQ_API_KEY is not set in .env")
        sys.exit(1)
        
    print("Welcome to the Autonomous Quant Lab (S&P 500) - Production Master")
    print("Initializing Multi-Agent System...")
    
    orchestrator = WorkflowOrchestrator()
    
    if len(sys.argv) > 1:
        # Run for specific tickers passed via CLI
        tickers = [t.upper() for t in sys.argv[1:]]
        for ticker in tickers:
            run_workflow_for_ticker(ticker, orchestrator)
    else:
        # Loop through all available tickers in data/prices
        data_dir = os.path.join(os.path.dirname(__file__), "data", "prices")
        if not os.path.exists(data_dir):
            print(f"ERROR: Data directory {data_dir} not found. Please run ingest_price_data.py first.")
            sys.exit(1)
            
        # Get all CSV files in the data directory and extract tickers
        files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
        tickers = [os.path.splitext(f)[0] for f in files]
        
        if not tickers:
            print("ERROR: No price data found. Please run ingest_price_data.py first.")
            sys.exit(1)
            
        print(f"Found {len(tickers)} tickers with data. Starting random loop...")
        random.shuffle(tickers)
        
        for idx, ticker in enumerate(tickers):
            print(f"\n\n{'='*50}")
            print(f"[{idx+1}/{len(tickers)}] PROCESSING: {ticker}")
            print(f"{'='*50}")
            try:
                run_workflow_for_ticker(ticker, orchestrator)
            except Exception as e:
                print(f"CRITICAL ERROR processing {ticker}: {e}")
                continue

if __name__ == "__main__":
    main()
