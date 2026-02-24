use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::time::{Duration, interval};
use serde::{Serialize, Deserialize};
use rand::prelude::*;
use std::f64::consts::PI;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeatherConditions {
    pub temperature: f64,
    pub humidity: f64,
    pub pressure: f64,
    pub wind_speed: f64,
    pub wind_direction: f64,
    pub precipitation: f64,
}

#[derive(Debug, Clone)]
pub struct AtmosphericModel {
    base_temperature: f64,
    seasonal_amplitude: f64,
    diurnal_amplitude: f64,
    latitude: f64,
    longitude: f64,
    elevation: f64,
}

pub struct WeatherSimulator {
    models: HashMap<String, AtmosphericModel>,
    rng: Mutex<ThreadRng>,
    time_step: Duration,
}

impl WeatherSimulator {
    pub fn new() -> Self {
        Self {
            models: HashMap::new(),
            rng: Mutex::new(thread_rng()),
            time_step: Duration::from_secs(3600),
        }
    }

    pub fn add_location(&mut self, location: String, model: AtmosphericModel) {
        self.models.insert(location, model);
    }

    pub fn simulate_conditions(&self, location: &str, timestamp: i64) -> Option<WeatherConditions> {
        let model = self.models.get(location)?;
        let mut rng = self.rng.lock().unwrap();

        let base_temp = self.calculate_base_temperature(model, timestamp);
        let diurnal_variation = self.calculate_diurnal_variation(model, timestamp);
        let random_noise = rng.gen_range(-2.0..2.0);

        let temperature = base_temp + diurnal_variation + random_noise;

        let humidity = self.calculate_humidity(model, temperature, &mut *rng);
        let pressure = self.calculate_pressure(model, temperature, &mut *rng);
        let wind = self.calculate_wind_conditions(model, &mut *rng);
        let precipitation = self.calculate_precipitation(temperature, humidity, &mut *rng);

        Some(WeatherConditions {
            temperature,
            humidity,
            pressure,
            wind_speed: wind.0,
            wind_direction: wind.1,
            precipitation,
        })
    }

    fn calculate_base_temperature(&self, model: &AtmosphericModel, timestamp: i64) -> f64 {
        let days_since_epoch = timestamp / 86400;
        let seasonal_phase = 2.0 * PI * (days_since_epoch as f64) / 365.25;
        let latitude_factor = (model.latitude * PI / 180.0).cos();

        model.base_temperature + model.seasonal_amplitude * seasonal_phase.sin() * latitude_factor
    }

    fn calculate_diurnal_variation(&self, model: &AtmosphericModel, timestamp: i64) -> f64 {
        let seconds_in_day = timestamp % 86400;
        let hour_angle = 2.0 * PI * (seconds_in_day as f64) / 86400.0;
        model.diurnal_amplitude * (-hour_angle).sin()
    }

    fn calculate_humidity(&self, model: &AtmosphericModel, temperature: f64, rng: &mut ThreadRng) -> f64 {
        let base_humidity = 60.0 + 20.0 * (model.latitude.abs() / 90.0);
        let temp_factor = 1.0 - (temperature - 20.0) / 40.0;
        let noise = rng.gen_range(-10.0..10.0);
        (base_humidity * temp_factor + noise).clamp(0.0, 100.0)
    }

    fn calculate_pressure(&self, model: &AtmosphericModel, temperature: f64, rng: &mut ThreadRng) -> f64 {
        let base_pressure = 1013.25 - model.elevation / 8.5;
        let temp_correction = -0.5 * (temperature - 15.0);
        let noise = rng.gen_range(-5.0..5.0);
        base_pressure + temp_correction + noise
    }

    fn calculate_wind_conditions(&self, model: &AtmosphericModel, rng: &mut ThreadRng) -> (f64, f64) {
        let speed = rng.gen_range(0.0..15.0) + model.elevation / 1000.0;
        let direction = rng.gen_range(0.0..360.0);
        (speed, direction)
    }

    fn calculate_precipitation(&self, temperature: f64, humidity: f64, rng: &mut ThreadRng) -> f64 {
        let temp_factor = if temperature < 0.0 { 0.1 } else { 1.0 };
        let humidity_factor = humidity / 100.0;
        let base_prob = temp_factor * humidity_factor * 0.3;

        if rng.gen_bool(base_prob) {
            rng.gen_range(0.1..10.0)
        } else {
            0.0
        }
    }

    pub async fn run_simulation(&self, locations: Vec<String>) -> tokio::sync::mpsc::Receiver<HashMap<String, WeatherConditions>> {
        let (tx, rx) = tokio::sync::mpsc::channel(100);
        let models = self.models.clone();

        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(60));
            let mut rng = thread_rng();

            loop {
                interval.tick().await;
                let mut results = HashMap::new();

                for location in &locations {
                    if let Some(model) = models.get(location) {
                        let timestamp = std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs() as i64;

                        let conditions = Self::simulate_single_location(model, timestamp, &mut rng);
                        results.insert(location.clone(), conditions);
                    }
                }

                if tx.send(results).await.is_err() {
                    break;
                }
            }
        });

        rx
    }

    fn simulate_single_location(model: &AtmosphericModel, timestamp: i64, rng: &mut ThreadRng) -> WeatherConditions {
        let base_temp = Self::calculate_base_temp_static(model, timestamp);
        let diurnal = Self::calculate_diurnal_static(model, timestamp);
        let noise = rng.gen_range(-2.0..2.0);
        let temperature = base_temp + diurnal + noise;

        let humidity = Self::calculate_humidity_static(model, temperature, rng);
        let pressure = Self::calculate_pressure_static(model, temperature, rng);
        let wind = Self::calculate_wind_static(model, rng);
        let precipitation = Self::calculate_precipitation_static(temperature, humidity, rng);

        WeatherConditions {
            temperature,
            humidity,
            pressure,
            wind_speed: wind.0,
            wind_direction: wind.1,
            precipitation,
        }
    }

    fn calculate_base_temp_static(model: &AtmosphericModel, timestamp: i64) -> f64 {
        let days = timestamp / 86400;
        let phase = 2.0 * PI * (days as f64) / 365.25;
        let lat_factor = (model.latitude * PI / 180.0).cos();
        model.base_temperature + model.seasonal_amplitude * phase.sin() * lat_factor
    }

    fn calculate_diurnal_static(model: &AtmosphericModel, timestamp: i64) -> f64 {
        let seconds = timestamp % 86400;
        let angle = 2.0 * PI * (seconds as f64) / 86400.0;
        model.diurnal_amplitude * (-angle).sin()
    }

    fn calculate_humidity_static(model: &AtmosphericModel, temperature: f64, rng: &mut ThreadRng) -> f64 {
        let base = 60.0 + 20.0 * (model.latitude.abs() / 90.0);
        let temp_factor = 1.0 - (temperature - 20.0) / 40.0;
        let noise = rng.gen_range(-10.0..10.0);
        (base * temp_factor + noise).clamp(0.0, 100.0)
    }

    fn calculate_pressure_static(model: &AtmosphericModel, temperature: f64, rng: &mut ThreadRng) -> f64 {
        let base = 1013.25 - model.elevation / 8.5;
        let correction = -0.5 * (temperature - 15.0);
        let noise = rng.gen_range(-5.0..5.0);
        base + correction + noise
    }

    fn calculate_wind_static(model: &AtmosphericModel, rng: &mut ThreadRng) -> (f64, f64) {
        let speed = rng.gen_range(0.0..15.0) + model.elevation / 1000.0;
        let direction = rng.gen_range(0.0..360.0);
        (speed, direction)
    }

    fn calculate_precipitation_static(temperature: f64, humidity: f64, rng: &mut ThreadRng) -> f64 {
        let temp_factor = if temperature < 0.0 { 0.1 } else { 1.0 };
        let humidity_factor = humidity / 100.0;
        let prob = temp_factor * humidity_factor * 0.3;

        if rng.gen_bool(prob) {
            rng.gen_range(0.1..10.0)
        } else {
            0.0
        }
    }
}