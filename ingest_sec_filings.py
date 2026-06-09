import os
from sec_edgar_downloader import Downloader

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "sec_filings")
DEFAULT_TICKERS = ["AAPL", "MSFT", "GOOGL"]

def fetch_sec_filings(tickers=DEFAULT_TICKERS, form_types=["10-K", "10-Q"], limit=5):
    """
    Downloads SEC filings for the specified tickers.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Initialize the downloader with your company name and email
    # (Required by SEC EDGAR API)
    dl = Downloader("QuantLabResearch", "research@quantlab.com", DATA_DIR)
    
    for ticker in tickers:
        for form in form_types:
            print(f"Downloading {form} for {ticker}...")
            try:
                dl.get(form, ticker, limit=limit)
                print(f"Successfully downloaded {form} for {ticker}")
            except Exception as e:
                print(f"Error downloading {form} for {ticker}: {e}")

if __name__ == "__main__":
    fetch_sec_filings()
