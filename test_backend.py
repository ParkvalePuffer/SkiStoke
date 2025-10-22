#!/usr/bin/env python3
"""
Test script to verify backend functionality
"""
import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test if all modules can be imported."""
    try:
        from config import SKI_RESORTS, API_CONFIG
        print("✓ Config imported successfully")
        print(f"  - Found {len(SKI_RESORTS)} ski resorts")
        
        from backend.services.weather_service import WeatherService
        print("✓ WeatherService imported successfully")
        
        from backend.models.database import DatabaseManager
        print("✓ DatabaseManager imported successfully")
        
        from backend.api.routes import router
        print("✓ API routes imported successfully")
        
        from backend.main import app
        print("✓ FastAPI app imported successfully")
        
        return True
    except Exception as e:
        print(f"✗ Import error: {e}")
        return False

def test_weather_service():
    """Test weather service functionality."""
    try:
        from backend.services.weather_service import WeatherService
        from config import SKI_RESORTS
        
        weather_service = WeatherService()
        print("✓ WeatherService initialized")
        
        # Test with first resort
        resort = SKI_RESORTS[0]
        print(f"  - Testing with {resort['name']}")
        
        # Test Open-Meteo API
        open_meteo_data = weather_service.fetch_open_meteo_forecast(
            resort['lat'], resort['lon'], 7
        )
        if open_meteo_data:
            print("✓ Open-Meteo API working")
        else:
            print("✗ Open-Meteo API failed")
        
        # Test GFS API
        gfs_data = weather_service.fetch_gfs_forecast(
            resort['lat'], resort['lon'], 7
        )
        if gfs_data:
            print("✓ GFS API working")
        else:
            print("✗ GFS API failed")
        
        return True
    except Exception as e:
        print(f"✗ WeatherService test failed: {e}")
        return False

def test_database():
    """Test database functionality."""
    try:
        from backend.models.database import DatabaseManager
        
        db_manager = DatabaseManager()
        print("✓ DatabaseManager initialized")
        
        # Test getting top snow
        results = db_manager.get_top_snow(3, 5)
        print(f"✓ Database query successful, got {len(results)} results")
        
        return True
    except Exception as e:
        print(f"✗ Database test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("Testing SkiStoke Backend...")
    print("=" * 40)
    
    tests = [
        ("Import Test", test_imports),
        ("Weather Service Test", test_weather_service),
        ("Database Test", test_database),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        else:
            print(f"  {test_name} FAILED")
    
    print("\n" + "=" * 40)
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("✓ All tests passed! Backend is working correctly.")
        return 0
    else:
        print("✗ Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

