const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Získá aktuální počasí pro zadané souřadnice
 * @param {number} lat - Zeměpisná šířka
 * @param {number} lon - Zeměpisná délka
 * @returns {Promise<Object>} Data o počasí
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
 * Získá 5denní předpověď počasí
 * @param {number} lat - Zeměpisná šířka
 * @param {number} lon - Zeměpisná délka
 * @returns {Promise<Object>} Předpověď počasí
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
 * Získá souřadnice pro zadané město nebo adresu
 * @param {string} cityName - Název města nebo adresa (např. "Václavské náměstí 1, Praha")
 * @returns {Promise<Object>} Souřadnice města
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
      throw new Error('Město nenalezeno');
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
 * Vyhledá města podle názvu (pro autocomplete)
 * @param {string} query - Hledaný text
 * @param {number} limit - Max počet výsledků (default 5)
 * @returns {Promise<Array>} Pole měst
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

      // Vytvoříme displayName - preferujeme PSČ, pokud není, zobrazíme jen město + země
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
 * Vypočítá průměrné sluneční hodiny z dat o počasí
 * @param {Object} weatherData - Data z weather API
 * @returns {number} Odhadované sluneční hodiny
 */
export function calculateSunHours(weatherData) {
  // Oblačnost v procentech (0-100)
  const cloudiness = weatherData.clouds?.all || 0;

  // Základní sluneční hodiny podle období (zjednodušený výpočet)
  const now = new Date();
  const month = now.getMonth(); // 0-11

  // Průměrné sluneční hodiny podle měsíce (pro střední Evropu)
  const avgSunHoursByMonth = [2, 3, 4, 6, 7, 8, 8, 7, 5, 4, 2, 2];
  const baseSunHours = avgSunHoursByMonth[month];

  // Snížení podle oblačnosti (čím více mraků, tím méně slunce)
  const sunHours = baseSunHours * (1 - cloudiness / 100) + (cloudiness / 100) * 1;

  return Math.max(1, Math.min(12, sunHours)); // Omezeníme mezi 1-12 hodinami
}

/**
 * Vytvoří 5denní predikci slunečních hodin z předpovědi počasí
 * @param {Object} forecastData - Data z forecast API
 * @returns {Array<Object>} Pole objektů s daty pro každý den {date, dayLabel, sunHours}
 */
export function extractSunHoursFromForecast(forecastData) {
  const dailyData = {};

  // Forecast API vrací data po 3 hodinách, potřebujeme seskupit podle dnů
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

  // Zpracujeme pouze prvních 5 dní (OpenWeatherMap free tier limit)
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

    // Vytvoříme popisek dne
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
