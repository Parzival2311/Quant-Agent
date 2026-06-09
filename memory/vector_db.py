import chromadb
from chromadb.utils import embedding_functions
import os
import re
from typing import List, Dict

DB_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "chroma_db")

class VectorMemory:
    def __init__(self, collection_name="quant_strategy_vault"):
        os.makedirs(DB_DIR, exist_ok=True)
        self.client = chromadb.PersistentClient(path=DB_DIR)
        
        # Use sentence-transformers for local, lightweight embeddings
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embedding_fn
        )

    def extract_keywords(self, code: str) -> str:
        # Simple extraction of indicator names or logic used
        keywords = re.findall(r'bt\.indicators\.[A-Za-z]+', code)
        return ", ".join(list(set(keywords)))

    def add_strategy(self, strategy_id: str, ticker: str, code: str, rationale: str, status: str, 
                     sharpe_ratio: float, max_drawdown: float, error_log: str = None,
                     judge_reasoning: str = "", critic_reasoning: str = "",
                     total_return: float = 0.0, final_value: float = 0.0, win_rate: float = 0.0,
                     stress_sharpe_ratio: float = 0.0):
        """
        Stores a generated strategy along with its rationale and performance.
        """
        code_keywords = self.extract_keywords(code)
        
        # Embed based on the requested format
        document = f"Ticker: {ticker} | Rationale: {rationale} | Indicators used: {code_keywords}"
        
        # Ensure correct metadata types (ChromaDB does not support None values in metadata dict directly, 
        # so we cast to empty string if None)
        metadata = {
            "strategy_id": strategy_id,
            "ticker": ticker,
            "status": status,
            "sharpe_ratio": float(sharpe_ratio) if sharpe_ratio is not None else 0.0,
            "max_drawdown": float(max_drawdown) if max_drawdown is not None else 0.0,
            "total_return": float(total_return) if total_return is not None else 0.0,
            "final_value": float(final_value) if final_value is not None else 0.0,
            "win_rate": float(win_rate) if win_rate is not None else 0.0,
            "error_log": str(error_log) if error_log is not None else "NONE",
            "judge_reasoning": str(judge_reasoning),
            "critic_reasoning": str(critic_reasoning),
            "stress_sharpe_ratio": float(stress_sharpe_ratio) if stress_sharpe_ratio is not None else 0.0
        }
        
        self.collection.add(
            ids=[strategy_id],
            documents=[document],
            metadatas=[metadata]
        )
        print(f"Strategy {strategy_id} added to vector memory with status {status}.")

    def query_past_failures(self, current_hypothesis: str) -> List[Dict]:
        """
        Checks the current text proposal against historical failures with low Sharpe ratios or high error rates, 
        providing 3 examples to pass back into the Creator's context window.
        """
        # Query the top 10 most similar to hypothesis
        results = self.collection.query(
            query_texts=[current_hypothesis],
            n_results=10
        )
        
        failures = []
        if results and results['metadatas'] and results['metadatas'][0]:
            for i, meta in enumerate(results['metadatas'][0]):
                # Filter for failures (REJECTED status or negative sharpe ratio)
                if meta.get("status") == "REJECTED" or meta.get("sharpe_ratio", 0) < 0.5 or meta.get("error_log") != "NONE":
                    failure_doc = {
                        "document": results['documents'][0][i],
                        "metadata": meta
                    }
                    failures.append(failure_doc)
                    if len(failures) == 3:
                        break
                        
        return failures

if __name__ == "__main__":
    memory = VectorMemory()
    print("Vector memory initialized.")
