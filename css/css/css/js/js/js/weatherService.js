
class WeatherService {
    constructor() {
        this.apiKey = CONFIG.API_KEY;
        this.baseUrl = CONFIG.BASE_URL;
        this.cache = Storage;
        this.units = CONFIG.UNITS;
    }

    // Public methods
    async getCurrentWeather(city) {
        const cacheKey = `current_${city.toLowerCase()}`;
        const cached = this.cache.getCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&units=${this.units}&appid=${this.apiKey}`;
            const response = await fetch(url);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `HTTP ${response.status}`);
            }
            const data = await response.json();
            this.cache.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('WeatherService.current error:', error);
            throw error;
        }
    }

    async getForecast(city) {
        const cacheKey = `forecast_${city.toLowerCase()}`;
        const cached = this.cache.getCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&units=${this.units}&appid=${this.apiKey}`;
            const response = await fetch(url);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `HTTP ${response.status}`);
            }
            const data = await response.json();
            this.cache.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('WeatherService.forecast error:', error);
            throw error;
        }
    }

    // For autocomplete – we use a static list of popular cities
    getCitySuggestions(query) {
        const cityList = [
            'London', 'New York', 'Tokyo', 'Paris', 'Berlin', 'Sydney',
            'Moscow', 'Dubai', 'Singapore', 'Hong Kong', 'Mumbai',
            'Shanghai', 'Los Angeles', 'Chicago', 'Toronto', 'Mexico City',
            'Cairo', 'Rome', 'Barcelona', 'Amsterdam', 'Vienna',
            'Seoul', 'Bangkok', 'Kuala Lumpur', 'San Francisco',
            'Washington', 'Boston', 'Atlanta', 'Denver', 'Phoenix',
            'Melbourne', 'Perth', 'Auckland', 'Beijing', 'Delhi',
            'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune',
        ];
        const q = query.toLowerCase().trim();
        if (!q) return [];
        return cityList.filter(city => city.toLowerCase().includes(q));
    }

    // Change unit
    setUnit(unit) {
        this.units = unit;
        Storage.setUnit(unit);
    }

    // Get unit symbol
    getUnitSymbol() {
        return this.units === 'metric' ? '°C' : '°F';
    }

    // Convert temperature (if needed)
    convertTemp(temp, unit) {
        if (unit === 'imperial') {
            return Math.round((temp * 9/5) + 32);
        }
        return Math.round(temp);
    }
}

// Singleton instance
const weatherService = new WeatherService();
