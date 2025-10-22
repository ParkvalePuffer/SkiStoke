/**
 * Google Analytics Configuration for SkiStoke
 * 
 * Instructions:
 * 1. Replace 'GA_MEASUREMENT_ID' with your actual Google Analytics Measurement ID
 * 2. Your Measurement ID looks like: G-XXXXXXXXXX
 * 3. Get your Measurement ID from Google Analytics > Admin > Data Streams
 */

// Replace this with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'GA_MEASUREMENT_ID';

// Google Analytics configuration
window.GA_CONFIG = {
    measurementId: GA_MEASUREMENT_ID,
    
    // Custom event categories
    categories: {
        SEARCH: 'search',
        FORECASTS: 'forecasts', 
        LIVE_FEEDS: 'live_feeds',
        LIVE_CAMERA: 'live_camera',
        NAVIGATION: 'navigation'
    },
    
    // Tracked events
    events: {
        RESORT_SELECTED: 'resort_selected',
        FORECAST_REFRESH: 'forecast_refresh',
        WEBCAM_SWITCH: 'webcam_switch',
        CAMERA_REFRESH: 'camera_refresh',
        FULLSCREEN_VIEW: 'fullscreen_view',
        PAGE_VIEW: 'page_view'
    }
};

// Helper function to track events
function trackEvent(eventName, category, label, value = 1) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
    }
}

// Make tracking function globally available
window.trackEvent = trackEvent;
