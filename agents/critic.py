class CriticAgent:
    """
    The Chief Risk Officer.
    Evaluates the strategy and decides whether to inject friction.
    Actually, per the new spec, the Critic ALWAYS alters the Backtrader environment
    to force latency, slippage, and commission.
    """
    def __init__(self):
        pass
        
    def generate_friction_config(self) -> dict:
        """
        Forces an execution delay (latency) by lagging entries by 1 bar, 
        introduces fixed execution slippage (e.g., 0.05%), 
        and applies a fixed broker commission tier (e.g., 0.1%).
        """
        print("Critic: Injecting market friction (latency: 1 bar, slippage: 0.05%, commission: 0.1%)...")
        return {
            "latency": 1,
            "slippage": 0.0005, # 0.05%
            "commission": 0.001 # 0.1%
        }
