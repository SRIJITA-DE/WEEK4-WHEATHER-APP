# Weather Application – Srijita De

A fully responsive weather dashboard that fetches real-time weather data from OpenWeatherMap API. Includes current conditions, 5-day forecast, city search, autocomplete, favorites, unit conversion, dark/light mode, and geolocation support.

## Features

- **Current Weather**: Temperature, feels like, humidity, wind, pressure, visibility, clouds.
- **5-Day Forecast**: Daily high/low temperatures, weather icons, descriptions.
- **City Search**: Autocomplete suggestions for major cities.
- **Unit Toggle**: Celsius ↔ Fahrenheit with persistent preference.
- **Favorites**: Save and quickly access favorite cities.
- **Dark/Light Mode**: Toggle themes, saved in localStorage.
- **Geolocation**: Use your current location.
- **Caching**: Weather data cached for 10 minutes to reduce API calls.
- **Responsive**: Optimized for desktop, tablet, and mobile.
- **Error Handling**: User-friendly error messages and loading states.

## Technologies Used

- HTML5, CSS3 (Flexbox, Grid, Variables, Animations)
- Vanilla JavaScript (ES6 Classes, Fetch API, async/await)
- OpenWeatherMap API (free tier)
- Font Awesome Icons
- localStorage for persistence

## Setup Instructions

1. **Get an API Key**: Sign up at [OpenWeatherMap](https://openweathermap.org/api) and get a free API key.

2. **Clone/Download** this repository.

3. **Configure API Key**: Open `js/config.js` and replace `'YOUR_API_KEY'` with your actual API key.

4. **Open `index.html`** in your browser – no build tools required.

5. **Optional**: Deploy to GitHub Pages for live demo.

## File Structure
week4-weather-app/
│── index.html
│── css/
│ ├── style.css
│ ├── weather-icons.css
│ └── responsive.css
│── js/
│ ├── app.js
│ ├── weatherService.js
│ ├── ui.js
│ ├── storage.js
│ └── config.js
│── assets/
│ ├── icons/
│ └── images/
│── README.md
│── .env.example
└── .gitignore

## Usage

- Type a city name in the search bar and press Enter or click the search button.
- Use the unit toggle (°C/°F) to switch temperature scales.
- Click the star icon (favorite) to save a city; click it again to remove.
- Click on any favorite chip to quickly view its weather.
- Use the location button to fetch weather for your current location.
- Toggle dark/light mode with the moon/sun icon.

## API Reference

- Current weather: `api.openweathermap.org/data/2.5/weather`
- 5-day forecast: `api.openweathermap.org/data/2.5/forecast`

All parameters are configured in `config.js`.

## Author

**Srijita De**  
B.Tech Computer Science & Technology (3rd Year)  

## License

© 2026 Srijita De. All rights reserved.
