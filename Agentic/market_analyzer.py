import numpy as np
import pandas as pd
from scipy.stats import norm
from typing import Dict, List, Tuple, Optional
import math
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class MarketPosition:
    outcome: str
    probability: float
    liquidity: float
    volume: float
    timestamp: datetime

@dataclass
class ArbitrageOpportunity:
    market_id: str
    profit_percentage: float
    required_stake: float
    expected_return: float
    outcomes: List[str]

class MarketAnalyzer:
    def __init__(self, risk_free_rate: float = 0.02):
        self.risk_free_rate = risk_free_rate

    def calculate_implied_probabilities(self, odds: Dict[str, float]) -> Dict[str, float]:
        total_implied = sum(1/odd for odd in odds.values())
        return {outcome: (1/odd) / total_implied for outcome, odd in odds.items()}

    def calculate_market_efficiency(self, positions: List[MarketPosition]) -> float:
        probabilities = [pos.probability for pos in positions]
        total_prob = sum(probabilities)
        overround = total_prob - 1.0
        return max(0, 1 - abs(overround))

    def detect_arbitrage(self, markets: Dict[str, List[MarketPosition]]) -> List[ArbitrageOpportunity]:
        opportunities = []
        for market_id, positions in markets.items():
            if len(positions) < 2:
                continue

            sorted_positions = sorted(positions, key=lambda x: x.probability)
            best_bid = sorted_positions[0]
            best_ask = sorted_positions[-1]

            if best_bid.probability + best_ask.probability < 1.0:
                stake = 1000
                profit = stake * (1.0 / best_bid.probability + 1.0 / best_ask.probability - 2)
                if profit > 0:
                    opportunities.append(ArbitrageOpportunity(
                        market_id=market_id,
                        profit_percentage=profit / stake,
                        required_stake=stake,
                        expected_return=profit,
                        outcomes=[best_bid.outcome, best_ask.outcome]
                    ))
        return opportunities

    def calculate_sharpe_ratio(self, returns: List[float], periods: int = 252) -> float:
        if len(returns) < 2:
            return 0.0

        mean_return = np.mean(returns)
        std_return = np.std(returns)
        if std_return == 0:
            return 0.0

        return (mean_return - self.risk_free_rate) * np.sqrt(periods) / std_return

    def calculate_kelly_criterion(self, probability: float, odds: float) -> float:
        b = odds - 1
        q = 1 - probability
        return (b * probability - q) / b

    def calculate_value_bet_score(self, implied_prob: float, true_prob: float, kelly_fraction: float = 1.0) -> float:
        edge = true_prob - implied_prob
        if edge <= 0:
            return 0.0

        kelly = self.calculate_kelly_criterion(true_prob, 1/implied_prob)
        return edge * min(kelly * kelly_fraction, 1.0)

    def analyze_market_sentiment(self, positions: List[MarketPosition]) -> Dict[str, float]:
        if not positions:
            return {}

        volumes = [pos.volume for pos in positions]
        total_volume = sum(volumes)

        sentiment_scores = {}
        for pos in positions:
            volume_weight = pos.volume / total_volume if total_volume > 0 else 0
            sentiment_scores[pos.outcome] = pos.probability * volume_weight

        return sentiment_scores

    def calculate_portfolio_variance(self, positions: List[MarketPosition], correlations: Dict[Tuple[str, str], float]) -> float:
        n = len(positions)
        weights = np.array([pos.probability for pos in positions])
        cov_matrix = np.zeros((n, n))

        for i in range(n):
            for j in range(n):
                if i == j:
                    cov_matrix[i][j] = positions[i].probability * (1 - positions[i].probability)
                else:
                    key = tuple(sorted([positions[i].outcome, positions[j].outcome]))
                    corr = correlations.get(key, 0)
                    cov_matrix[i][j] = corr * math.sqrt(
                        positions[i].probability * (1 - positions[i].probability) *
                        positions[j].probability * (1 - positions[j].probability)
                    )

        return np.dot(weights.T, np.dot(cov_matrix, weights))

    def optimize_portfolio(self, positions: List[MarketPosition], target_return: float) -> Dict[str, float]:
        n = len(positions)
        probabilities = np.array([pos.probability for pos in positions])

        def objective(weights):
            portfolio_return = np.sum(weights * probabilities)
            portfolio_risk = np.sqrt(np.sum(weights * (probabilities - portfolio_return)**2))
            return portfolio_risk

        from scipy.optimize import minimize

        constraints = [
            {'type': 'eq', 'fun': lambda w: np.sum(w) - 1},
            {'type': 'eq', 'fun': lambda w: np.sum(w * probabilities) - target_return}
        ]

        bounds = [(0, 1) for _ in range(n)]
        initial_weights = np.ones(n) / n

        result = minimize(objective, initial_weights, method='SLSQP', bounds=bounds, constraints=constraints)

        if result.success:
            return dict(zip([pos.outcome for pos in positions], result.x))
        else:
            return {}

    def calculate_liquidity_score(self, positions: List[MarketPosition]) -> float:
        if not positions:
            return 0.0

        volumes = [pos.volume for pos in positions]
        liquidity_scores = []

        for i, pos in enumerate(positions):
            other_positions = positions[:i] + positions[i+1:]
            other_volume = sum(p.volume for p in other_positions)
            score = pos.volume / (pos.volume + other_volume) if (pos.volume + other_volume) > 0 else 0
            liquidity_scores.append(score)

        return np.mean(liquidity_scores)

    def detect_market_manipulation(self, positions: List[MarketPosition], threshold: float = 0.1) -> List[str]:
        suspicious_outcomes = []
        avg_probability = sum(pos.probability for pos in positions) / len(positions)

        for pos in positions:
            if abs(pos.probability - avg_probability) > threshold:
                suspicious_outcomes.append(pos.outcome)

        return suspicious_outcomes

    def calculate_market_depth(self, positions: List[MarketPosition]) -> Dict[str, float]:
        sorted_positions = sorted(positions, key=lambda x: x.probability)
        depth_scores = {}

        for i, pos in enumerate(sorted_positions):
            depth_score = 1.0 / (i + 1)
            depth_scores[pos.outcome] = depth_score * pos.liquidity

        return depth_scores

    def forecast_market_movement(self, historical_data: pd.DataFrame, forecast_periods: int = 5) -> pd.DataFrame:
        from statsmodels.tsa.arima.model import ARIMA

        forecasts = {}
        for column in historical_data.columns:
            if column != 'timestamp':
                model = ARIMA(historical_data[column], order=(1, 1, 1))
                model_fit = model.fit()
                forecast = model_fit.forecast(steps=forecast_periods)
                forecasts[column] = forecast

        forecast_df = pd.DataFrame(forecasts)
        forecast_df['timestamp'] = pd.date_range(
            start=historical_data['timestamp'].iloc[-1] + timedelta(days=1),
            periods=forecast_periods
        )

        return forecast_df