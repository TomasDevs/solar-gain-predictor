import { useState } from 'react';
import SolarForm from './components/SolarForm';
import SolarChart from './components/SolarChart';
import { simulateSolarData, getOrientationLabel } from './data/simulateSolarData';
import {
  getCoordinatesByCity,
} from './services/weatherService';
import { getWeatherForecast } from './services/openMeteoService';
import { createAndTrainModel, createAIPrediction } from './services/aiModel';

function App() {
  const [solarData, setSolarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
  const [error, setError] = useState(null);
  const [aiModel, setAiModel] = useState(null);
  const [aiTraining, setAiTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [forecastRawData, setForecastRawData] = useState(null);

  const handleTrainAndPredict = async () => {
    if (!forecastRawData || !locationInfo) {
      alert('Nejprve vypočítejte predikci energie pomocí formuláře');
      return;
    }

    setAiTraining(true);
    setTrainingProgress(null);

    try {
      // Trénování modelu s progress callbackem a reálnými historickými daty
      const model = await createAndTrainModel(
        locationInfo.lat,
        locationInfo.lon,
        (progress) => {
          setTrainingProgress(progress);
        }
      );

      setAiModel(model);

      // Vytvoření AI predikce
      const prediction = createAIPrediction(model, forecastRawData);
      setAiPrediction(prediction);

      setTrainingProgress(null);
    } catch (err) {
      console.error('Error training AI model:', err);
      setError('Nepodařilo se natrénovat AI model: ' + err.message);
    } finally {
      setAiTraining(false);
    }
  };

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

      // Získání předpovědi počasí z Open-Meteo API (vrací už zpracovaná data)
      const forecastData = await getWeatherForecast(coordinates.lat, coordinates.lon);
      setForecastRawData(forecastData); // Uložíme pro AI predikci

      // Výpočet solárních dat s reálnými hodnotami z Open-Meteo
      const data = simulateSolarData(area, efficiency, orientation, forecastData);
      setSolarData(data);

      // Reset AI predikce při nových datech
      setAiPrediction(null);
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

        {/* AI Training & Prediction */}
        {solarData.length > 0 && (
          <div className="mt-6 bg-white shadow-md rounded-lg px-8 pt-6 pb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              🤖 AI Predikce slunečních hodin
            </h3>

            <div className="mb-4">
              <button
                onClick={handleTrainAndPredict}
                disabled={aiTraining || loading}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer w-full md:w-auto"
              >
                {aiTraining ? 'Trénuji model...' : aiModel ? 'Přetrénovat & Predikovat' : 'Natrénovat & Predikovat'}
              </button>
            </div>

            {trainingProgress && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Trénování modelu: Epoch {trainingProgress.epoch}/{trainingProgress.totalEpochs}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(trainingProgress.epoch / trainingProgress.totalEpochs) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Loss: {trainingProgress.loss?.toFixed(4)} | Val Loss: {trainingProgress.valLoss?.toFixed(4)}
                </p>
              </div>
            )}

            {aiPrediction && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  Porovnání: Skutečnost vs. AI Predikce
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                          Den
                        </th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                          Skutečnost (h)
                        </th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                          AI Predikce (h)
                        </th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                          Rozdíl
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiPrediction.map((item, index) => {
                        const diff = item.aiSunHours - item.sunHours;
                        const diffPercent = ((diff / item.sunHours) * 100).toFixed(1);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b text-sm text-gray-700">
                              {item.day}
                            </td>
                            <td className="py-2 px-4 border-b text-sm text-gray-700">
                              {item.sunHours}
                            </td>
                            <td className="py-2 px-4 border-b text-sm text-purple-600 font-semibold">
                              {item.aiSunHours}
                            </td>
                            <td className={`py-2 px-4 border-b text-sm font-medium ${
                              diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)} ({diffPercent > 0 ? '+' : ''}{diffPercent}%)
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  💡 AI model natrénovaný na 180 dnech historických dat (6 měsíců) predikuje sluneční hodiny na základě
                  naučených vzorců z minulosti. Porovnává se s aktuální předpovědí z Open-Meteo API pro {locationInfo?.name}.
                </p>
              </div>
            )}

            {!aiPrediction && !aiTraining && (
              <p className="text-sm text-gray-600">
                Klikněte na tlačítko výše pro natrénování AI modelu a zobrazení predikce.
                Model se trénuje na reálných historických datech (180 dní) a porovnává naučené vzorce s aktuální předpovědí.
                Obojí z Open-Meteo API.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
