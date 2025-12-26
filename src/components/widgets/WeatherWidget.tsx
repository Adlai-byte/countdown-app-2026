import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw, Thermometer, Wind, Droplets, Eye } from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  weatherCode: number;
  isDay: boolean;
}

interface Location {
  lat: number;
  lon: number;
  name: string;
}

// Weather code to emoji mapping
const getWeatherEmoji = (code: number, isDay: boolean): string => {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 3) return isDay ? '⛅' : '☁️';
  if (code <= 49) return '🌫️';
  if (code <= 59) return '🌧️';
  if (code <= 69) return '🌨️';
  if (code <= 79) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌡️';
};

const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Unknown';
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      // Open-Meteo API - Free, no auth required
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph`
      );

      if (!response.ok) throw new Error('Failed to fetch weather');

      const data = await response.json();
      const current = data.current;

      setWeather({
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        visibility: Math.round(current.visibility / 1609.34), // Convert to miles
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
      });
    } catch {
      setError('Could not fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Get location name using reverse geocoding
        try {
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}`
          );
          const data = await response.json();
          const name = data.results?.[0]?.name || 'Your Location';

          setLocation({ lat: latitude, lon: longitude, name });
          fetchWeather(latitude, longitude);
        } catch {
          setLocation({ lat: latitude, lon: longitude, name: 'Your Location' });
          fetchWeather(latitude, longitude);
        }
      },
      () => {
        setError('Location access denied');
        setLoading(false);
      }
    );
  };

  // Try to get location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('weatherLocation');
    if (savedLocation) {
      const loc = JSON.parse(savedLocation);
      setLocation(loc);
      fetchWeather(loc.lat, loc.lon);
    }
  }, []);

  // Save location when updated
  useEffect(() => {
    if (location) {
      localStorage.setItem('weatherLocation', JSON.stringify(location));
    }
  }, [location]);

  if (!location || !weather) {
    return (
      <Card variant="glass" className="p-6">
        <div className="text-center">
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block mb-4"
              >
                <RefreshCw size={32} className="text-cyan" />
              </motion.div>
              <p className="text-text-secondary">Getting weather...</p>
            </>
          ) : error ? (
            <>
              <div className="text-4xl mb-4">🌡️</div>
              <p className="text-text-secondary mb-4">{error}</p>
              <Button variant="primary" onClick={getLocation}>
                <MapPin size={18} className="mr-2" />
                Allow Location
              </Button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">🌤️</div>
              <h3 className="text-lg font-bold text-text-primary mb-2">NYE Weather</h3>
              <p className="text-text-secondary mb-4">Check the weather for your party!</p>
              <Button variant="primary" onClick={getLocation}>
                <MapPin size={18} className="mr-2" />
                Get My Weather
              </Button>
            </>
          )}
        </div>
      </Card>
    );
  }

  const emoji = getWeatherEmoji(weather.weatherCode, weather.isDay);
  const description = getWeatherDescription(weather.weatherCode);

  return (
    <Card variant="glass" className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-text-muted">
          <MapPin size={14} />
          <span className="text-sm">{location.name}</span>
        </div>
        <button
          onClick={() => fetchWeather(location.lat, location.lon)}
          className="p-1.5 rounded-full hover:bg-surface-elevated transition-colors"
          disabled={loading}
        >
          <RefreshCw size={14} className={`text-text-muted ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Weather */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-5xl font-bold text-text-primary">{weather.temperature}°</span>
            <span className="text-4xl">{emoji}</span>
          </div>
          <p className="text-text-secondary">{description}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Thermometer size={16} className="text-orange-500" />
          <span className="text-text-muted">Feels like</span>
          <span className="text-text-primary ml-auto">{weather.feelsLike}°</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Droplets size={16} className="text-blue-500" />
          <span className="text-text-muted">Humidity</span>
          <span className="text-text-primary ml-auto">{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Wind size={16} className="text-cyan" />
          <span className="text-text-muted">Wind</span>
          <span className="text-text-primary ml-auto">{weather.windSpeed} mph</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Eye size={16} className="text-purple" />
          <span className="text-text-muted">Visibility</span>
          <span className="text-text-primary ml-auto">{weather.visibility} mi</span>
        </div>
      </div>

      {/* NYE Tip */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-text-muted text-center">
          {weather.temperature < 40
            ? '🧥 Bundle up for the midnight countdown!'
            : weather.temperature > 70
            ? '☀️ Perfect weather for an outdoor party!'
            : '👍 Great weather for NYE celebrations!'}
        </p>
      </div>
    </Card>
  );
}
