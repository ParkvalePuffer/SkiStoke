// Global variables
let weatherData = {};

// DOM elements
const refreshBtn = document.getElementById('refreshBtn');
const loadingDiv = document.getElementById('loading');
const forecastTable = document.getElementById('forecast-table');
const errorMessage = document.getElementById('error-message');
const snowTableBody = document.getElementById('snow-table-body');

// Ski resort data
const skiResorts = [
    { name: 'Whistler', country: 'Canada', lat: 50.1163, lon: -122.9574, elevation: 2000 },
    { name: 'Chamonix', country: 'France', lat: 45.9237, lon: 6.8694, elevation: 2000 },
    { name: 'Hakuba', country: 'Japan', lat: 36.6975, lon: 137.8375, elevation: 2000 },
    { name: 'Aspen', country: 'USA', lat: 39.1911, lon: -106.8175, elevation: 2000 },
    { name: 'Niseko', country: 'Japan', lat: 42.8047, lon: 140.6874, elevation: 2000 },
    { name: 'Verbier', country: 'Switzerland', lat: 46.0992, lon: 7.2263, elevation: 2000 },
    { name: 'Bariloche', country: 'Argentina', lat: -41.1335, lon: -71.3103, elevation: 2000 },
    { name: 'Cardrona', country: 'New Zealand', lat: -44.8500, lon: 168.9500, elevation: 2000 },
    { name: 'Ohau', country: 'New Zealand', lat: -44.2333, lon: 169.8500, elevation: 2000 }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateDateHeaders();
    loadAllForecasts();
});

function setupEventListeners() {
    refreshBtn.addEventListener('click', function() {
        loadAllForecasts();
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

async function loadAllForecasts() {
    showLoading();
    hideError();
    
    try {
        const promises = skiResorts.map(resort => fetchResortForecast(resort));
        await Promise.all(promises);
        
        displayAllForecasts();
        hideLoading();
        
    } catch (error) {
        console.error('Failed to load forecasts:', error);
        showError('Failed to load weather data. Please try again.');
    }
}

async function fetchResortForecast(resort) {
    try {
        const startDate = getStartDate();
        const endDate = getEndDate();
        
        // Try snow data first
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${resort.lat}&longitude=${resort.lon}&elevation=${resort.elevation}&daily=snowfall_sum&timezone=auto&start_date=${startDate}&end_date=${endDate}`
        );
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if we got valid snow data
        if (data.daily && data.daily.snowfall_sum && data.daily.snowfall_sum.some(snow => snow > 0)) {
            weatherData[resort.name] = data;
        } else {
            // Fallback to precipitation + temperature estimation
            const fallbackResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${resort.lat}&longitude=${resort.lon}&elevation=${resort.elevation}&daily=temperature_2m_max,precipitation_sum&timezone=auto&start_date=${startDate}&end_date=${endDate}`
            );
            
            if (!fallbackResponse.ok) {
                throw new Error(`Weather API error: ${fallbackResponse.status}`);
            }
            
            const fallbackData = await fallbackResponse.json();
            weatherData[resort.name] = fallbackData;
        }
        
    } catch (error) {
        console.error(`Failed to fetch data for ${resort.name}:`, error);
        weatherData[resort.name] = null;
    }
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

function displayAllForecasts() {
    // Clear existing table body
    snowTableBody.innerHTML = '';
    
    // Create rows for each resort
    skiResorts.forEach(resort => {
        const row = document.createElement('tr');
        
        // Resort name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'metric-label';
        nameCell.textContent = `${resort.name}, ${resort.country}`;
        row.appendChild(nameCell);
        
        // Snow forecast cells for each day
        const resortData = weatherData[resort.name];
        if (resortData && resortData.daily) {
            if (resortData.daily.snowfall_sum) {
                // Use direct snow data
                const snowfall = resortData.daily.snowfall_sum;
                
                for (let i = 0; i < 7; i++) {
                    const snowCell = document.createElement('td');
                    snowCell.className = 'snow-cell';
                    
                    const snowAmount = snowfall[i] / 10; // Convert mm to cm
                    const snowQuality = getSnowQuality(snowAmount);
                    
                    snowCell.innerHTML = `
                        <div class="snow-amount">${snowAmount.toFixed(1)} cm</div>
                        <div class="snow-bar ${snowQuality}"></div>
                    `;
                    
                    row.appendChild(snowCell);
                }
            } else if (resortData.daily.temperature_2m_max && resortData.daily.precipitation_sum) {
                // Use fallback estimation
                const temperatures = resortData.daily.temperature_2m_max;
                const precipitation = resortData.daily.precipitation_sum;
                
                for (let i = 0; i < 7; i++) {
                    const snowCell = document.createElement('td');
                    snowCell.className = 'snow-cell';
                    
                    const temp = temperatures[i];
                    const precip = precipitation[i];
                    const snowAmount = estimateSnowFromTempPrecip(temp, precip);
                    const snowQuality = getSnowQuality(snowAmount);
                    
                    snowCell.innerHTML = `
                        <div class="snow-amount">${snowAmount.toFixed(1)} cm</div>
                        <div class="snow-bar ${snowQuality}"></div>
                    `;
                    
                    row.appendChild(snowCell);
                }
            } else {
                // Handle missing data
                for (let i = 0; i < 7; i++) {
                    const snowCell = document.createElement('td');
                    snowCell.className = 'snow-cell';
                    snowCell.innerHTML = `
                        <div class="snow-amount">-</div>
                        <div class="snow-bar red"></div>
                    `;
                    row.appendChild(snowCell);
                }
            }
        } else {
            // Handle missing data
            for (let i = 0; i < 7; i++) {
                const snowCell = document.createElement('td');
                snowCell.className = 'snow-cell';
                snowCell.innerHTML = `
                    <div class="snow-amount">-</div>
                    <div class="snow-bar red"></div>
                `;
                row.appendChild(snowCell);
            }
        }
        
        snowTableBody.appendChild(row);
    });
}

function getSnowQuality(snowAmount) {
    if (snowAmount === 0) return 'red';
    if (snowAmount <= 5) return 'orange';
    return 'green';
}

function estimateSnowFromTempPrecip(temp, precip) {
    if (precip <= 0) return 0;
    
    if (temp < 0) {
        return precip * 15; // Very cold = more snow
    } else if (temp < 5) {
        return precip * 10; // Cold = good snow
    } else if (temp < 10) {
        return precip * 5;  // Cool = possible snow
    } else {
        return 0; // Too warm for snow
    }
}

function showLoading() {
    loadingDiv.classList.remove('hidden');
    forecastTable.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
    forecastTable.classList.remove('hidden');
}

function showError(message) {
    hideLoading();
    errorMessage.querySelector('p').textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

