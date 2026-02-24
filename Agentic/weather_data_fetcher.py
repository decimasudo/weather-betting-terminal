import asyncio
import aiohttp
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

class WeatherDataFetcher:
    def __init__(self, api_key: str, base_url: str = "https://api.openweathermap.org/data/2.5"):
        self.api_key = api_key
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def fetch_current_weather(self, city: str) -> Dict:
        params = {
            "q": city,
            "appid": self.api_key,
            "units": "metric"
        }
        async with self.session.get(f"{self.base_url}/weather", params=params) as response:
            return await response.json()

    async def fetch_forecast(self, city: str, days: int = 5) -> Dict:
        params = {
            "q": city,
            "appid": self.api_key,
            "units": "metric",
            "cnt": days * 8
        }
        async with self.session.get(f"{self.base_url}/forecast", params=params) as response:
            return await response.json()

    async def fetch_historical_weather(self, city: str, start_date: datetime, end_date: datetime) -> List[Dict]:
        results = []
        current_date = start_date
        while current_date <= end_date:
            timestamp = int(current_date.timestamp())
            params = {
                "q": city,
                "appid": self.api_key,
                "units": "metric",
                "dt": timestamp
            }
            async with self.session.get(f"{self.base_url}/onecall/timemachine", params=params) as response:
                data = await response.json()
                results.append(data)
            current_date += timedelta(days=1)
        return results

    async def batch_fetch_cities(self, cities: List[str]) -> Dict[str, Dict]:
        tasks = [self.fetch_current_weather(city) for city in cities]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return dict(zip(cities, results))

    def parse_weather_data(self, data: Dict) -> Dict:
        return {
            "temperature": data.get("main", {}).get("temp"),
            "humidity": data.get("main", {}).get("humidity"),
            "pressure": data.get("main", {}).get("pressure"),
            "wind_speed": data.get("wind", {}).get("speed"),
            "wind_direction": data.get("wind", {}).get("deg"),
            "description": data.get("weather", [{}])[0].get("description"),
            "visibility": data.get("visibility"),
            "timestamp": data.get("dt")
        }

    async def get_weather_anomalies(self, city: str, threshold: float = 2.0) -> List[Dict]:
        forecast = await self.fetch_forecast(city)
        anomalies = []
        if "list" in forecast:
            temps = [item["main"]["temp"] for item in forecast["list"]]
            avg_temp = sum(temps) / len(temps)
            for item in forecast["list"]:
                temp = item["main"]["temp"]
                if abs(temp - avg_temp) > threshold:
                    anomalies.append({
                        "timestamp": item["dt"],
                        "temperature": temp,
                        "anomaly": temp - avg_temp,
                        "description": item["weather"][0]["description"]
                    })
        return anomalies

    async def monitor_weather_stream(self, cities: List[str], interval: int = 300):
        while True:
            data = await self.batch_fetch_cities(cities)
            yield data
            await asyncio.sleep(interval)