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
        
        // Fetch both Open-Meteo and GFS data in parallel
        const [openMeteoResponse, gfsResponse] = await Promise.all([
            fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${resort.lat}&longitude=${resort.lon}&elevation=${resort.elevation}&daily=snowfall_sum&timezone=auto&start_date=${startDate}&end_date=${endDate}`
            ),
            fetch(
                `https://api.open-meteo.com/v1/gfs?latitude=${resort.lat}&longitude=${resort.lon}&elevation=${resort.elevation}&daily=snowfall_sum&timezone=auto&start_date=${startDate}&end_date=${endDate}`
            )
        ]);
        
        const openMeteoData = openMeteoResponse.ok ? await openMeteoResponse.json() : null;
        const gfsData = gfsResponse.ok ? await gfsResponse.json() : null;
        
        // Store both datasets
        weatherData[resort.name] = {
            openMeteo: openMeteoData,
            gfs: gfsData,
            resort: resort
        };
        
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
        if (resortData && (resortData.openMeteo || resortData.gfs)) {
            // Get the best available data source
            const dataSource = getBestDataSource(resortData);
            
            if (dataSource && dataSource.daily && dataSource.daily.snowfall_sum) {
                // Use direct snow data
                const snowfall = dataSource.daily.snowfall_sum;
                
                for (let i = 0; i < 7; i++) {
                    const snowCell = document.createElement('td');
                    snowCell.className = 'snow-cell';
                    
                    const snowAmount = snowfall[i]; // Already in cm
                    const snowQuality = getSnowQuality(snowAmount);
                    const dataSourceLabel = getDataSourceLabel(resortData, dataSource);
                    
                    snowCell.innerHTML = `
                        <div class="snow-amount">${snowAmount.toFixed(1)} cm</div>
                        <div class="snow-chart" data-snow="${snowAmount}">
                            <div class="chart-bars">
                                <div class="chart-bar"></div>
                                <div class="chart-bar"></div>
                                <div class="chart-bar"></div>
                            </div>
                        </div>
                        <div class="data-source">${dataSourceLabel}</div>
                    `;
                    
                    row.appendChild(snowCell);
                }
            } else {
                // Fallback to precipitation + temperature estimation
                const fallbackData = resortData.openMeteo || resortData.gfs;
                if (fallbackData && fallbackData.daily && fallbackData.daily.temperature_2m_max && fallbackData.daily.precipitation_sum) {
                    const temperatures = fallbackData.daily.temperature_2m_max;
                    const precipitation = fallbackData.daily.precipitation_sum;
                    
                    for (let i = 0; i < 7; i++) {
                        const snowCell = document.createElement('td');
                        snowCell.className = 'snow-cell';
                        
                        const temp = temperatures[i];
                        const precip = precipitation[i];
                        const snowAmount = estimateSnowFromTempPrecip(temp, precip);
                        const snowQuality = getSnowQuality(snowAmount);
                        const dataSourceLabel = getDataSourceLabel(resortData, fallbackData) + ' (est.)';
                        
                        snowCell.innerHTML = `
                            <div class="snow-amount">${snowAmount.toFixed(1)} cm</div>
                            <div class="snow-bar ${snowQuality}"></div>
                            <div class="data-source">${dataSourceLabel}</div>
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
                            <div class="data-source">No data</div>
                        `;
                        row.appendChild(snowCell);
                    }
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
                    <div class="data-source">No data</div>
                `;
                row.appendChild(snowCell);
            }
        }
        
        snowTableBody.appendChild(row);
    });
    
    // Animate the snow charts
    setTimeout(() => {
        animateSnowCharts();
    }, 100);
}

function animateSnowCharts() {
    const charts = document.querySelectorAll('.snow-chart');
    charts.forEach(chart => {
        const snowAmount = parseFloat(chart.dataset.snow);
        const bars = chart.querySelectorAll('.chart-bar');
        
        // Get color based on total daily snowfall
        const barColor = getSnowChartColor(snowAmount);
        
        bars.forEach((bar, index) => {
            // Simulate different time periods with varying intensities
            let height;
            const timePeriods = ['morning', 'afternoon', 'nighttime'];
            
            if (snowAmount === 0) {
                height = 0;
            } else {
                // Create realistic time-based patterns
                switch(index) {
                    case 0: // Morning (6am-12pm) - often highest activity
                        height = Math.min(100, (snowAmount * 8) + Math.random() * 20);
                        break;
                    case 1: // Afternoon (12pm-6pm) - moderate activity
                        height = Math.min(100, (snowAmount * 6) + Math.random() * 15);
                        break;
                    case 2: // Nighttime (6pm-6am) - variable activity
                        height = Math.min(100, (snowAmount * 7) + Math.random() * 25);
                        break;
                }
            }
            
            bar.style.height = `${height}%`;
            bar.style.backgroundColor = barColor;
            
            // Add time period label
            bar.setAttribute('title', `${timePeriods[index]}: ${height.toFixed(0)}% intensity`);
        });
    });
}

function getSnowChartColor(snowAmount) {
    if (snowAmount === 0) return '#ff6b6b';
    if (snowAmount <= 2) return '#ffa726';
    if (snowAmount <= 5) return '#66bb6a';
    return '#1976d2';
}

function getSnowQuality(snowAmount) {
    if (snowAmount === 0) return 'red';
    if (snowAmount <= 5) return 'orange';
    return 'green';
}

function getBestDataSource(resortData) {
    // Prefer GFS data if available and has snow data
    if (resortData.gfs && resortData.gfs.daily && resortData.gfs.daily.snowfall_sum) {
        return resortData.gfs;
    }
    
    // Fall back to Open-Meteo if GFS doesn't have snow data
    if (resortData.openMeteo && resortData.openMeteo.daily && resortData.openMeteo.daily.snowfall_sum) {
        return resortData.openMeteo;
    }
    
    // Return whichever has data (for fallback estimation)
    return resortData.gfs || resortData.openMeteo;
}

function getDataSourceLabel(resortData, dataSource) {
    if (dataSource === resortData.gfs) {
        return 'GFS';
    } else if (dataSource === resortData.openMeteo) {
        return 'Open-Meteo';
    }
    return 'Unknown';
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

