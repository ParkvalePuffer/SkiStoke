"""
Configuration settings for SkiStoke application.
"""
import os
from typing import List, Dict, Any

# API Configuration
API_CONFIG = {
    "open_meteo_base_url": "https://api.open-meteo.com/v1/forecast",
    "gfs_base_url": "https://api.open-meteo.com/v1/gfs",
    "timeout": 30,
    "max_retries": 3,
    "elevation": 2000,  # Default elevation for ski resorts
}

# Database Configuration
DATABASE_CONFIG = {
    "database_path": "snowcast.db",
    "backup_interval_hours": 24,
}

# CORS Configuration
CORS_CONFIG = {
    "allow_origins": ["*"],  # In production, specify your frontend domain
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

# Application Configuration
APP_CONFIG = {
    "name": "SkiStoke",
    "version": "1.0.0",
    "description": "Real-time snow forecast application for ski resorts",
    "debug": os.getenv("DEBUG", "False").lower() == "true",
}

# Weather Data Configuration
WEATHER_CONFIG = {
    "forecast_days": 7,
    "default_region": "Whistler",
    "snowfall_units": "cm",
    "temperature_units": "celsius",
}

# Ski Resort Data
SKI_RESORTS = [
    {"name": "Whistler", "country": "Canada", "lat": 50.1163, "lon": -122.9574, "elevation": 2000},
    {"name": "Chamonix", "country": "France", "lat": 45.9237, "lon": 6.8694, "elevation": 2000},
    {"name": "Hakuba", "country": "Japan", "lat": 36.6975, "lon": 137.8375, "elevation": 2000},
    {"name": "Aspen", "country": "USA", "lat": 39.1911, "lon": -106.8175, "elevation": 2000},
    {"name": "Niseko", "country": "Japan", "lat": 42.8047, "lon": 140.6874, "elevation": 2000},
    {"name": "Verbier", "country": "Switzerland", "lat": 46.0992, "lon": 7.2263, "elevation": 2000},
    {"name": "Bariloche", "country": "Argentina", "lat": -41.1335, "lon": -71.3103, "elevation": 2000},
    {"name": "Cardrona", "country": "New Zealand", "lat": -44.8500, "lon": 168.9500, "elevation": 2000},
    {"name": "Ohau", "country": "New Zealand", "lat": -44.2333, "lon": 169.8500, "elevation": 2000},
]

def get_config() -> Dict[str, Any]:
    """Get all configuration settings."""
    return {
        "api": API_CONFIG,
        "database": DATABASE_CONFIG,
        "cors": CORS_CONFIG,
        "app": APP_CONFIG,
        "weather": WEATHER_CONFIG,
        "resorts": SKI_RESORTS,
    }
