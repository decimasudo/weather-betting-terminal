use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use rayon::prelude::*;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeatherDataPoint {
    pub timestamp: i64,
    pub location: String,
    pub temperature: f64,
    pub humidity: f64,
    pub pressure: f64,
    pub wind_speed: f64,
    pub wind_direction: f64,
    pub precipitation: f64,
}

#[derive(Debug)]
pub struct ProcessedData {
    pub location: String,
    pub average_temperature: f64,
    pub max_temperature: f64,
    pub min_temperature: f64,
    pub temperature_trend: f64,
    pub humidity_average: f64,
    pub pressure_average: f64,
    pub wind_average: f64,
    pub precipitation_total: f64,
    pub data_points: usize,
}

pub struct DataProcessor {
    data_cache: Arc<RwLock<HashMap<String, Vec<WeatherDataPoint>>>>,
    processing_stats: Arc<RwLock<ProcessingStats>>,
}

#[derive(Debug, Default)]
struct ProcessingStats {
    total_processed: u64,
    average_processing_time: Duration,
    last_update: Instant,
}

impl DataProcessor {
    pub fn new() -> Self {
        Self {
            data_cache: Arc::new(RwLock::new(HashMap::new())),
            processing_stats: Arc::new(RwLock::new(ProcessingStats::default())),
        }
    }

    pub async fn add_data_point(&self, point: WeatherDataPoint) {
        let mut cache = self.data_cache.write().await;
        cache.entry(point.location.clone())
            .or_insert_with(Vec::new)
            .push(point);
    }

    pub async fn add_batch_data(&self, points: Vec<WeatherDataPoint>) {
        let mut cache = self.data_cache.write().await;
        for point in points {
            cache.entry(point.location.clone())
                .or_insert_with(Vec::new)
                .push(point);
        }
    }

    pub async fn process_location_data(&self, location: &str) -> Option<ProcessedData> {
        let start_time = Instant::now();
        let cache = self.data_cache.read().await;
        let data = cache.get(location)?;

        if data.is_empty() {
            return None;
        }

        let processed = self.process_data_parallel(data.clone());
        let processing_time = start_time.elapsed();

        let mut stats = self.processing_stats.write().await;
        stats.total_processed += 1;
        stats.average_processing_time = (stats.average_processing_time + processing_time) / 2;
        stats.last_update = Instant::now();

        Some(processed)
    }

    fn process_data_parallel(&self, data: Vec<WeatherDataPoint>) -> ProcessedData {
        let location = data[0].location.clone();
        let data_points = data.len();

        let temperatures: Vec<f64> = data.par_iter().map(|d| d.temperature).collect();
        let humidities: Vec<f64> = data.par_iter().map(|d| d.humidity).collect();
        let pressures: Vec<f64> = data.par_iter().map(|d| d.pressure).collect();
        let wind_speeds: Vec<f64> = data.par_iter().map(|d| d.wind_speed).collect();
        let precipitations: Vec<f64> = data.par_iter().map(|d| d.precipitation).collect();

        let average_temperature = temperatures.par_iter().sum::<f64>() / data_points as f64;
        let max_temperature = temperatures.par_iter().cloned().reduce(|| f64::NEG_INFINITY, f64::max);
        let min_temperature = temperatures.par_iter().cloned().reduce(|| f64::INFINITY, f64::min);

        let temperature_trend = self.calculate_trend(&temperatures);

        let humidity_average = humidities.par_iter().sum::<f64>() / data_points as f64;
        let pressure_average = pressures.par_iter().sum::<f64>() / data_points as f64;
        let wind_average = wind_speeds.par_iter().sum::<f64>() / data_points as f64;
        let precipitation_total = precipitations.par_iter().sum::<f64>();

        ProcessedData {
            location,
            average_temperature,
            max_temperature,
            min_temperature,
            temperature_trend,
            humidity_average,
            pressure_average,
            wind_average,
            precipitation_total,
            data_points,
        }
    }

    fn calculate_trend(&self, values: &[f64]) -> f64 {
        if values.len() < 2 {
            return 0.0;
        }

        let n = values.len() as f64;
        let x_sum: f64 = (0..values.len()).map(|i| i as f64).sum();
        let y_sum: f64 = values.iter().sum();
        let xy_sum: f64 = values.iter().enumerate().map(|(i, &y)| i as f64 * y).sum();
        let x_squared_sum: f64 = (0..values.len()).map(|i| (i as f64).powi(2)).sum();

        let slope = (n * xy_sum - x_sum * y_sum) / (n * x_squared_sum - x_sum.powi(2));
        slope
    }

    pub async fn get_processing_stats(&self) -> ProcessingStats {
        self.processing_stats.read().await.clone()
    }

    pub async fn clear_old_data(&self, max_age_seconds: i64) {
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        let mut cache = self.data_cache.write().await;
        for data in cache.values_mut() {
            data.retain(|point| current_time - point.timestamp < max_age_seconds);
        }
    }

    pub async fn get_location_summary(&self) -> HashMap<String, usize> {
        let cache = self.data_cache.read().await;
        cache.iter()
            .map(|(location, data)| (location.clone(), data.len()))
            .collect()
    }

    pub async fn export_data(&self, location: &str, format: ExportFormat) -> Option<String> {
        let cache = self.data_cache.read().await;
        let data = cache.get(location)?;

        match format {
            ExportFormat::Json => serde_json::to_string(data).ok(),
            ExportFormat::Csv => self.export_to_csv(data),
        }
    }

    fn export_to_csv(&self, data: &[WeatherDataPoint]) -> Option<String> {
        let mut csv = String::from("timestamp,location,temperature,humidity,pressure,wind_speed,wind_direction,precipitation\n");

        for point in data {
            csv.push_str(&format!(
                "{},{},{},{},{},{},{},{}\n",
                point.timestamp,
                point.location,
                point.temperature,
                point.humidity,
                point.pressure,
                point.wind_speed,
                point.wind_direction,
                point.precipitation
            ));
        }

        Some(csv)
    }

    pub async fn find_anomalies(&self, location: &str, threshold: f64) -> Vec<WeatherDataPoint> {
        let cache = self.data_cache.read().await;
        let data = cache.get(location)?;

        if data.len() < 10 {
            return Vec::new();
        }

        let temperatures: Vec<f64> = data.iter().map(|d| d.temperature).collect();
        let mean = temperatures.iter().sum::<f64>() / temperatures.len() as f64;
        let std_dev = (temperatures.iter().map(|t| (t - mean).powi(2)).sum::<f64>() / temperatures.len() as f64).sqrt();

        data.iter()
            .filter(|point| (point.temperature - mean).abs() > threshold * std_dev)
            .cloned()
            .collect()
    }

    pub async fn interpolate_missing_data(&self, location: &str) -> Vec<WeatherDataPoint> {
        let cache = self.data_cache.read().await;
        let data = cache.get(location)?;

        if data.len() < 2 {
            return data.clone();
        }

        let mut interpolated = Vec::new();
        let mut sorted_data = data.clone();
        sorted_data.sort_by_key(|d| d.timestamp);

        for i in 0..sorted_data.len() - 1 {
            interpolated.push(sorted_data[i].clone());

            let time_diff = sorted_data[i + 1].timestamp - sorted_data[i].timestamp;
            if time_diff > 3600 {
                let steps = (time_diff / 3600) as usize;
                for step in 1..steps {
                    let ratio = step as f64 / steps as f64;
                    let interpolated_point = WeatherDataPoint {
                        timestamp: sorted_data[i].timestamp + (step as i64 * 3600),
                        location: sorted_data[i].location.clone(),
                        temperature: sorted_data[i].temperature + ratio * (sorted_data[i + 1].temperature - sorted_data[i].temperature),
                        humidity: sorted_data[i].humidity + ratio * (sorted_data[i + 1].humidity - sorted_data[i].humidity),
                        pressure: sorted_data[i].pressure + ratio * (sorted_data[i + 1].pressure - sorted_data[i].pressure),
                        wind_speed: sorted_data[i].wind_speed + ratio * (sorted_data[i + 1].wind_speed - sorted_data[i].wind_speed),
                        wind_direction: sorted_data[i].wind_direction,
                        precipitation: 0.0,
                    };
                    interpolated.push(interpolated_point);
                }
            }
        }

        if !sorted_data.is_empty() {
            interpolated.push(sorted_data.last().unwrap().clone());
        }

        interpolated
    }
}

#[derive(Debug, Clone)]
pub enum ExportFormat {
    Json,
    Csv,
}