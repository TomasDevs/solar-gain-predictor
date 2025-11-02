/**
 * Coefficients for different roof orientations
 * South = 100%, other directions have lower efficiency
 */
const ORIENTATION_FACTORS = {
  south: 1.0,      // 100% - optimal
  southeast: 0.9,  // 90%
  southwest: 0.9,  // 90%
  east: 0.75,      // 75%
  west: 0.75,      // 75%
  north: 0.5,      // 50% - worst
};

/**
 * Calculates solar energy data
 * @param {number} area - Panel area in m²
 * @param {number} efficiency - Efficiency (0-1)
 * @param {string} orientation - Roof orientation (south, east, west, north, etc.)
 * @param {Array} forecastData - Array of objects from API with {dayLabel, sunHours} or null for simulation
 * @returns {Array} Array of objects with data for each day
 */
export function simulateSolarData(area, efficiency, orientation = 'south', forecastData = null) {
  // Orientation coefficient
  const orientationFactor = ORIENTATION_FACTORS[orientation] || 1.0;

  // If we have real data from API, use it
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

  // Fallback simulation (if API fails) - 5 days
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
 * Gets label for roof orientation
 * @param {string} orientation - Orientation code
 * @returns {string} Label in Czech
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
