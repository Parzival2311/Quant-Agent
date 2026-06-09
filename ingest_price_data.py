import yfinance as yf
import pandas as pd
import os
import requests
from io import StringIO
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "prices")

def get_sp500_tickers(years=10):
    """
    Scrapes Wikipedia for current and historical S&P 500 constituents
    over the last `years` years.
    """
    print("Scraping Wikipedia for S&P 500 constituents (current and historical)...")
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    html_data = StringIO(response.text)
    tables = pd.read_html(html_data)
    
    # Table 0: Current constituents
    current_df = tables[0]
    current_tickers = current_df["Symbol"].tolist()
    
    # Table 1: Historical changes
    changes_df = tables[1]
    
    # The changes table has a MultiIndex column structure
    # We want the ('Effective Date', 'Effective Date') and ('Removed', 'Ticker') columns
    effective_dates = changes_df[('Effective Date', 'Effective Date')]
    removed_tickers = changes_df[('Removed', 'Ticker')]
    
    # Filter for the last `years`
    cutoff_date = datetime.now() - timedelta(days=years*365)
    
    historical_tickers = []
    for date_str, ticker in zip(effective_dates, removed_tickers):
        try:
            # Some dates might be malformed or NaN
            if pd.isna(date_str) or pd.isna(ticker):
                continue
            
            # Format is typically "Month DD, YYYY" or "Month D, YYYY"
            try:
                date_obj = datetime.strptime(str(date_str).strip(), "%B %d, %Y")
            except ValueError:
                date_obj = datetime.strptime(str(date_str).strip(), "%B %d, %Y")
            
            if date_obj >= cutoff_date:
                historical_tickers.append(ticker)
        except Exception as e:
            # If date format fails, safely ignore to prevent crash
            continue
            
    all_tickers = set(current_tickers + historical_tickers)
    
    # Clean up yfinance ticker formats (yfinance uses hyphens for class shares, Wikipedia uses dots)
    cleaned_tickers = [str(t).replace('.', '-') for t in all_tickers if str(t).strip() != ""]
    return list(set(cleaned_tickers))

def fetch_price_data(years=10):
    """
    Fetches daily OHLCV data for all S&P 500 tickers (including historically removed ones)
    over the specified number of years.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    
    tickers = get_sp500_tickers(years=years)
    print(f"Total unique tickers to fetch: {len(tickers)}")
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=years * 365)
    
    for idx, ticker in enumerate(tickers):
        file_path = os.path.join(DATA_DIR, f"{ticker}.csv")
            
        print(f"[{idx+1}/{len(tickers)}] Fetching data for {ticker}...")
        try:
            df = yf.download(ticker, start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'), progress=False)
            if not df.empty:
                df.to_csv(file_path)
            else:
                print(f"  -> No data found for {ticker} (may be delisted).")
        except Exception as e:
            print(f"  -> Error fetching data for {ticker}: {e}")

if __name__ == "__main__":
    fetch_price_data()
