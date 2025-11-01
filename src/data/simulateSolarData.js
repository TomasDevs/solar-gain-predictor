/**
 * Simuluje data solární energie na 7 dní
 * @param {number} area - Plocha panelu v m²
 * @param {number} efficiency - Účinnost (0-1)
 * @returns {Array} Pole objektů s daty pro každý den
 */
export function simulateSolarData(area, efficiency) {
  // Simulované sluneční hodiny pro každý den v týdnu
  const sunHoursPerDay = [5, 6, 7, 6, 5, 4, 3];
  const days = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

  return days.map((day, index) => {
    // Vzorec: energie = plocha_panelu * účinnost * sluneční_hodiny * 1000
    const sunHours = sunHoursPerDay[index];
    const energy = area * efficiency * sunHours * 1000;

    return {
      day,
      sunHours,
      energy: Math.round(energy), // Zaokrouhlíme na celé číslo Wh
    };
  });
}
