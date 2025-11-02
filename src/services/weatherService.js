const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Gets current weather for given coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function getCurrentWeather(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=cz`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

/**
 * Gets 5-day weather forecast
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather forecast
 */
export async function getWeatherForecast(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=cz`
    );

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
}

/**
 * Gets coordinates for given city or address
 * @param {string} cityName - City name or address (e.g. "Václavské náměstí 1, Praha")
 * @returns {Promise<Object>} City coordinates
 */
export async function getCoordinatesByCity(cityName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error('City not found');
    }

    return {
      lat: data[0].lat,
      lon: data[0].lon,
      name: data[0].local_names?.cs || data[0].name,
      country: data[0].country
    };
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    throw error;
  }
}

/**
 * Searches cities by name (for autocomplete)
 * @param {string} query - Search text
 * @param {number} limit - Max number of results (default 5)
 * @returns {Promise<Array>} Array of cities
 */
export async function searchCities(query, limit = 5) {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    return data.map(item => {
      const cityName = item.local_names?.cs || item.name;
      const country = item.country;

      // Create displayName - prefer postal code, if not available, show just city + country
      let displayName = `${cityName}, ${country}`;

      return {
        lat: item.lat,
        lon: item.lon,
        name: cityName,
        country: country,
        state: item.state,
        displayName: displayName
      };
    });
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

/**
 * Calculates average sun hours from weather data
 * @param {Object} weatherData - Data from weather API
 * @returns {number} Estimated sun hours
 */
export function calculateSunHours(weatherData) {
  // Cloudiness in percent (0-100)
  const cloudiness = weatherData.clouds?.all || 0;

  // Base sun hours by season (simplified calculation)
  const now = new Date();
  const month = now.getMonth(); // 0-11

  // Average sun hours by month (for Central Europe)
  const avgSunHoursByMonth = [2, 3, 4, 6, 7, 8, 8, 7, 5, 4, 2, 2];
  const baseSunHours = avgSunHoursByMonth[month];

  // Reduction based on cloudiness (more clouds, less sun)
  const sunHours = baseSunHours * (1 - cloudiness / 100) + (cloudiness / 100) * 1;

  return Math.max(1, Math.min(12, sunHours)); // Limit between 1-12 hours
}

/**
 * Creates 5-day sun hours prediction from weather forecast
 * @param {Object} forecastData - Data from forecast API
 * @returns {Array<Object>} Array of objects with data for each day {date, dayLabel, sunHours}
 */
export function extractSunHoursFromForecast(forecastData) {
  const dailyData = {};

  // Forecast API returns data every 3 hours, we need to group by days
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toLocaleDateString('cs-CZ');

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: date,
        items: []
      };
    }

    dailyData[dateKey].items.push(item);
  });

  // Process only first 5 days (OpenWeatherMap free tier limit)
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  Object.entries(dailyData).slice(0, 5).forEach(([, dayData], index) => {
    const date = dayData.date;
    const avgCloudiness = dayData.items.reduce((sum, item) => sum + (item.clouds?.all || 0), 0) / dayData.items.length;
    const avgTemperature = dayData.items.reduce((sum, item) => sum + (item.main?.temp || 10), 0) / dayData.items.length;

    const month = date.getMonth();
    const avgSunHoursByMonth = [2, 3, 4, 6, 7, 8, 8, 7, 5, 4, 2, 2];
    const baseSunHours = avgSunHoursByMonth[month];

    const sunHours = baseSunHours * (1 - avgCloudiness / 100) + (avgCloudiness / 100) * 1;

    // Create day label
    let dayLabel;
    const dayOfWeek = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'][date.getDay()];
    const dayMonth = `${date.getDate()}.${date.getMonth() + 1}.`;

    if (index === 0) {
      dayLabel = `Dnes (${dayMonth})`;
    } else if (index === 1) {
      dayLabel = `Zítra (${dayMonth})`;
    } else {
      dayLabel = `${dayOfWeek} ${dayMonth}`;
    }

    result.push({
      date: date,
      dayLabel: dayLabel,
      sunHours: Math.max(1, Math.min(12, sunHours)),
      cloudiness: avgCloudiness,
      temperature: avgTemperature
    });
  });

  return result;
}
