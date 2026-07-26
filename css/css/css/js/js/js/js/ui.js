// ============================================================
// UI Module – rendering and DOM manipulation
// ============================================================

class WeatherUI {
    constructor() {
        this.currentEl = document.getElementById('currentWeather');
        this.forecastEl = document.getElementById('forecast');
        this.extraEl = document.getElementById('extraDetails');
        this.favoritesEl = document.getElementById('favoritesList');
        this.loadingEl = document.getElementById('loadingOverlay');
        this.errorToast = document.getElementById('errorToast');
        this.searchInput = document.getElementById('searchInput');
        this.autocompleteList = document.getElementById('autocompleteList');
        this.unitToggleC = document.getElementById('unitToggle');
        this.unitToggleF = document.getElementById('unitToggleF');
        this.themeToggle = document.getElementById('themeToggle');
        this.geoBtn = document.getElementById('geoLocationBtn');
        this.searchBtn = document.getElementById('searchBtn');

        this.currentUnit = Storage.getUnit() || 'metric';
        this.favorites = Storage.getFavorites();
        this.theme = Storage.getTheme();

        this.bindEvents();
    }

    bindEvents() {
        // Search
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        this.searchInput.addEventListener('input', (e) => {
            this.handleAutocomplete(e.target.value);
        });
        // Close autocomplete on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.autocompleteList.classList.remove('active');
            }
        });

        // Unit toggle
        this.unitToggleC.addEventListener('click', () => this.setUnit('metric'));
        this.unitToggleF.addEventListener('click', () => this.setUnit('imperial'));

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Geolocation
        this.geoBtn.addEventListener('click', () => this.handleGeolocation());

        // Set initial theme
        this.applyTheme(this.theme);
        this.updateUnitButtons();
    }

    // ============================================================
    // Search
    // ============================================================
    handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.showToast('Please enter a city name.');
            return;
        }
        this.autocompleteList.classList.remove('active');
        this.loadCityWeather(query);
    }

    loadCityWeather(city) {
        this.showLoading(true);
        Promise.all([
            weatherService.getCurrentWeather(city),
            weatherService.getForecast(city)
        ])
        .then(([current, forecast]) => {
            this.renderCurrent(current);
            this.renderForecast(forecast);
            this.renderExtra(current);
            this.addToFavorites(city);
            this.showLoading(false);
        })
        .catch((error) => {
            this.showLoading(false);
            this.showToast(error.message || 'City not found. Please try again.');
            console.error(error);
        });
    }

    // ============================================================
    // Autocomplete
    // ============================================================
    handleAutocomplete(query) {
        if (!query || query.length < 2) {
            this.autocompleteList.classList.remove('active');
            return;
        }
        const suggestions = weatherService.getCitySuggestions(query);
        if (suggestions.length === 0) {
            this.autocompleteList.classList.remove('active');
            return;
        }
        this.autocompleteList.innerHTML = suggestions.map(city =>
            `<div class="autocomplete-item" data-city="${city}">${city}</div>`
        ).join('');
        this.autocompleteList.classList.add('active');

        this.autocompleteList.querySelectorAll('.autocomplete-item').forEach(el => {
            el.addEventListener('click', () => {
                const city = el.dataset.city;
                this.searchInput.value = city;
                this.autocompleteList.classList.remove('active');
                this.loadCityWeather(city);
            });
        });
    }

    // ============================================================
    // Rendering Methods
    // ============================================================
    renderCurrent(data) {
        const unit = weatherService.getUnitSymbol();
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const iconCode = data.weather[0].icon;
        const iconUrl = `${CONFIG.ICON_URL}${iconCode}@2x.png`;
        const description = data.weather[0].description;
        const date = new Date(data.dt * 1000);

        const html = `
            <div class="weather-card">
                <div>
                    <div class="location">${data.name}, ${data.sys.country}</div>
                    <div class="timestamp">Last updated: ${date.toLocaleString()}</div>
                    <div class="temp-main">
                        <span class="temp">${temp}${unit}</span>
                        <img src="${iconUrl}" alt="${description}" class="condition-icon" />
                    </div>
                    <div class="condition-text">${description}</div>
                </div>
                <div>
                    <div class="details-grid">
                        <div class="detail-item">
                            <i class="fas fa-thermometer-half"></i>
                            <div><div class="label">Feels Like</div><div class="value">${feelsLike}${unit}</div></div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-tint"></i>
                            <div><div class="label">Humidity</div><div class="value">${data.main.humidity}%</div></div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-wind"></i>
                            <div><div class="label">Wind Speed</div><div class="value">${data.wind.speed} ${weatherService.units === 'metric' ? 'm/s' : 'mph'}</div></div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-compress-alt"></i>
                            <div><div class="label">Pressure</div><div class="value">${data.main.pressure} hPa</div></div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-eye"></i>
                            <div><div class="label">Visibility</div><div class="value">${(data.visibility / 1000).toFixed(1)} km</div></div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-cloud"></i>
                            <div><div class="label">Clouds</div><div class="value">${data.clouds.all}%</div></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.currentEl.innerHTML = html;
    }

    renderForecast(data) {
        // Group by day
        const daily = this.groupForecastByDay(data.list);
        const unit = weatherService.getUnitSymbol();

        let html = '';
        daily.slice(0, CONFIG.FORECAST_DAYS).forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const iconCode = day.weather[0].icon;
            const iconUrl = `${CONFIG.ICON_URL}${iconCode}.png`;
            const tempMax = Math.round(day.main.temp_max);
            const tempMin = Math.round(day.main.temp_min);
            const desc = day.weather[0].description;

            html += `
                <div class="forecast-day">
                    <div class="day-name">${dayName}</div>
                    <img src="${iconUrl}" alt="${desc}" class="forecast-icon" />
                    <div class="forecast-temps">
                        <span class="high">${tempMax}${unit}</span>
                        <span class="low">${tempMin}${unit}</span>
                    </div>
                    <div class="forecast-desc">${desc}</div>
                </div>
            `;
        });
        this.forecastEl.innerHTML = html;
    }

    renderExtra(data) {
        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);

        const html = `
            <div class="extra-detail">
                <i class="fas fa-sunrise"></i>
                <div><div class="extra-label">Sunrise</div><div class="extra-value">${sunrise.toLocaleTimeString()}</div></div>
            </div>
            <div class="extra-detail">
                <i class="fas fa-sunset"></i>
                <div><div class="extra-label">Sunset</div><div class="extra-value">${sunset.toLocaleTimeString()}</div></div>
            </div>
            <div class="extra-detail">
                <i class="fas fa-thermometer-three-quarters"></i>
                <div><div class="extra-label">Min / Max</div><div class="extra-value">${Math.round(data.main.temp_min)} / ${Math.round(data.main.temp_max)} ${weatherService.getUnitSymbol()}</div></div>
            </div>
        `;
        this.extraEl.innerHTML = html;
    }

    // ============================================================
    // Favorites
    // ============================================================
    addToFavorites(city) {
        if (!this.favorites.includes(city)) {
            this.favorites.push(city);
            Storage.saveFavorites(this.favorites);
            this.renderFavorites();
        }
    }

    renderFavorites() {
        this.favorites = Storage.getFavorites();
        if (this.favorites.length === 0) {
            this.favoritesEl.innerHTML = '';
            return;
        }
        let html = '';
        this.favorites.forEach(city => {
            html += `
                <div class="favorite-chip" data-city="${city}">
                    <span>${city}</span>
                    <span class="remove-fav" data-city="${city}"><i class="fas fa-times"></i></span>
                </div>
            `;
        });
        this.favoritesEl.innerHTML = html;

        this.favoritesEl.querySelectorAll('.favorite-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                if (e.target.closest('.remove-fav')) return;
                const city = chip.dataset.city;
                this.searchInput.value = city;
                this.loadCityWeather(city);
            });
        });

        this.favoritesEl.querySelectorAll('.remove-fav').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const city = btn.dataset.city;
                this.favorites = Storage.removeFavorite(city);
                this.renderFavorites();
                this.showToast(`Removed ${city} from favorites.`);
            });
        });
    }

    // ============================================================
    // Unit Toggle
    // ============================================================
    setUnit(unit) {
        this.currentUnit = unit;
        weatherService.setUnit(unit);
        Storage.setUnit(unit);
        this.updateUnitButtons();
        const city = this.searchInput.value.trim();
        if (city) {
            this.loadCityWeather(city);
        }
        this.showToast(`Switched to ${unit === 'metric' ? 'Celsius' : 'Fahrenheit'}`);
    }

    updateUnitButtons() {
        const unit = Storage.getUnit() || 'metric';
        this.unitToggleC.classList.toggle('active', unit === 'metric');
        this.unitToggleF.classList.toggle('active', unit === 'imperial');
    }

    // ============================================================
    // Theme
    // ============================================================
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        this.applyTheme(next);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Storage.setTheme(theme);
        this.theme = theme;
        const icon = this.themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // ============================================================
    // Geolocation
    // ============================================================
    handleGeolocation() {
        if (!navigator.geolocation) {
            this.showToast('Geolocation is not supported by your browser.');
            return;
        }
        this.showLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const url = `${CONFIG.BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=${weatherService.units}&appid=${CONFIG.API_KEY}`;
                fetch(url)
                    .then(res => {
                        if (!res.ok) throw new Error('Location not found');
                        return res.json();
                    })
                    .then(data => {
                        const city = data.name;
                        this.searchInput.value = city;
                        this.loadCityWeather(city);
                        this.showLoading(false);
                    })
                    .catch(err => {
                        this.showLoading(false);
                        this.showToast('Could not get location. Try entering city manually.');
                        console.error(err);
                    });
            },
            (err) => {
                this.showLoading(false);
                this.showToast('Location access denied. Please enter a city manually.');
                console.error(err);
            }
        );
    }

    // ============================================================
    // Utilities
    // ============================================================
    showLoading(show) {
        this.loadingEl.style.display = show ? 'flex' : 'none';
    }

    showToast(message, duration = 4000) {
        const toast = this.errorToast;
        toast.textContent = message;
        toast.style.display = 'block';
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }

    groupForecastByDay(list) {
        const days = {};
        list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!days[date]) {
                days[date] = item;
            }
        });
        return Object.values(days);
    }

    init() {
        this.renderFavorites();
        const defaultCity = CONFIG.DEFAULT_CITY;
        this.searchInput.value = defaultCity;
        this.loadCityWeather(defaultCity);
        const savedUnit = Storage.getUnit();
        if (savedUnit) {
            this.setUnit(savedUnit);
        }
    }
}

// Instantiate UI on load
document.addEventListener('DOMContentLoaded', () => {
    const ui = new WeatherUI();
    ui.init();
    window.ui = ui;
});
