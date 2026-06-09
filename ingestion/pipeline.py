import os
import time
import random
import datetime
import pandas as pd
import yfinance as yf
from edgar import set_identity, Company

class IngestionPipeline:
    def __init__(self, base_dir: str = None):
        if base_dir is None:
            base_dir = os.path.dirname(os.path.dirname(__file__))
        self.prices_dir = os.path.join(base_dir, "data", "prices")
        self.filings_dir = os.path.join(base_dir, "data", "filings")
        
        os.makedirs(self.prices_dir, exist_ok=True)
        os.makedirs(self.filings_dir, exist_ok=True)
        
        # Track B: Initialize EDGAR API safely
        set_identity("QuantLab User QuantLabUser@example.com")

    def ingest_prices(self, tickers: list[str]) -> dict:
        """
        Track A: Numerical Pricing Engine
        """
        end_date = datetime.datetime.today()
        start_date = end_date - datetime.timedelta(days=365 * 10)
        
        results = {}
        for ticker in tickers:
            try:
                print(f"Downloading pricing data for {ticker}...")
                df = yf.download(ticker, start=start_date.strftime("%Y-%m-%d"), end=end_date.strftime("%Y-%m-%d"), progress=False)
                
                if df.empty:
                    print(f"No data found for {ticker}")
                    results[ticker] = None
                    continue
                
                # Integrity Control: Force index to clean YYYY-MM-DD
                df.index = pd.to_datetime(df.index).strftime("%Y-%m-%d")
                df.index.name = "Date"
                
                # yfinance sometimes returns MultiIndex columns if multiple tickers are passed,
                # but we pass single ticker. We ensure standard columns.
                if isinstance(df.columns, pd.MultiIndex):
                    df.columns = df.columns.droplevel(1)
                
                required_cols = ["Open", "High", "Low", "Close", "Adj Close", "Volume"]
                # Filter for required columns to be strict
                # Some might be missing e.g., 'Adj Close' is sometimes missing in newer yf versions, fall back to Close
                if "Adj Close" not in df.columns and "Close" in df.columns:
                    df["Adj Close"] = df["Close"]
                    
                df = df[required_cols]
                
                # Drop empty rows
                df = df.dropna()
                
                file_path = os.path.join(self.prices_dir, f"{ticker}_daily.csv")
                df.to_csv(file_path)
                results[ticker] = file_path
                
                # Randomized delay
                time.sleep(random.uniform(1, 3))
            except Exception as e:
                print(f"Failed to ingest prices for {ticker}: {e}")
                results[ticker] = None
                
        return results

    def ingest_filing(self, ticker: str) -> str:
        """
        Track B: Textual Financial Engine
        """
        try:
            print(f"Downloading filing data for {ticker}...")
            company = Company(ticker)
            filings = company.get_filings(form="10-K")
            
            if not filings:
                print(f"No 10-K filings found for {ticker}")
                return ""
            
            # Get the single most recent filing document
            latest_filing = filings[0]
            tenk = latest_filing.obj()
            
            # Focus extraction on Item 1A and Item 7
            item_1a = tenk["Item 1A"]
            item_7 = tenk["Item 7"]
            
            text_content = ""
            if item_1a:
                text_content += f"--- ITEM 1A: RISK FACTORS ---\n{item_1a}\n\n"
            if item_7:
                text_content += f"--- ITEM 7: MANAGEMENT'S DISCUSSION AND ANALYSIS ---\n{item_7}\n\n"
                
            if not text_content:
                # Fallback to full clean text
                text_content = tenk.text
                
            file_path = os.path.join(self.filings_dir, f"{ticker}_10K_latest.txt")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(text_content)
                
            return text_content
        except Exception as e:
            print(f"Failed to ingest filing for {ticker}: {e}")
            return ""

if __name__ == "__main__":
    pipeline = IngestionPipeline()
    pipeline.ingest_prices(["AAPL"])
    pipeline.ingest_filing("AAPL")
