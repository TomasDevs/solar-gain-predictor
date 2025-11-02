/**
 * Open-Meteo API Service pro historická data počasí
 * https://open-meteo.com/
 * Tento service získává REÁLNÁ historická data zdarma
 */

const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

/**
 * Získá historická data počasí z Open-Meteo API
 * @param {number} lat - Zeměpisná šířka
 * @param {number} lon - Zeměpisná délka
 * @param {number} days - Počet dní zpět (default 180 = 6 měsíců)
 * @returns {Promise<Array>} Pole objektů s historickými daty
 */
export async function getHistoricalWeather(lat, lon, days = 180) {
  try {
    // Vypočítáme datum před X dny
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Včerejší den (API neposkytuje dnešní den)

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    // Formátujeme datumy na YYYY-MM-DD
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Parametry pro API
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

    // Zpracujeme data do formátu, který potřebujeme
    const historicalData = [];

    for (let i = 0; i < data.daily.time.length; i++) {
      const date = new Date(data.daily.time[i]);
      const month = date.getMonth(); // 0-11
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);

      // Teplota (°C)
      const temperature = data.daily.temperature_2m_mean[i] || 10;

      // Oblačnost (%)
      const cloudiness = data.daily.cloudcover_mean[i] || 50;

      // Sluneční svit v sekundách, převedeme na hodiny
      const sunshineDuration = data.daily.sunshine_duration[i] || 0;
      const sunHours = sunshineDuration / 3600; // z sekund na hodiny

      historicalData.push({
        date,
        month,
        dayOfYear,
        temperature,
        cloudiness,
        sunHours: Math.max(0, Math.min(24, sunHours)), // Omezíme 0-24h
      });
    }

    return historicalData;
  } catch (error) {
    console.error('Error fetching historical weather from Open-Meteo:', error);
    throw error;
  }
}

/**
 * Ověří, zda jsou data z Open-Meteo dostupná
 * @param {number} lat - Zeměpisná šířka
 * @param {number} lon - Zeměpisná délka
 * @returns {Promise<boolean>} True pokud jsou data dostupná
 */
export async function checkDataAvailability(lat, lon) {
  try {
    // Zkusíme získat data za poslední 7 dní jako test
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
 * Získá 7denní předpověď počasí z Open-Meteo Forecast API
 * @param {number} lat - Zeměpisná šířka
 * @param {number} lon - Zeměpisná délka
 * @returns {Promise<Array>} Pole objektů s předpovědí pro každý den
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

    // Zpracujeme data do formátu, který potřebujeme (prvních 5 dní)
    const forecastData = [];

    for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
      const date = new Date(data.daily.time[i]);
      const month = date.getMonth();
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);

      // Teplota (°C)
      const temperature = data.daily.temperature_2m_mean[i] || 10;

      // Oblačnost (%)
      const cloudiness = data.daily.cloudcover_mean[i] || 50;

      // Sluneční svit v sekundách, převedeme na hodiny
      const sunshineDuration = data.daily.sunshine_duration[i] || 0;
      // Open-Meteo forecast bývá optimistický, aplikujeme 60% korekční faktor pro reálnější odhad
      const sunHours = (sunshineDuration / 3600) * 0.6; // z sekund na hodiny + korekce

      // Vytvoříme popisek dne
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
        sunHours: Math.max(0, Math.min(12, sunHours)), // Omezíme na 0-12h pro zobrazení
      });
    }

    return forecastData;
  } catch (error) {
    console.error('Error fetching forecast from Open-Meteo:', error);
    throw error;
  }
}
