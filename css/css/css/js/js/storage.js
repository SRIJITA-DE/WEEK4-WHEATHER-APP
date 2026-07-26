const Storage = {
    // Favorites
    getFavorites() {
        try {
            const data = localStorage.getItem('weather_favorites');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    saveFavorites(favorites) {
        localStorage.setItem('weather_favorites', JSON.stringify(favorites));
    },

    addFavorite(city) {
        const favs = this.getFavorites();
        if (!favs.includes(city)) {
            favs.push(city);
            this.saveFavorites(favs);
        }
        return favs;
    },

    removeFavorite(city) {
        let favs = this.getFavorites();
        favs = favs.filter(c => c !== city);
        this.saveFavorites(favs);
        return favs;
    },

    // Cache
    getCache(key) {
        try {
            const raw = localStorage.getItem(`weather_cache_${key}`);
            if (!raw) return null;
            const { data, timestamp } = JSON.parse(raw);
            const now = Date.now();
            if (now - timestamp > CONFIG.CACHE_DURATION) {
                localStorage.removeItem(`weather_cache_${key}`);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    },

    setCache(key, data) {
        const payload = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(`weather_cache_${key}`, JSON.stringify(payload));
    },

    // Theme
    getTheme() {
        return localStorage.getItem('weather_theme') || 'light';
    },

    setTheme(theme) {
        localStorage.setItem('weather_theme', theme);
    },

    // Unit preference
    getUnit() {
        return localStorage.getItem('weather_unit') || 'metric';
    },

    setUnit(unit) {
        localStorage.setItem('weather_unit', unit);
    },
};
