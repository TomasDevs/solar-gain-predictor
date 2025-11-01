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
 * Vypočítá data solární energie na 7 dní
 * @param {number} area - Plocha panelu v m²
 * @param {number} efficiency - Účinnost (0-1)
 * @param {string} orientation - Orientace střechy (south, east, west, north, atd.)
 * @param {Array<number>} sunHoursPerDay - Pole slunečních hodin pro každý den (volitelné)
 * @returns {Array} Pole objektů s daty pro každý den
 */
export function simulateSolarData(area, efficiency, orientation = 'south', sunHoursPerDay = null) {
  // Pokud nejsou poskytnuty sluneční hodiny, použijeme default simulaci
  const defaultSunHours = [5, 6, 7, 6, 5, 4, 3];
  const sunHours = sunHoursPerDay || defaultSunHours;

  // Koeficient orientace
  const orientationFactor = ORIENTATION_FACTORS[orientation] || 1.0;

  // Názvy dnů
  const days = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

  return days.map((day, index) => {
    // Vzorec: energie = plocha_panelu * účinnost * sluneční_hodiny * orientace * 1000
    const sunHoursForDay = sunHours[index] || sunHours[0];
    const energy = area * efficiency * sunHoursForDay * orientationFactor * 1000;

    return {
      day,
      sunHours: Math.round(sunHoursForDay * 10) / 10, // Zaokrouhlíme na 1 des. místo
      energy: Math.round(energy), // Zaokrouhlíme na celé číslo Wh
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
