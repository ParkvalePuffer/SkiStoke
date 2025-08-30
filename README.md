# ❄️ SkiStoke - Live Snow Forecasts & Mountain Conditions

A professional snow forecasting platform providing real-time weather data, live webcams, and mountain conditions for ski resorts worldwide.

## 🌟 Features

- **Live Snow Forecasts** for 9 major ski regions worldwide
- **7-Day Weather Tables** with temperature, precipitation, and snow estimates
- **Live Snow Camera** with real-time snow depth measurement
- **Professional Design** with responsive mobile layout
- **Auto-refresh** functionality every 30 seconds

## 🏔️ Supported Regions

- **North America**: Whistler, Aspen
- **Europe**: Chamonix, Verbier
- **Asia**: Niseko, Hakuba
- **South America**: Bariloche
- **Oceania**: Queenstown, Ohau

## 🚀 Live Demo

Visit the live site: [SkiStoke.com](https://skistoke.com)

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Weather API**: Open-Meteo
- **Hosting**: Netlify
- **Version Control**: Git & GitHub

## 📁 Project Structure

```
SkiStoke/
├── index.html              # Main homepage
├── style.css               # All styling and responsive design
├── script.js               # JavaScript functionality
├── live-camera.html        # Live snow camera page
├── main.py                 # FastAPI backend (for local development)
├── fetch.py                # Weather data fetching
├── db.py                   # Database operations
├── regions.json            # Ski region coordinates
└── README.md               # This file
```

## 🔧 Local Development

### Prerequisites
- Python 3.8+
- Modern web browser

### Setup
1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn requests
   ```
3. Run the backend server:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000
   ```
4. Open `index.html` in your browser

## 🌐 Deployment

This project is automatically deployed to [Netlify](https://netlify.com) when changes are pushed to the main branch.

### Manual Deployment
1. Push changes to GitHub
2. Netlify automatically builds and deploys
3. Changes go live within minutes

## 📊 Data Sources

- **Weather Data**: [Open-Meteo API](https://open-meteo.com)
- **Live Webcams**: Various ski resort webcam feeds
- **Snow Estimation**: Custom algorithm based on temperature and precipitation

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
