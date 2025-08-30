// Global variables
let currentRegion = '';
let weatherData = null;

// DOM elements
const regionSelect = document.getElementById('region');
const refreshBtn = document.getElementById('refreshBtn');
const loadingDiv = document.getElementById('loading');
const forecastTable = document.getElementById('forecast-table');
const errorMessage = document.getElementById('error-message');
const regionTitle = document.getElementById('region-title');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateDateHeaders();
    setupLiveCamera();
});

function setupEventListeners() {
    regionSelect.addEventListener('change', function() {
        currentRegion = this.value;
        if (currentRegion) {
            loadRegionForecast(currentRegion);
        } else {
            hideForecastTable();
        }
    });

    refreshBtn.addEventListener('click', function() {
        if (currentRegion) {
            loadRegionForecast(currentRegion);
        }
    });
}

function updateDateHeaders() {
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i - 1);
        const dayElement = document.getElementById(`day-${i}`);
        if (dayElement) {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dayElement.textContent = `${dayName}\n${monthDay}`;
        }
    }
}

async function loadRegionForecast(regionName) {
    showLoading();
    hideError();
    
    try {
        // Get the region coordinates from our regions data
        const regionCoords = await getRegionCoordinates(regionName);
        if (!regionCoords) {
            throw new Error('Region coordinates not found');
        }

        // Fetch detailed weather data for the region
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${regionCoords.lat}&longitude=${regionCoords.lon}&daily=temperature_2m_max,precipitation_sum&timezone=auto&start_date=${getStartDate()}&end_date=${getEndDate()}`);
        
        if (!weatherResponse.ok) {
            throw new Error(`Weather API error: ${weatherResponse.status}`);
        }

        weatherData = await weatherResponse.json();
        displayForecast(regionName, weatherData);
        
    } catch (error) {
        console.error('Failed to load forecast:', error);
        showError('Failed to load weather data. Please try again.');
    }
}

function getRegionCoordinates(regionName) {
    const regions = {
        'Whistler': { lat: 50.1163, lon: -122.9574 },
        'Chamonix': { lat: 45.9237, lon: 6.8694 },
        'Hakuba': { lat: 36.6975, lon: 137.8375 },
        'Aspen': { lat: 39.1911, lon: -106.8175 },
        'Niseko': { lat: 42.8047, lon: 140.6874 },
        'Verbier': { lat: 46.0992, lon: 7.2263 },
        'Bariloche': { lat: -41.1335, lon: -71.3103 },
        'Queenstown': { lat: -45.0312, lon: 168.6626 },
        'Ohau': { lat: -44.2333, lon: 169.8500 }
    };
    return regions[regionName];
}

function getStartDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getEndDate() {
    const today = new Date();
    today.setDate(today.getDate() + 6);
    return today.toISOString().split('T')[0];
}

function displayForecast(regionName, data) {
    const daily = data.daily;
    const temperatures = daily.temperature_2m_max;
    const precipitation = daily.precipitation_sum;
    
    // Update region title
    regionTitle.textContent = `${regionName} - 7-Day Weather Forecast`;
    
    // Populate temperature row
    temperatures.forEach((temp, index) => {
        const tempElement = document.getElementById(`temp-${index + 1}`);
        if (tempElement) {
            tempElement.textContent = `${temp.toFixed(1)}°C`;
            tempElement.style.color = getTemperatureColor(temp);
        }
    });
    
    // Populate precipitation row
    precipitation.forEach((precip, index) => {
        const precipElement = document.getElementById(`precip-${index + 1}`);
        if (precipElement) {
            precipElement.textContent = precip > 0 ? `${precip.toFixed(1)} mm` : '0 mm';
            precipElement.style.color = precip > 0 ? '#1976d2' : '#666';
        }
    });
    
    // Calculate and populate snow forecast row
    const snowForecasts = calculateSnowForecasts(temperatures, precipitation);
    snowForecasts.forEach((snow, index) => {
        const snowElement = document.getElementById(`snow-${index + 1}`);
        if (snowElement) {
            snowElement.textContent = snow > 0 ? `${snow.toFixed(1)} cm` : '0 cm';
            snowElement.style.color = snow > 0 ? '#7b1fa2' : '#666';
            snowElement.style.fontWeight = snow > 0 ? '700' : '400';
        }
    });
    
    // Update summary statistics
    updateSummaryStats(snowForecasts);
    
    // Show the forecast table
    hideLoading();
    showForecastTable();
}

function calculateSnowForecasts(temperatures, precipitation) {
    const snowForecasts = [];
    
    for (let i = 0; i < temperatures.length; i++) {
        const temp = temperatures[i];
        const precip = precipitation[i];
        
        if (precip > 0) {
            let snowCm = 0;
            if (temp < 0) {
                snowCm = precip * 15; // Very cold = more snow
            } else if (temp < 5) {
                snowCm = precip * 10; // Cold = good snow
            } else if (temp < 10) {
                snowCm = precip * 5;  // Cool = possible snow
            }
            snowForecasts.push(snowCm);
        } else {
            snowForecasts.push(0);
        }
    }
    
    return snowForecasts;
}

function updateSummaryStats(snowForecasts) {
    const totalSnow = snowForecasts.reduce((sum, snow) => sum + snow, 0);
    const bestDayIndex = snowForecasts.indexOf(Math.max(...snowForecasts));
    const snowDays = snowForecasts.filter(snow => snow > 0).length;
    const snowProbability = Math.round((snowDays / 7) * 100);
    
    // Update total snowfall
    const totalSnowElement = document.getElementById('total-snow');
    if (totalSnowElement) {
        totalSnowElement.textContent = `${totalSnow.toFixed(1)} cm`;
    }
    
    // Update best snow day
    const bestDayElement = document.getElementById('best-day');
    if (bestDayElement && bestDayIndex >= 0) {
        const bestDate = new Date();
        bestDate.setDate(bestDate.getDate() + bestDayIndex);
        const dayName = bestDate.toLocaleDateString('en-US', { weekday: 'long' });
        bestDayElement.textContent = `${dayName}\n(${snowForecasts[bestDayIndex].toFixed(1)} cm)`;
    }
    
    // Update snow probability
    const probabilityElement = document.getElementById('snow-probability');
    if (probabilityElement) {
        probabilityElement.textContent = `${snowProbability}%`;
    }
}

function getTemperatureColor(temp) {
    if (temp < 0) return '#1976d2';      // Blue for cold
    if (temp < 10) return '#388e3c';     // Green for cool
    if (temp < 20) return '#f57c00';     // Orange for mild
    return '#d32f2f';                    // Red for warm
}

function showLoading() {
    loadingDiv.classList.remove('hidden');
    forecastTable.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

function showForecastTable() {
    forecastTable.classList.remove('hidden');
}

function hideForecastTable() {
    forecastTable.classList.add('hidden');
    loadingDiv.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function showError(message) {
    hideLoading();
    errorMessage.querySelector('p').textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// Live Snow Camera Functions
function setupLiveCamera() {
    // Auto-refresh the camera image every 30 seconds
    setInterval(refreshCameraImage, 30000);
    
    // Add click handler to manually refresh
    const cameraImg = document.getElementById('live-snow-camera');
    if (cameraImg) {
        cameraImg.addEventListener('click', function() {
            refreshCameraImage();
            showCameraRefreshMessage();
        });
    }
}

function refreshCameraImage() {
    const cameraImg = document.getElementById('live-snow-camera');
    if (cameraImg) {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        cameraImg.src = `https://secure.skircr.com/cams2/fecam8/final.jpg?t=${timestamp}`;
    }
}

function showCameraRefreshMessage() {
    const cameraImg = document.getElementById('live-snow-camera');
    if (cameraImg) {
        // Show a brief "refreshing" message
        const originalSrc = cameraImg.src;
        cameraImg.style.opacity = '0.7';
        
        setTimeout(() => {
            cameraImg.style.opacity = '1';
        }, 1000);
    }
}
