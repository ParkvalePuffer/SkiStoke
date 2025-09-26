"""
API routes for SkiStoke application.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

from backend.services.weather_service import WeatherService
from backend.models.database import DatabaseManager
from config import SKI_RESORTS, WEATHER_CONFIG

logger = logging.getLogger(__name__)

# Initialize services
weather_service = WeatherService()
db_manager = DatabaseManager()

# Create router
router = APIRouter()

@router.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to SkiStoke API!",
        "version": "1.0.0",
        "endpoints": [
            "/forecasts",
            "/top-snow",
            "/region/{region_name}",
            "/update-forecasts"
        ]
    }

@router.get("/forecasts")
async def get_all_forecasts():
    """Get forecast data for all ski resorts."""
    try:
        logger.info("Fetching forecasts for all resorts")
        forecasts = weather_service.fetch_all_resorts_forecast(SKI_RESORTS)
        return {"forecasts": forecasts}
    except Exception as e:
        logger.error(f"Error fetching forecasts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch forecasts")

@router.get("/top-snow")
async def get_top_snow(
    days: int = Query(3, ge=1, le=14, description="Number of days to look ahead"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results")
):
    """Get top snow regions for specified days."""
    try:
        logger.info(f"Getting top snow for {days} days, limit {limit}")
        results = db_manager.get_top_snow(days, limit)
        return {"top_snow": results}
    except Exception as e:
        logger.error(f"Error getting top snow: {e}")
        raise HTTPException(status_code=500, detail="Failed to get top snow data")

@router.get("/region/{region_name}")
async def get_region_forecast(
    region_name: str,
    days: int = Query(7, ge=1, le=14, description="Number of forecast days")
):
    """Get detailed forecast for a specific region."""
    try:
        # Find the region
        region = next((r for r in SKI_RESORTS if r["name"].lower() == region_name.lower()), None)
        if not region:
            raise HTTPException(status_code=404, detail="Region not found")
        
        logger.info(f"Fetching forecast for {region_name}")
        forecast_data = weather_service.get_combined_forecast(
            region["lat"], 
            region["lon"], 
            days
        )
        
        return {
            "region": region_name,
            "coordinates": {"lat": region["lat"], "lon": region["lon"]},
            "forecast": forecast_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching region forecast: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch region forecast")

@router.post("/update-forecasts")
async def update_forecasts():
    """Update forecast data in the database."""
    try:
        logger.info("Updating forecasts in database")
        updated_count = 0
        
        for region in SKI_RESORTS:
            try:
                # Get forecast data
                forecast_data = weather_service.get_combined_forecast(
                    region["lat"], 
                    region["lon"]
                )
                
                # Calculate total snowfall for the period
                total_snowfall = sum(forecast_data["average"])
                
                # Store in database
                date = datetime.now().date().isoformat()
                if db_manager.insert_forecast(region["name"], date, total_snowfall):
                    updated_count += 1
                
            except Exception as e:
                logger.error(f"Error updating forecast for {region['name']}: {e}")
                continue
        
        return {
            "status": "success",
            "message": f"Updated forecasts for {updated_count} regions",
            "updated_count": updated_count
        }
    except Exception as e:
        logger.error(f"Error updating forecasts: {e}")
        raise HTTPException(status_code=500, detail="Failed to update forecasts")

@router.get("/resorts")
async def get_resorts():
    """Get list of all ski resorts."""
    return {"resorts": SKI_RESORTS}

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test database connection
        db_manager.get_top_snow(1, 1)
        return {"status": "healthy", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")
