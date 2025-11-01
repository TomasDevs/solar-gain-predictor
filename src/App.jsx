import { useState } from 'react';
import SolarForm from './components/SolarForm';
import SolarChart from './components/SolarChart';
import { simulateSolarData, getOrientationLabel } from './data/simulateSolarData';
import {
  getCoordinatesByCity,
  getWeatherForecast,
  extractSunHoursFromForecast,
} from './services/weatherService';

function App() {
  const [solarData, setSolarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleFormSubmit = async ({ area, efficiency, orientation, city, useGeolocation }) => {
    setLoading(true);
    setError(null);

    try {
      let coordinates;

      // Získání souřadnic
      if (useGeolocation) {
        // Souřadnice jsou už v city ve formátu "lat, lon"
        const [lat, lon] = city.split(',').map((coord) => parseFloat(coord.trim()));
        coordinates = { lat, lon, name: 'Vaše poloha', country: '' };
      } else {
        // Získání souřadnic podle města
        coordinates = await getCoordinatesByCity(city);
      }

      setLocationInfo(coordinates);

      // Získání předpovědi počasí
      const forecastData = await getWeatherForecast(coordinates.lat, coordinates.lon);

      // Extrakce slunečních hodin z předpovědi
      const sunHoursPerDay = extractSunHoursFromForecast(forecastData);

      // Výpočet solárních dat s reálnými hodnotami
      const data = simulateSolarData(area, efficiency, orientation, sunHoursPerDay);
      setSolarData(data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(
        err.message || 'Nepodařilo se načíst data o počasí. Používám simulovaná data.'
      );

      // Fallback na simulovaná data
      const data = simulateSolarData(area, efficiency, orientation);
      setSolarData(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hlavička */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Solar Gain Predictor
          </h1>
          <p className="text-gray-600">
            Predikce výroby solární energie na základě reálných dat o počasí
          </p>
        </header>

        {/* Formulář */}
        <SolarForm onSubmit={handleFormSubmit} loading={loading} />

        {/* Chybová hláška */}
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p className="font-bold">Upozornění</p>
            <p>{error}</p>
          </div>
        )}

        {/* Info o lokaci */}
        {locationInfo && solarData.length > 0 && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
            <p className="font-bold">📍 Lokace</p>
            <p>
              {locationInfo.name}
              {locationInfo.country && `, ${locationInfo.country}`}
            </p>
            <p className="text-sm mt-1">
              Orientace: {getOrientationLabel(solarData[0]?.orientation)} (
              {Math.round(solarData[0]?.orientationFactor * 100)}% efektivity)
            </p>
          </div>
        )}

        {/* Graf */}
        <SolarChart data={solarData} />

        {/* Statistiky */}
        {solarData.length > 0 && (
          <div className="mt-6 bg-white shadow-md rounded-lg px-8 pt-4 pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Statistiky</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-sm">Celková energie</p>
                <p className="text-2xl font-bold text-blue-600">
                  {solarData.reduce((sum, d) => sum + d.energy, 0).toLocaleString()} Wh
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(solarData.reduce((sum, d) => sum + d.energy, 0) / 1000).toFixed(2)} kWh
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Průměr/den</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    solarData.reduce((sum, d) => sum + d.energy, 0) / solarData.length
                  ).toLocaleString()}{' '}
                  Wh
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(
                    solarData.reduce((sum, d) => sum + d.energy, 0) /
                    solarData.length /
                    1000
                  ).toFixed(2)}{' '}
                  kWh
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Maximum</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.max(...solarData.map((d) => d.energy)).toLocaleString()} Wh
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(Math.max(...solarData.map((d) => d.energy)) / 1000).toFixed(2)} kWh
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
