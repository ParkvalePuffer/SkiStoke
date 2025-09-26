# ❄️ SkiStoke - Live Snow Forecasts & Mountain Conditions

A professional snow forecasting platform providing real-time weather data, live webcams, and mountain conditions for ski resorts worldwide.

## 🌟 Features

- **Live Snow Forecasts** for 9 major ski regions worldwide
- **7-Day Weather Tables** with GFS and Open-Meteo data comparison
- **Live Snow Camera** with real-time snow depth measurement
- **Professional Design** with responsive mobile layout
- **RESTful API** with FastAPI backend
- **Data Caching** for improved performance
- **Error Handling** and logging

## 🏔️ Supported Regions

- **North America**: Whistler, Aspen
- **Europe**: Chamonix, Verbier
- **Asia**: Niseko, Hakuba
- **South America**: Bariloche
- **Oceania**: Cardrona, Ohau

## 🚀 Live Demo

Visit the live site: [SkiStoke.com](https://skistoke.com)

## 🛠️ Technology Stack

- **Backend**: FastAPI, Python 3.8+
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: SQLite
- **Weather APIs**: Open-Meteo, GFS
- **Hosting**: Netlify
- **Version Control**: Git & GitHub

## 📁 Project Structure

```
SkiStoke/
├── backend/                    # Backend application
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   └── routes.py           # FastAPI routes
│   ├── models/                 # Data models
│   │   ├── __init__.py
│   │   └── database.py         # Database operations
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   └── weather_service.py  # Weather data fetching
│   ├── __init__.py
│   └── main.py                 # FastAPI application
├── js/                         # Frontend JavaScript
│   └── app.js                  # Main application logic
├── index.html                  # Main homepage
├── forecasts.html              # Forecasts page
├── style.css                   # All styling and responsive design
├── config.py                   # Application configuration
├── run.py                      # Application startup script
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## 🔧 Local Development

### Prerequisites
- Python 3.8+
- Modern web browser

### Setup
1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application:
   ```bash
   python run.py
   ```
   Or alternatively:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```
4. Open your browser and navigate to `http://localhost:8000`

## 🌐 Deployment

This project is automatically deployed to [Netlify](https://netlify.com) when changes are pushed to the main branch.

### Manual Deployment
1. Push changes to GitHub
2. Netlify automatically builds and deploys
3. Changes go live within minutes

## 📊 Data Sources

- **Weather Data**: [Open-Meteo API](https://open-meteo.com) and [GFS](https://www.ncep.noaa.gov/products/weather/gfs/)
- **Live Webcams**: Various ski resort webcam feeds
- **Snow Estimation**: Combined data from multiple weather models

## 🎯 Target Audience

- Powder hunters looking for the best snow conditions
- Skiers & snowboarders planning their next trip
- Mountain enthusiasts tracking weather patterns
- Travelers planning ski vacations

## 🔮 Future Enhancements

- More ski fields and webcams
- Snow depth rankings page
- Historical data and trends
- User accounts and favorites
- Push notifications for powder alerts
- Social sharing features
- Mobile app version

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support or questions, please open an issue on GitHub.

---

**Built with ❄️ for powder hunters worldwide!**


