import json
import time
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate

class CreatorAgent:
    def __init__(self, model_name="llama-3.3-70b-versatile"):
        # We enforce JSON structure using the model's json generation if supported, or via prompt
        self.llm = ChatGroq(
            model_name=model_name, 
            temperature=0.7,
            max_retries=2
        )
        
        self.base_prompt = """You are a Principal Quantitative Developer.
Given the following SEC 10-K filing excerpt for the target company:
{raw_filing_text}

And the following historical strategy failures to AVOID:
{past_failures}

Your task is to generate a trading hypothesis based on corporate changes (e.g., inventory increases, litigation risks) and a corresponding Backtrader strategy in Python.

CONSTRAINTS:
1. Output MUST be valid JSON matching this schema exactly:
{{
    "hypothesis": "Clear plain-text economic reasoning here.",
    "code": "import backtrader as bt\\n\\nclass GeneratedStrategy(bt.Strategy):\\n    params = (('period', 10),)\\n    def __init__(self):\\n        self.order = None\\n..."
}}
2. Do NOT wrap the JSON in Markdown code blocks like ```json ... ```. Just return raw JSON.
3. The strategy class MUST be named 'GeneratedStrategy' and inherit from bt.Strategy.
4. Parameterize all constants in the `params` tuple.
5. Handle position gating inside `next()` (e.g., `if not self.position:` and `if not self.order:`).
6. Ensure mathematical indicators map arrays using valid Backtrader syntax.
"""

        self.error_prompt = """
WARNING: Your previous code execution failed with the following traceback:
{error_traceback}

You MUST debug the syntax, fix the offending lines, and provide the corrected JSON.
"""

    def generate_strategy(self, raw_filing_text: str, past_failures: list, error_traceback: str = "") -> dict:
        """
        Generates structured JSON (hypothesis and code) based on filing text and past failures.
        Applies error correction if traceback is present.
        """
        prompt_text = self.base_prompt
        if error_traceback:
            prompt_text += self.error_prompt
            
        prompt = PromptTemplate(
            input_variables=["raw_filing_text", "past_failures", "error_traceback"],
            template=prompt_text
        )
        
        chain = prompt | self.llm
        
        # Format failures nicely
        failures_str = "\\n".join([f"- {f['metadata']['strategy_id']} Failed because: {f['document']}" for f in past_failures]) if past_failures else "None"
        
        for attempt in range(5):
            try:
                response = chain.invoke({
                    "raw_filing_text": raw_filing_text,
                    "past_failures": failures_str,
                    "error_traceback": error_traceback
                })
                
                content = response.content.strip()
                # Clean up if model still wrapped in markdown
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                    
                parsed_json = json.loads(content.strip())
                return parsed_json
            except json.JSONDecodeError as e:
                print(f"JSON Parse Error attempt {attempt}: {e}")
                time.sleep(1)
            except Exception as e:
                print(f"Creator error: {e}")
                time.sleep(2)
                continue
        return {"hypothesis": "Failed to generate", "code": ""}
