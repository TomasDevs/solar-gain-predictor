/**
 * Open-Meteo API Service for historical weather data
 * https://open-meteo.com/
 * This service gets REAL historical data for free
 */

const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

/**
 * Gets historical weather data from Open-Meteo API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of days back (default 180 = 6 months)
 * @returns {Promise<Array>} Array of objects with historical data
 */
export async function getHistoricalWeather(lat, lon, days = 180) {
  try {
    // Calculate date X days ago
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday (API doesn't provide today)

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    // Format dates to YYYY-MM-DD
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // API parameters
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      start_date: startDateStr,
      end_date: endDateStr,
      daily: 'temperature_2m_mean,cloudcover_mean,sunshine_duration',
      timezone: 'auto',
    });

    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Process data to the format we need
    const historicalData = [];

    for (let i = 0; i < data.daily.time.length; i++) {
      const date = new Date(data.daily.time[i]);
      const month = date.getMonth(); // 0-11
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);

      // Temperature (°C)
      const temperature = data.daily.temperature_2m_mean[i] || 10;

      // Cloudiness (%)
      const cloudiness = data.daily.cloudcover_mean[i] || 50;

      // Sunshine duration in seconds, convert to hours
      const sunshineDuration = data.daily.sunshine_duration[i] || 0;
      const sunHours = sunshineDuration / 3600; // from seconds to hours

      historicalData.push({
        date,
        month,
        dayOfYear,
        temperature,
        cloudiness,
        sunHours: Math.max(0, Math.min(24, sunHours)), // Limit to 0-24h
      });
    }

    return historicalData;
  } catch (error) {
    console.error('Error fetching historical weather from Open-Meteo:', error);
    throw error;
  }
}

/**
 * Checks if data from Open-Meteo is available
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<boolean>} True if data is available
 */
export async function checkDataAvailability(lat, lon) {
  try {
    // Try to get data for last 7 days as a test
    const testDate = new Date();
    testDate.setDate(testDate.getDate() - 7);
    const testDateStr = testDate.toISOString().split('T')[0];

    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      start_date: testDateStr,
      end_date: testDateStr,
      daily: 'temperature_2m_mean',
      timezone: 'auto',
    });

    const response = await fetch(`${BASE_URL}?${params}`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Gets 7-day weather forecast from Open-Meteo Forecast API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Array of objects with forecast for each day
 */
export async function getWeatherForecast(lat, lon) {
  try {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      daily: 'temperature_2m_mean,cloudcover_mean,sunshine_duration',
      timezone: 'auto',
      forecast_days: 7,
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

    if (!response.ok) {
      throw new Error(`Open-Meteo Forecast API error: ${response.status}`);
    }

    const data = await response.json();

    // Process data to the format we need (first 5 days)
    const forecastData = [];

    for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
      const date = new Date(data.daily.time[i]);
      const month = date.getMonth();
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);

      // Temperature (°C)
      const temperature = data.daily.temperature_2m_mean[i] || 10;

      // Cloudiness (%)
      const cloudiness = data.daily.cloudcover_mean[i] || 50;

      // Sunshine duration in seconds, convert to hours
      const sunshineDuration = data.daily.sunshine_duration[i] || 0;
      // Open-Meteo forecast is optimistic, apply 60% correction factor for more realistic estimate
      const sunHours = (sunshineDuration / 3600) * 0.6; // from seconds to hours + correction

      // Create day label
      let dayLabel;
      const dayOfWeek = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'][date.getDay()];
      const dayMonth = `${date.getDate()}.${date.getMonth() + 1}.`;

      if (i === 0) {
        dayLabel = `Dnes (${dayMonth})`;
      } else if (i === 1) {
        dayLabel = `Zítra (${dayMonth})`;
      } else {
        dayLabel = `${dayOfWeek} ${dayMonth}`;
      }

      forecastData.push({
        date,
        month,
        dayOfYear,
        dayLabel,
        temperature,
        cloudiness,
        sunHours: Math.max(0, Math.min(12, sunHours)), // Limit to 0-12h for display
      });
    }

    return forecastData;
  } catch (error) {
    console.error('Error fetching forecast from Open-Meteo:', error);
    throw error;
  }
}
