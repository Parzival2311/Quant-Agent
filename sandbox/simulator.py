import backtrader as bt
import traceback
import os

class BacktraderSimulator:
    def __init__(self, cash=100000.0):
        self.cash = cash

    def run_strategy(self, strategy_code: str, data_path: str, friction_config: dict = None) -> dict:
        """
        Executes a Python strategy code string dynamically and evaluates performance.
        Wrap execution in try-except block to capture traceback.
        """
        # Define a safe global namespace
        namespace = {'bt': bt}
        
        try:
            # Dynamically compile code
            exec(strategy_code, namespace)
            
            StrategyClass = None
            for name, obj in namespace.items():
                if isinstance(obj, type) and issubclass(obj, bt.Strategy) and obj is not bt.Strategy:
                    StrategyClass = obj
                    break
                    
            if StrategyClass is None:
                raise ValueError("Could not find any class inheriting from bt.Strategy in the generated code.")
            
            cerebro = bt.Cerebro()
            cerebro.addstrategy(StrategyClass)
            
            # Load price data into standard GenericCSVData feeder
            data = bt.feeds.GenericCSVData(
                dataname=data_path,
                dtformat='%Y-%m-%d',
                datetime=0,
                open=1,
                high=2,
                low=3,
                close=4,
                volume=6,
                openinterest=-1, # Not present in our csv
                reverse=False
            )
            cerebro.adddata(data)
            
            cerebro.broker.setcash(self.cash)
            
            # Apply friction if any (Critic node)
            if friction_config:
                if 'commission' in friction_config:
                    cerebro.broker.setcommission(commission=friction_config['commission'])
                if 'slippage' in friction_config:
                    # Depending on how slippage is configured, bt supports Fixed or Perc.
                    # We'll support both for flexibility, assuming slippage is a percentage for now.
                    cerebro.broker.set_slippage_perc(friction_config['slippage'])
                # Latency (delay) - cerebro.broker doesn't have a direct "set_latency"
                # Backtrader uses "Cheat on Open" or orders execution at the next bar's open.
                # Backtrader executes orders on the next bar by default, but we can delay them.
                if friction_config.get('latency', 0) > 0:
                    cerebro.broker.set_filler(bt.broker.fillers.FixedBarFiller(friction_config['latency']))
            
            cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')
            cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
            cerebro.addanalyzer(bt.analyzers.Returns, _name='returns')
            cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name='trades')
            
            results = cerebro.run()
            if not results:
                raise RuntimeError("Cerebro run returned no results.")
            
            strat = results[0]
            
            # Extract metrics
            sharpe_analysis = strat.analyzers.sharpe.get_analysis()
            sharpe = sharpe_analysis.get('sharperatio', 0.0)
            if sharpe is None:
                sharpe = 0.0
                
            drawdown_analysis = strat.analyzers.drawdown.get_analysis()
            drawdown = drawdown_analysis.get('max', {}).get('drawdown', 0.0)
            
            final_value = cerebro.broker.getvalue()
            total_return = (final_value - self.cash) / self.cash
            
            # Extract win rate
            trade_analysis = strat.analyzers.trades.get_analysis()
            total_closed = trade_analysis.get('total', {}).get('closed', 0)
            total_won = trade_analysis.get('won', {}).get('total', 0)
            win_rate = (total_won / total_closed * 100.0) if total_closed > 0 else 0.0
            
            return {
                "success": True,
                "metrics": {
                    "sharpe_ratio": sharpe,
                    "max_drawdown": drawdown,
                    "total_return": total_return,
                    "final_value": final_value,
                    "win_rate": win_rate
                }
            }
            
        except Exception as e:
            # Capture complete error logs
            error_traceback = traceback.format_exc()
            return {
                "success": False,
                "error_traceback": error_traceback
            }
