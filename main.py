from fastapi import FastAPI
from typing import Optional
import json
from fetch import fetch_snow_forecast
from db import create_table, insert_forecast, get_top_snow
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

# Allow frontend access (e.g. from browser)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this later to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ski regions from JSON
try:
    with open("regions.json") as f:
        regions = json.load(f)
    print(f"Loaded {len(regions)} regions successfully")
except Exception as e:
    print(f"Error loading regions.json: {e}")
    regions = []

# Ensure database table exists on startup
try:
    create_table()
    print("Database table created/verified successfully")
except Exception as e:
    print(f"Error creating database table: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to Snowcast!"}

@app.post("/update-forecasts")
def update_forecasts():
    """
    Pull fresh snowfall data and save it to the database for the next 7 days.
    """
    for region in regions:
        snowfall = fetch_snow_forecast(region["name"], region["lat"], region["lon"])
        if snowfall:
            date = datetime.now().date().isoformat()
            insert_forecast(region["name"], date, snowfall)
    return {"status": "Forecasts updated successfully."}

@app.get("/top-snow")
def top_snow(days: Optional[int] = 3):
    """
    Return regions sorted by total snowfall from today through `days` into the future.
    """
    results = get_top_snow(days)
    return {"top_snow": results}

@app.get("/region-forecast/{region_name}")
def get_region_forecast(region_name: str):
    """
    Get detailed 7-day forecast for a specific region including temperature, precipitation, and snow estimates.
    """
    # Find the region coordinates
    region = next((r for r in regions if r["name"] == region_name), None)
    if not region:
        return {"error": "Region not found"}
    
    # Fetch fresh forecast data
    snowfall = fetch_snow_forecast(region["name"], region["lat"], region["lon"], 7)
    
    return {
        "region": region_name,
        "coordinates": {"lat": region["lat"], "lon": region["lon"]},
        "total_snowfall": snowfall
    }

