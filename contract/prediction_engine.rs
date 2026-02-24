use std::collections::HashMap;
use ndarray::{Array1, Array2, ArrayView1};
use linfa::{Dataset, traits::*};
use linfa_linear::LinearRegression;
use rand::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictionFeatures {
    pub temperature: f64,
    pub humidity: f64,
    pub pressure: f64,
    pub wind_speed: f64,
    pub wind_direction: f64,
    pub historical_avg_temp: f64,
    pub seasonal_factor: f64,
    pub location_latitude: f64,
    pub location_longitude: f64,
}

#[derive(Debug, Clone)]
pub struct PredictionResult {
    pub predicted_temperature: f64,
    pub confidence_interval: (f64, f64),
    pub probability_distribution: Vec<f64>,
    pub feature_importance: HashMap<String, f64>,
}

pub struct PredictionEngine {
    models: HashMap<String, LinearRegression<f64>>,
    scalers: HashMap<String, FeatureScaler>,
    feature_names: Vec<String>,
}

#[derive(Debug, Clone)]
struct FeatureScaler {
    means: Array1<f64>,
    stds: Array1<f64>,
}

impl PredictionEngine {
    pub fn new() -> Self {
        Self {
            models: HashMap::new(),
            scalers: HashMap::new(),
            feature_names: vec![
                "temperature".to_string(),
                "humidity".to_string(),
                "pressure".to_string(),
                "wind_speed".to_string(),
                "wind_direction".to_string(),
                "historical_avg_temp".to_string(),
                "seasonal_factor".to_string(),
                "location_latitude".to_string(),
                "location_longitude".to_string(),
            ],
        }
    }

    pub fn train_model(&mut self, location: String, features: Vec<PredictionFeatures>, targets: Vec<f64>) {
        let n_samples = features.len();
        let n_features = self.feature_names.len();

        let mut feature_matrix = Array2::<f64>::zeros((n_samples, n_features));

        for (i, feature) in features.iter().enumerate() {
            feature_matrix[[i, 0]] = feature.temperature;
            feature_matrix[[i, 1]] = feature.humidity;
            feature_matrix[[i, 2]] = feature.pressure;
            feature_matrix[[i, 3]] = feature.wind_speed;
            feature_matrix[[i, 4]] = feature.wind_direction;
            feature_matrix[[i, 5]] = feature.historical_avg_temp;
            feature_matrix[[i, 6]] = feature.seasonal_factor;
            feature_matrix[[i, 7]] = feature.location_latitude;
            feature_matrix[[i, 8]] = feature.location_longitude;
        }

        let target_array = Array1::from_vec(targets);

        let scaler = self.fit_scaler(&feature_matrix);
        let scaled_features = self.apply_scaling(&feature_matrix, &scaler);

        let dataset = Dataset::new(scaled_features, target_array);

        let model = LinearRegression::default().fit(&dataset).unwrap();

        self.models.insert(location.clone(), model);
        self.scalers.insert(location, scaler);
    }

    fn fit_scaler(&self, features: &Array2<f64>) -> FeatureScaler {
        let means = features.mean_axis(ndarray::Axis(0)).unwrap();
        let stds = features.std_axis(ndarray::Axis(0), 0.0);
        FeatureScaler { means, stds }
    }

    fn apply_scaling(&self, features: &Array2<f64>, scaler: &FeatureScaler) -> Array2<f64> {
        let mut scaled = features.clone();
        for mut row in scaled.outer_iter_mut() {
            for (i, val) in row.iter_mut().enumerate() {
                *val = (*val - scaler.means[i]) / scaler.stds[i];
            }
        }
        scaled
    }

    pub fn predict(&self, location: &str, features: &PredictionFeatures) -> Option<PredictionResult> {
        let model = self.models.get(location)?;
        let scaler = self.scalers.get(location)?;

        let feature_array = Array1::from_vec(vec![
            features.temperature,
            features.humidity,
            features.pressure,
            features.wind_speed,
            features.wind_direction,
            features.historical_avg_temp,
            features.seasonal_factor,
            features.location_latitude,
            features.location_longitude,
        ]);

        let scaled_features = self.apply_scaling_single(&feature_array, scaler);
        let scaled_features_2d = scaled_features.clone().insert_axis(ndarray::Axis(0));

        let prediction = model.predict(&scaled_features_2d).unwrap()[0];

        let confidence_interval = self.calculate_confidence_interval(&scaled_features_2d, model, 0.95);
        let probability_distribution = self.generate_probability_distribution(prediction, 0.5, 1000);
        let feature_importance = self.calculate_feature_importance(model);

        Some(PredictionResult {
            predicted_temperature: prediction,
            confidence_interval,
            probability_distribution,
            feature_importance,
        })
    }

    fn apply_scaling_single(&self, features: &Array1<f64>, scaler: &FeatureScaler) -> Array1<f64> {
        let mut scaled = features.clone();
        for (i, val) in scaled.iter_mut().enumerate() {
            *val = (*val - scaler.means[i]) / scaler.stds[i];
        }
        scaled
    }

    fn calculate_confidence_interval(&self, features: &Array2<f64>, model: &LinearRegression<f64>, confidence: f64) -> (f64, f64) {
        let prediction = model.predict(features).unwrap()[0];
        let residuals = model.residuals().unwrap();
        let mse = residuals.mapv(|x| x * x).mean().unwrap();
        let std_error = (mse * (1.0 + features.row(0).dot(&features.row(0)) / features.nrows() as f64)).sqrt();

        let z_score = match confidence {
            0.95 => 1.96,
            0.99 => 2.576,
            _ => 1.96,
        };

        let margin = z_score * std_error;
        (prediction - margin, prediction + margin)
    }

    fn generate_probability_distribution(&self, mean: f64, std_dev: f64, n_samples: usize) -> Vec<f64> {
        let mut rng = thread_rng();
        let normal = rand_distr::Normal::new(mean, std_dev).unwrap();

        (0..n_samples)
            .map(|_| normal.sample(&mut rng))
            .collect()
    }

    fn calculate_feature_importance(&self, model: &LinearRegression<f64>) -> HashMap<String, f64> {
        let coefficients = model.coefficients().unwrap();
        let mut importance = HashMap::new();

        for (i, &coef) in coefficients.iter().enumerate() {
            importance.insert(self.feature_names[i].clone(), coef.abs());
        }

        let total: f64 = importance.values().sum();
        for val in importance.values_mut() {
            *val /= total;
        }

        importance
    }

    pub fn batch_predict(&self, location: &str, features_batch: Vec<PredictionFeatures>) -> Vec<Option<PredictionResult>> {
        features_batch
            .iter()
            .map(|features| self.predict(location, features))
            .collect()
    }

    pub fn get_model_metrics(&self, location: &str) -> Option<ModelMetrics> {
        let model = self.models.get(location)?;

        Some(ModelMetrics {
            coefficients: model.coefficients().unwrap().to_vec(),
            intercept: model.intercept(),
            r_squared: model.r_squared().unwrap_or(0.0),
            mse: model.mean_squared_error().unwrap_or(0.0),
        })
    }

    pub fn update_model(&mut self, location: String, new_features: Vec<PredictionFeatures>, new_targets: Vec<f64>) {
        if let Some(existing_model) = self.models.get(&location) {
            let mut all_features = Vec::new();
            let mut all_targets = Vec::new();

            if let Some(scaler) = self.scalers.get(&location) {
                let n_samples = new_features.len();
                let n_features = self.feature_names.len();
                let mut feature_matrix = Array2::<f64>::zeros((n_samples, n_features));

                for (i, feature) in new_features.iter().enumerate() {
                    feature_matrix[[i, 0]] = feature.temperature;
                    feature_matrix[[i, 1]] = feature.humidity;
                    feature_matrix[[i, 2]] = feature.pressure;
                    feature_matrix[[i, 3]] = feature.wind_speed;
                    feature_matrix[[i, 4]] = feature.wind_direction;
                    feature_matrix[[i, 5]] = feature.historical_avg_temp;
                    feature_matrix[[i, 6]] = feature.seasonal_factor;
                    feature_matrix[[i, 7]] = feature.location_latitude;
                    feature_matrix[[i, 8]] = feature.location_longitude;
                }

                let scaled_features = self.apply_scaling(&feature_matrix, scaler);
                let target_array = Array1::from_vec(new_targets);

                let dataset = Dataset::new(scaled_features, target_array);
                let updated_model = LinearRegression::default().fit(&dataset).unwrap();

                self.models.insert(location, updated_model);
            }
        } else {
            self.train_model(location, new_features, new_targets);
        }
    }

    pub fn cross_validate(&self, location: &str, features: Vec<PredictionFeatures>, targets: Vec<f64>, folds: usize) -> Vec<f64> {
        let mut scores = Vec::new();
        let fold_size = features.len() / folds;

        for i in 0..folds {
            let test_start = i * fold_size;
            let test_end = if i == folds - 1 { features.len() } else { (i + 1) * fold_size };

            let test_features = &features[test_start..test_end];
            let test_targets = &targets[test_start..test_end];

            let train_features: Vec<_> = features.iter()
                .enumerate()
                .filter(|(idx, _)| *idx < test_start || *idx >= test_end)
                .map(|(_, f)| f.clone())
                .collect();

            let train_targets: Vec<_> = targets.iter()
                .enumerate()
                .filter(|(idx, _)| *idx < test_start || *idx >= test_end)
                .map(|(_, t)| *t)
                .collect();

            let mut temp_engine = PredictionEngine::new();
            temp_engine.train_model(location.to_string(), train_features, train_targets);

            let mut mse_sum = 0.0;
            for (feature, target) in test_features.iter().zip(test_targets.iter()) {
                if let Some(result) = temp_engine.predict(location, feature) {
                    mse_sum += (result.predicted_temperature - target).powi(2);
                }
            }

            scores.push(mse_sum / test_features.len() as f64);
        }

        scores
    }
}

#[derive(Debug, Clone)]
pub struct ModelMetrics {
    pub coefficients: Vec<f64>,
    pub intercept: f64,
    pub r_squared: f64,
    pub mse: f64,
}