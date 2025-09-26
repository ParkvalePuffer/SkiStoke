import json
import requests
from datetime import datetime, timedelta, timezone

def fetch_snow_forecast(region_name, lat, lon, days=7):
    # Use current date and look forward for forecast
    start_date = datetime.now(timezone.utc).date()
    end_date = start_date + timedelta(days=days-1)
    
    # API call for snow forecast at 2000m elevation
    url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
        f"&elevation=2000&daily=snowfall_sum&timezone=auto&start_date={start_date}&end_date={end_date}"
    )

    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to fetch data for {region_name}: {response.status_code}")
        if response.status_code == 400:
            try:
                error_data = response.json()
                print(f"  API Error: {error_data.get('reason', 'Unknown error')}")
            except:
                print(f"  API Error: {response.text}")
        return 0.0

    data = response.json()
    daily_data = data.get("daily", {})
    snowfall = daily_data.get("snowfall_sum", [])
    
    # Convert from mm to cm (1 cm = 10 mm)
    snowfall_cm = [snow / 10 for snow in snowfall]
    
    total = sum(snowfall_cm)
    print(f"{region_name}: {snowfall_cm} → total: {total:.1f} cm (actual snow forecast at 2000m)")
    return total


def fetch_all_regions(days=7):
    with open("regions.json", "r") as f:
        regions = json.load(f)

    results = []
    for region in regions:
        name = region["name"]
        lat = region["lat"]
        lon = region["lon"]
        total = fetch_snow_forecast(name, lat, lon, days=days)
        results.append({"region": name, "total_snowfall": total})
    return results

