

const CONFIG = {
    API_KEY: 'YOUR_API_KEY',  
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    UNITS: 'metric',         t
    CACHE_DURATION: 10 * 60 * 1000, 
    DEFAULT_CITY: 'London',
    ICON_URL: 'https://openweathermap.org/img/wn/',
    FORECAST_DAYS: 5,
};


const config = Object.freeze(CONFIG);
