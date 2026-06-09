import random

class FrictionSimulator:
    """
    Used by the Critic Agent to inject synthetic, adverse market conditions
    to stress-test trading algorithms and expose overfitting.
    """
    
    @staticmethod
    def generate_random_friction():
        """
        Randomly select an adverse market condition.
        """
        conditions = [
            {"type": "high_commission", "commission": 0.005, "description": "High broker commissions (0.5%)"},
            {"type": "high_slippage", "slippage": 0.02, "description": "High execution slippage (2%)"},
            {"type": "market_shock", "description": "Simulated latency and missing price ticks"}
        ]
        return random.choice(conditions)

    @staticmethod
    def apply_friction(base_config, friction):
        """
        Merges base backtrader config with the friction parameters.
        """
        config = base_config.copy()
        if 'commission' in friction:
            config['commission'] = friction['commission']
        if 'slippage' in friction:
            config['slippage'] = friction['slippage']
        return config
