import json
import requests
from datetime import datetime, timedelta, timezone

def fetch_snow_forecast(region_name, lat, lon, days=7):
    # Use current date and look forward for forecast
    start_date = datetime.now(timezone.utc).date()
    end_date = start_date + timedelta(days=days-1)
    url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
        f"&daily=temperature_2m_max,precipitation_sum&timezone=auto&start_date={start_date}&end_date={end_date}"
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
    temperatures = daily_data.get("temperature_2m_max", [])
    precipitation = daily_data.get("precipitation_sum", [])
    
    # Estimate snow: more realistic thresholds for different temperature ranges
    estimated_snow = []
    for temp, precip in zip(temperatures, precipitation):
        if precip > 0:  # Only consider days with precipitation
            if temp < 0:  # Below freezing = definitely snow
                snow_cm = precip * 15  # 1mm rain ≈ 15cm snow when very cold
            elif temp < 5:  # 0-5°C = likely snow/mixed
                snow_cm = precip * 10  # 1mm rain ≈ 10cm snow when cold
            elif temp < 10:  # 5-10°C = possible snow at elevation
                snow_cm = precip * 5   # 1mm rain ≈ 5cm snow when cool
            else:  # Above 10°C = unlikely to be snow
                snow_cm = 0.0
            estimated_snow.append(snow_cm)
        else:
            estimated_snow.append(0.0)
    
    total = sum(estimated_snow)
    print(f"{region_name}: {estimated_snow} → total: {total:.1f} cm (estimated from temp/precip)")
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

