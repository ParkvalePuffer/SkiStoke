/**
 * SkiStoke Frontend Application
 * Optimized and restructured JavaScript for better performance and maintainability
 */

class SkiStokeApp {
    constructor() {
        this.weatherData = {};
        this.skiResorts = [];
        this.apiBaseUrl = '/api';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        this.init();
    }

    async init() {
        try {
            await this.loadResorts();
            this.setupEventListeners();
            this.updateDateHeaders();
            await this.loadAllForecasts();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application');
        }
    }

    async loadResorts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/resorts`);
            if (response.ok) {
                const data = await response.json();
                this.skiResorts = data.resorts;
            } else {
                throw new Error('Failed to load resorts');
            }
        } catch (error) {
            console.error('Error loading resorts:', error);
            // Fallback to hardcoded resorts if API fails
            this.skiResorts = [
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
        }
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAllForecasts());
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.loadAllForecasts();
            }
        });
    }

    updateDateHeaders() {
        const dayHeaders = document.getElementById('day-headers');
        if (!dayHeaders) return;

        dayHeaders.innerHTML = '';
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const th = document.createElement('th');
            th.className = 'day-header';
            
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            th.innerHTML = `
                <div class="day-name">${dayName}</div>
                <div class="day-date">${monthDay}</div>
            `;
            
            dayHeaders.appendChild(th);
        }
    }

    async loadAllForecasts() {
        this.showLoading();
        this.hideError();

        try {
            const cacheKey = 'forecasts';
            const cachedData = this.getCachedData(cacheKey);
            
            if (cachedData) {
                this.weatherData = cachedData;
                this.displayAllForecasts();
                this.hideLoading();
                return;
            }

            console.log(`Fetching forecasts from: ${this.apiBaseUrl}/forecasts`);
            const response = await fetch(`${this.apiBaseUrl}/forecasts`);
            console.log('Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API response data:', data);
            this.weatherData = data.forecasts;
            console.log('Weather data set:', Object.keys(this.weatherData));
            
            this.setCachedData(cacheKey, this.weatherData);
            this.displayAllForecasts();
            this.hideLoading();

        } catch (error) {
            console.error('Failed to load forecasts:', error);
            this.showError('Failed to load weather data. Please try again.');
            this.hideLoading();
        }
    }

    displayAllForecasts() {
        const snowTableBody = document.getElementById('snow-table-body');
        const summaryGrid = document.getElementById('summary-grid');
        
        console.log('DOM elements found:', {
            snowTableBody: !!snowTableBody,
            summaryGrid: !!summaryGrid,
            weatherData: Object.keys(this.weatherData),
            skiResorts: this.skiResorts.length
        });
        
        if (!snowTableBody) {
            console.error('snow-table-body element not found');
            return;
        }
        
        if (!summaryGrid) {
            console.warn('summary-grid element not found, skipping summary');
        }

        // Clear existing content
        snowTableBody.innerHTML = '';
        if (summaryGrid) {
            summaryGrid.innerHTML = '';
        }

        // Create rows for each resort
        this.skiResorts.forEach(resort => {
            const resortData = this.weatherData[resort.name];
            if (!resortData) {
                console.warn(`No data found for resort: ${resort.name}`);
                return;
            }

            console.log(`Processing data for ${resort.name}:`, resortData);

            const gfsData = this.extractSnowfallData(resortData.gfs);
            const openMeteoData = this.extractSnowfallData(resortData.openMeteo);
            const averageData = this.calculateAverage(gfsData, openMeteoData);

            // Create table rows
            this.createTableRow(resort, 'GFS', gfsData, 'gfs-row', true, snowTableBody);
            this.createTableRow(resort, 'Open-Meteo', openMeteoData, 'openmeteo-row', false, snowTableBody);
            this.createTableRow(resort, 'Average', averageData, 'average-row', false, snowTableBody);

            // Create summary card if summary grid exists
            if (summaryGrid) {
                this.createSummaryCard(resort, averageData, summaryGrid);
            }
        });

        // Animate charts
        setTimeout(() => {
            this.animateSnowCharts();
            if (summaryGrid) {
                this.animateSummaryCharts();
            }
        }, 100);
    }

    extractSnowfallData(data) {
        if (!data || !data.daily || !data.daily.snowfall_sum) {
            return new Array(7).fill(0);
        }
        
        const snowfall = data.daily.snowfall_sum;
        return snowfall.map(snow => snow ? snow / 10 : 0); // Convert mm to cm
    }

    calculateAverage(gfsData, openMeteoData) {
        const average = [];
        for (let i = 0; i < 7; i++) {
            const gfs = gfsData[i] || 0;
            const openMeteo = openMeteoData[i] || 0;
            average[i] = (gfs + openMeteo) / 2;
        }
        return average;
    }

    createTableRow(resort, label, data, rowClass, isFirstRow, container) {
        const row = document.createElement('tr');
        row.className = rowClass;

        // Resort name cell with rowspan for first row only
        if (isFirstRow) {
            const nameCell = document.createElement('td');
            nameCell.className = 'resort-name-cell';
            nameCell.setAttribute('rowspan', '3');
            nameCell.innerHTML = `<h4 class="resort-name">${resort.name}, ${resort.country}</h4>`;
            row.appendChild(nameCell);
        }

        // Forecast cells for each day
        for (let i = 0; i < 7; i++) {
            const forecastCell = document.createElement('td');
            forecastCell.className = 'forecast-cell';
            
            const snowAmount = data[i] || 0;
            const intensityClass = this.getIntensityClass(snowAmount);

            forecastCell.innerHTML = `
                <div class="intensity-bg ${intensityClass}"></div>
                <div class="snow-amount">${snowAmount.toFixed(1)} cm</div>
                <div class="snow-chart" data-snow="${snowAmount}">
                    <div class="chart-bars">
                        <div class="chart-bar"></div>
                        <div class="chart-bar"></div>
                        <div class="chart-bar"></div>
                    </div>
                </div>
                <div class="data-source">${label}</div>
            `;

            row.appendChild(forecastCell);
        }

        container.appendChild(row);
    }

    createSummaryCard(resort, averageData, container) {
        const totalSnow = averageData.reduce((sum, snow) => sum + snow, 0);
        const maxSnow = Math.max(...averageData);
        
        const card = document.createElement('div');
        card.className = 'summary-resort';
        card.innerHTML = `
            <h4>${resort.name}</h4>
            <div class="summary-chart" data-total="${totalSnow}">
                <div class="summary-bar" style="height: ${(totalSnow / maxSnow) * 100}%"></div>
            </div>
            <div class="summary-total">${totalSnow.toFixed(1)} cm</div>
        `;

        container.appendChild(card);
    }

    getIntensityClass(snowAmount) {
        if (snowAmount >= 20) return 'intensity-very-high';
        if (snowAmount >= 15) return 'intensity-high';
        if (snowAmount >= 10) return 'intensity-medium';
        if (snowAmount >= 5) return 'intensity-low';
        return 'intensity-none';
    }

    animateSnowCharts() {
        const charts = document.querySelectorAll('.snow-chart');
        charts.forEach(chart => {
            const snowAmount = parseFloat(chart.dataset.snow);
            const bars = chart.querySelectorAll('.chart-bar');
            
            bars.forEach((bar, index) => {
                const height = Math.min((snowAmount / 20) * 100, 100);
                bar.style.height = `${height}%`;
                bar.style.animationDelay = `${index * 0.1}s`;
            });
        });
    }

    animateSummaryCharts() {
        const charts = document.querySelectorAll('.summary-chart');
        charts.forEach(chart => {
            const total = parseFloat(chart.dataset.total);
            const bar = chart.querySelector('.summary-bar');
            if (bar) {
                bar.style.animation = 'growUp 0.8s ease-out forwards';
            }
        });
    }

    // Cache management
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // UI helpers
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'block';
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    showError(message) {
        const error = document.getElementById('error-message');
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
        }
    }

    hideError() {
        const error = document.getElementById('error-message');
        if (error) error.style.display = 'none';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.skiStokeApp = new SkiStokeApp();
});
