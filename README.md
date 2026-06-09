# Autonomous Quant Lab

Welcome to the **Autonomous Quant Lab**, an AI-driven multi-agent system designed to autonomously ideate, backtest, stress-test, and evaluate quantitative trading strategies on the S&P 500.

## Overview

The system uses a multi-agent architecture (Creator, Critic, Judge) powered by LLMs to navigate the quantitative research pipeline. It processes historical price data and SEC 10-K filings to generate novel trading hypotheses, writes `Backtrader` code, simulates execution with real-world market friction, and rigorously audits the results to prevent curve-fitting and survivorship bias.

### Key Components

- **Ingestion Pipeline (`ingest_price_data.py` & `ingest_sec_filings.py`)**: Automatically scrapes the S&P 500 constituents (including historical, delisted companies to eliminate survivorship bias) and downloads 10 years of daily pricing data and SEC filings.
- **Creator Agent (`agents/creator.py`)**: Consumes fundamental filings and past failures to ideate novel quantitative strategies and translate them into executable Python `Backtrader` code.
- **Critic Agent (`agents/critic.py`)**: Injects real-world market friction (latency, slippage, and broker commissions) into the sandbox environment to stress-test theoretical strategies.
- **Judge Agent (`agents/judge.py`)**: An independent auditor that evaluates the baseline and stress-tested metrics (Sharpe Ratio, Max Drawdown). If a strategy collapses under friction (Yield Decay), it is instantly rejected.
- **Workflow Orchestrator (`orchestrator/graph.py`)**: A LangGraph state machine that manages the recursive agent loop, memory persistence, and escape hatches.
- **Dashboard (`dashboard.py`)**: A Streamlit interface to track running strategies, inspect code artifacts, and monitor backtest metrics.

## Setup & Installation

1. Clone this repository.
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root directory and add your API keys:
   ```env
   GROQ_API_KEY="your_api_key_here"
   ```
4. Run the data ingestion scripts to build your local historical database:
   ```bash
   python ingest_price_data.py
   python ingest_sec_filings.py
   ```

## Usage

Start the continuous orchestrator loop to begin generating and testing strategies across the market:
```bash
python main.py
```

To view the results, boot up the dashboard in a separate terminal:
```bash
streamlit run dashboard.py
```
