# Google Analytics Setup Guide for SkiStoke

This guide will help you set up Google Analytics tracking for your SkiStoke snow forecast website.

## 🚀 Quick Setup

### Step 1: Create Google Analytics Account
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring" or "Create Account"
3. Enter your account name (e.g., "SkiStoke Analytics")
4. Choose "Web" as your platform
5. Enter your website URL (e.g., `https://yourdomain.com`)

### Step 2: Get Your Measurement ID
1. In Google Analytics, go to **Admin** (gear icon)
2. Under **Property**, click **Data Streams**
3. Click **Add stream** → **Web**
4. Enter your website URL
5. Copy your **Measurement ID** (looks like `G-XXXXXXXXXX`)

### Step 3: Update Your Website
Replace `GA_MEASUREMENT_ID` in all HTML files with your actual Measurement ID:

**Files to update:**
- `index.html`
- `about.html` 
- `forecasts.html`
- `live-feeds.html`
- `live-camera.html`
- `resort-cardrona.html`
- `resort-whistler.html`

**Find this line in each file:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

**Replace with:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**Also update the config line:**
```html
gtag('config', 'G-XXXXXXXXXX');
```

## 📊 What's Being Tracked

### Page Views
- All page visits are automatically tracked
- Page titles and URLs are captured

### Custom Events

#### 🔍 Search Functionality
- **Event:** `resort_selected`
- **Category:** `search`
- **Triggered:** When user selects a resort from search results
- **Data:** Resort name/slug

#### 🌨️ Forecast Interactions
- **Event:** `forecast_refresh`
- **Category:** `forecasts`
- **Triggered:** When user manually refreshes forecast data
- **Data:** Manual refresh action

#### 📹 Live Camera Features
- **Event:** `webcam_switch`
- **Category:** `live_feeds` / `live_camera`
- **Triggered:** When user switches between different webcams
- **Data:** Selected webcam ID

- **Event:** `camera_refresh`
- **Category:** `live_camera`
- **Triggered:** When user manually refreshes camera feed
- **Data:** Manual refresh action

- **Event:** `fullscreen_view`
- **Category:** `live_camera`
- **Triggered:** When user enters fullscreen mode
- **Data:** Fullscreen mode activation

## 🎯 Analytics Insights You'll Get

### User Behavior
- Most popular pages
- User flow through your site
- Time spent on each page
- Bounce rate and session duration

### Feature Usage
- Which resorts are searched most
- How often users refresh forecasts
- Most popular webcam feeds
- Fullscreen usage patterns

### Geographic Data
- Where your users are located
- Popular regions for snow forecasts

### Device Information
- Desktop vs mobile usage
- Browser preferences
- Screen resolutions

## 🔧 Advanced Configuration

### Enhanced Ecommerce (Optional)
If you plan to add paid features or subscriptions, you can enable enhanced ecommerce tracking.

### Custom Dimensions (Optional)
You can add custom dimensions to track:
- User subscription level
- Favorite resort preferences
- Weather alert subscriptions

### Goals and Conversions
Set up goals to track:
- Newsletter signups
- Resort page visits
- Forecast refresh frequency

## 🛠️ Troubleshooting

### Analytics Not Working?
1. **Check Measurement ID:** Ensure it's correctly replaced in all files
2. **Browser Console:** Open Developer Tools and check for JavaScript errors
3. **Real-time Reports:** Use Google Analytics Real-time reports to test
4. **Ad Blockers:** Some users may have ad blockers that prevent tracking

### Testing Your Setup
1. Go to Google Analytics → **Reports** → **Real-time**
2. Visit your website
3. You should see your visit appear in real-time data

### Common Issues
- **Wrong ID format:** Measurement ID should start with `G-`
- **Missing quotes:** Ensure the ID is properly quoted in the script
- **Caching:** Clear browser cache after making changes

## 📈 Recommended Reports to Monitor

### 1. Audience Overview
- Total users and sessions
- Geographic distribution
- Device and browser usage

### 2. Behavior Flow
- How users navigate through your site
- Most common entry and exit pages

### 3. Events Report
- Custom event tracking data
- Feature usage statistics

### 4. Real-time Reports
- Live user activity
- Current page views

## 🔒 Privacy Considerations

### GDPR Compliance
- Add a cookie consent banner
- Provide opt-out options
- Update your privacy policy

### Data Retention
- Configure data retention settings in Google Analytics
- Consider anonymizing IP addresses

## 📞 Support

If you need help with Google Analytics setup:
1. Check the [Google Analytics Help Center](https://support.google.com/analytics/)
2. Review the [Google Analytics 4 documentation](https://developers.google.com/analytics/devguides/collection/ga4)

---

**Note:** It may take 24-48 hours for data to start appearing in your Google Analytics reports after initial setup.
