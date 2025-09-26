"""
Weather data fetching and processing service.
"""
import requests
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta, timezone
import time
from config import API_CONFIG, WEATHER_CONFIG

logger = logging.getLogger(__name__)

class WeatherService:
    """Service for fetching weather data from various APIs."""
    
    def __init__(self):
        self.open_meteo_url = API_CONFIG["open_meteo_base_url"]
        self.gfs_url = API_CONFIG["gfs_base_url"]
        self.timeout = API_CONFIG["timeout"]
        self.max_retries = API_CONFIG["max_retries"]
        self.elevation = API_CONFIG["elevation"]
    
    def _make_request(self, url: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Make HTTP request with retry logic."""
        for attempt in range(self.max_retries):
            try:
                response = requests.get(url, params=params, timeout=self.timeout)
                response.raise_for_status()
                return response.json()
            except requests.exceptions.RequestException as e:
                logger.warning(f"Request attempt {attempt + 1} failed: {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"All {self.max_retries} attempts failed for URL: {url}")
                    return None
        return None
    
    def fetch_open_meteo_forecast(self, lat: float, lon: float, days: int = 7) -> Optional[Dict[str, Any]]:
        """Fetch forecast data from Open-Meteo API."""
        start_date = datetime.now(timezone.utc).date()
        end_date = start_date + timedelta(days=days-1)
        
        params = {
            "latitude": lat,
            "longitude": lon,
            "elevation": self.elevation,
            "daily": "snowfall_sum,temperature_2m_max,temperature_2m_min,precipitation_sum",
            "timezone": "auto",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
        
        data = self._make_request(self.open_meteo_url, params)
        if data:
            logger.info(f"Successfully fetched Open-Meteo data for {lat}, {lon}")
            return data
        return None
    
    def fetch_gfs_forecast(self, lat: float, lon: float, days: int = 7) -> Optional[Dict[str, Any]]:
        """Fetch forecast data from GFS API."""
        start_date = datetime.now(timezone.utc).date()
        end_date = start_date + timedelta(days=days-1)
        
        params = {
            "latitude": lat,
            "longitude": lon,
            "elevation": self.elevation,
            "daily": "snowfall_sum,temperature_2m_max,temperature_2m_min,precipitation_sum",
            "timezone": "auto",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
        
        data = self._make_request(self.gfs_url, params)
        if data:
            logger.info(f"Successfully fetched GFS data for {lat}, {lon}")
            return data
        return None
    
    def process_snowfall_data(self, data: Dict[str, Any]) -> List[float]:
        """Process snowfall data from API response."""
        if not data or "daily" not in data:
            return [0.0] * WEATHER_CONFIG["forecast_days"]
        
        daily_data = data["daily"]
        snowfall = daily_data.get("snowfall_sum", [])
        
        # Convert from mm to cm (1 cm = 10 mm)
        snowfall_cm = [snow / 10 if snow is not None else 0.0 for snow in snowfall]
        
        # Ensure we have exactly 7 days of data
        while len(snowfall_cm) < WEATHER_CONFIG["forecast_days"]:
            snowfall_cm.append(0.0)
        
        return snowfall_cm[:WEATHER_CONFIG["forecast_days"]]
    
    def get_combined_forecast(self, lat: float, lon: float, days: int = 7) -> Dict[str, Any]:
        """Get combined forecast from both Open-Meteo and GFS."""
        open_meteo_data = self.fetch_open_meteo_forecast(lat, lon, days)
        gfs_data = self.fetch_gfs_forecast(lat, lon, days)
        
        result = {
            "openMeteo": open_meteo_data,
            "gfs": gfs_data,
            "average": []
        }
        
        # Calculate average snowfall
        open_meteo_snow = self.process_snowfall_data(open_meteo_data)
        gfs_snow = self.process_snowfall_data(gfs_data)
        
        for i in range(days):
            avg_snow = (open_meteo_snow[i] + gfs_snow[i]) / 2
            result["average"].append(avg_snow)
        
        return result
    
    def fetch_all_resorts_forecast(self, resorts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fetch forecast data for all ski resorts."""
        results = {}
        
        for resort in resorts:
            try:
                name = resort["name"]
                lat = resort["lat"]
                lon = resort["lon"]
                
                logger.info(f"Fetching forecast for {name}")
                forecast_data = self.get_combined_forecast(lat, lon)
                results[name] = forecast_data
                
                # Add a small delay to avoid rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                logger.error(f"Error fetching forecast for {resort.get('name', 'Unknown')}: {e}")
                results[resort.get("name", "Unknown")] = {
                    "openMeteo": None,
                    "gfs": None,
                    "average": [0.0] * WEATHER_CONFIG["forecast_days"]
                }
        
        return results
