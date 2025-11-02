/**
 * Koeficienty pro různé orientace střechy
 * Jih = 100%, ostatní směry mají nižší efektivitu
 */
const ORIENTATION_FACTORS = {
  south: 1.0,      // 100% - optimální
  southeast: 0.9,  // 90%
  southwest: 0.9,  // 90%
  east: 0.75,      // 75%
  west: 0.75,      // 75%
  north: 0.5,      // 50% - nejhorší
};

/**
 * Vypočítá data solární energie
 * @param {number} area - Plocha panelu v m²
 * @param {number} efficiency - Účinnost (0-1)
 * @param {string} orientation - Orientace střechy (south, east, west, north, atd.)
 * @param {Array} forecastData - Pole objektů z API s {dayLabel, sunHours} nebo null pro simulaci
 * @returns {Array} Pole objektů s daty pro každý den
 */
export function simulateSolarData(area, efficiency, orientation = 'south', forecastData = null) {
  // Koeficient orientace
  const orientationFactor = ORIENTATION_FACTORS[orientation] || 1.0;

  // Pokud máme reálná data z API, použijeme je
  if (forecastData && Array.isArray(forecastData) && forecastData.length > 0) {
    return forecastData.map((dayData) => {
      const energy = area * efficiency * dayData.sunHours * orientationFactor * 1000;

      return {
        day: dayData.dayLabel,
        sunHours: Math.round(dayData.sunHours * 10) / 10,
        energy: Math.round(energy),
        orientation,
        orientationFactor,
      };
    });
  }

  // Fallback simulace (pokud API selže) - 5 dní
  const defaultSunHours = [5, 6, 7, 6, 5];
  const today = new Date();

  return defaultSunHours.map((sunHours, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);

    let dayLabel;
    const dayOfWeek = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'][date.getDay()];
    const dayMonth = `${date.getDate()}.${date.getMonth() + 1}.`;

    if (index === 0) {
      dayLabel = `Dnes ${dayMonth}`;
    } else if (index === 1) {
      dayLabel = `Zítra ${dayMonth}`;
    } else {
      dayLabel = `${dayOfWeek} ${dayMonth}`;
    }

    const energy = area * efficiency * sunHours * orientationFactor * 1000;

    return {
      day: dayLabel,
      sunHours: Math.round(sunHours * 10) / 10,
      energy: Math.round(energy),
      orientation,
      orientationFactor,
    };
  });
}

/**
 * Získá popisek pro orientaci střechy
 * @param {string} orientation - Kód orientace
 * @returns {string} Popisek v češtině
 */
export function getOrientationLabel(orientation) {
  const labels = {
    south: 'Jih',
    southeast: 'Jihovýchod',
    southwest: 'Jihozápad',
    east: 'Východ',
    west: 'Západ',
    north: 'Sever',
  };

  return labels[orientation] || orientation;
}
