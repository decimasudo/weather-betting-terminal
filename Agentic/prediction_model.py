import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, accuracy_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import joblib
from typing import Tuple, List, Dict, Any
import warnings
warnings.filterwarnings('ignore')

class WeatherPredictionModel:
    def __init__(self, model_type: str = "rf"):
        self.model_type = model_type
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.model = None

    def prepare_features(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        features = ['temperature', 'humidity', 'pressure', 'wind_speed', 'wind_direction']
        X = data[features].values
        X_scaled = self.scaler.fit_transform(X)
        return X_scaled, data['target'].values

    def train_random_forest(self, X: np.ndarray, y: np.ndarray) -> RandomForestRegressor:
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X, y)
        return model

    def train_gradient_boosting(self, X: np.ndarray, y: np.ndarray) -> GradientBoostingClassifier:
        model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        model.fit(X, y)
        return model

    def build_lstm_model(self, input_shape: Tuple[int, int]) -> Sequential:
        model = Sequential([
            LSTM(50, activation='relu', input_shape=input_shape, return_sequences=True),
            Dropout(0.2),
            LSTM(50, activation='relu'),
            Dropout(0.2),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse')
        return model

    def train_lstm(self, X: np.ndarray, y: np.ndarray, epochs: int = 50) -> Sequential:
        X_reshaped = X.reshape((X.shape[0], 1, X.shape[1]))
        model = self.build_lstm_model((1, X.shape[1]))
        model.fit(X_reshaped, y, epochs=epochs, verbose=0)
        return model

    def predict_temperature(self, features: np.ndarray) -> np.ndarray:
        if self.model_type == "rf":
            return self.model.predict(features)
        elif self.model_type == "lstm":
            features_reshaped = features.reshape((features.shape[0], 1, features.shape[1]))
            return self.model.predict(features_reshaped).flatten()

    def predict_weather_event(self, features: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(features)

    def cross_validate(self, X: np.ndarray, y: np.ndarray, cv_splits: int = 5) -> List[float]:
        tscv = TimeSeriesSplit(n_splits=cv_splits)
        scores = []
        for train_index, test_index in tscv.split(X):
            X_train, X_test = X[train_index], X[test_index]
            y_train, y_test = y[train_index], y[test_index]

            if self.model_type == "rf":
                model = self.train_random_forest(X_train, y_train)
                predictions = model.predict(X_test)
                score = mean_absolute_error(y_test, predictions)
            elif self.model_type == "gb":
                model = self.train_gradient_boosting(X_train, y_train)
                predictions = model.predict(X_test)
                score = accuracy_score(y_test, predictions)
            scores.append(score)
        return scores

    def save_model(self, filepath: str):
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder,
            'model_type': self.model_type
        }, filepath)

    def load_model(self, filepath: str):
        data = joblib.load(filepath)
        self.model = data['model']
        self.scaler = data['scaler']
        self.label_encoder = data['label_encoder']
        self.model_type = data['model_type']

    def feature_importance(self) -> Dict[str, float]:
        if hasattr(self.model, 'feature_importances_'):
            features = ['temperature', 'humidity', 'pressure', 'wind_speed', 'wind_direction']
            return dict(zip(features, self.model.feature_importances_))
        return {}

    def predict_probability_distribution(self, features: np.ndarray, n_samples: int = 1000) -> np.ndarray:
        predictions = []
        for _ in range(n_samples):
            if hasattr(self.model, 'estimators_'):
                tree_predictions = np.array([tree.predict(features) for tree in self.model.estimators_])
                predictions.append(np.mean(tree_predictions, axis=0))
            else:
                pred = self.model.predict(features)
                predictions.append(pred)
        return np.array(predictions)