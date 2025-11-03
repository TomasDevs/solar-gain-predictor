import { useState, useEffect } from 'react';
import SolarForm from './components/SolarForm';
import SolarChart from './components/SolarChart';
import { simulateSolarData, getOrientationLabel } from './data/simulateSolarData';
import {
  getCoordinatesByCity,
} from './services/weatherService';
import { getWeatherForecast } from './services/openMeteoService';
import { createAndTrainModel, createAIPrediction } from './services/aiModel';
import { useTranslation } from './i18n/LanguageContext';

function App() {
  const { t, language, setLanguage, getDayLabel } = useTranslation();
  const [solarData, setSolarData] = useState([]);

  // Update page title when language changes
  useEffect(() => {
    document.title = `${t('appTitle')} - ${language === 'cs' ? 'Predikce solární energie' : 'Solar Energy Prediction'}`;
  }, [language, t]);
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
      alert(t('alertTrainFirst'));
      return;
    }

    setAiTraining(true);
    setTrainingProgress(null);

    try {
      // Train model with progress callback and real historical data
      const model = await createAndTrainModel(
        locationInfo.lat,
        locationInfo.lon,
        (progress) => {
          setTrainingProgress(progress);
        }
      );

      setAiModel(model);

      // Create AI prediction
      const prediction = createAIPrediction(model, forecastRawData);
      setAiPrediction(prediction);

      setTrainingProgress(null);
    } catch (err) {
      console.error('Error training AI model:', err);
      setError(t('errorTrainingModel') + ': ' + err.message);
    } finally {
      setAiTraining(false);
    }
  };

  const handleFormSubmit = async ({ area, efficiency, orientation, city, useGeolocation }) => {
    setLoading(true);
    setError(null);

    try {
      let coordinates;

      // Get coordinates
      if (useGeolocation) {
        // Coordinates are already in city in format "lat, lon"
        const [lat, lon] = city.split(',').map((coord) => parseFloat(coord.trim()));
        coordinates = { lat, lon, name: t('yourLocation'), country: '' };
      } else {
        // Get coordinates by city name
        coordinates = await getCoordinatesByCity(city, language);
      }

      setLocationInfo(coordinates);

      // Get weather forecast from Open-Meteo API (returns processed data)
      const forecastData = await getWeatherForecast(coordinates.lat, coordinates.lon, t, getDayLabel);
      setForecastRawData(forecastData); // Save for AI prediction

      // Calculate solar data with real values from Open-Meteo
      const data = simulateSolarData(area, efficiency, orientation, forecastData);
      setSolarData(data);

      // Reset AI prediction when new data arrives
      setAiPrediction(null);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(
        err.message || t('errorFetchingData')
      );

      // Fallback to simulated data
      const data = simulateSolarData(area, efficiency, orientation);
      setSolarData(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hlavička */}
        <header className="text-center mb-6 sm:mb-10 pt-4">
          {/* Language Switcher */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-1">
              <button
                onClick={() => setLanguage('cs')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  language === 'cs'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                CZ
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 transform hover:scale-105 transition-transform">
              <svg className="w-7 h-7 sm:w-9 sm:h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {t('appTitle')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto px-4">
            {t('appSubtitle')}
          </p>
        </header>

        {/* Formulář */}
        <SolarForm onSubmit={handleFormSubmit} loading={loading} />

        {/* Chybová hláška */}
        {error && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-800 text-sm sm:text-base">{t('warning')}</p>
                <p className="text-amber-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info o lokaci */}
        {locationInfo && solarData.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 text-sm sm:text-base">
                  {locationInfo.name}
                  {locationInfo.country && `, ${locationInfo.country}`}
                </p>
                <p className="text-blue-700 text-xs sm:text-sm mt-1">
                  {t('orientation')}: <span className="font-medium">{getOrientationLabel(solarData[0]?.orientation, t)}</span> ({Math.round(solarData[0]?.orientationFactor * 100)}% {t('efficiency')})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Graf */}
        <SolarChart data={solarData} />

        {/* Statistiky */}
        {solarData.length > 0 && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl px-4 sm:px-8 pt-6 pb-6 border border-slate-200">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {t('statsTitle')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">{t('totalEnergy')}</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                  {(solarData.reduce((sum, d) => sum + d.energy, 0) / 1000).toFixed(2)}
                  <span className="text-lg sm:text-xl ml-1">kWh</span>
                </p>
                <p className="text-xs text-slate-500">
                  {solarData.reduce((sum, d) => sum + d.energy, 0).toLocaleString()} Wh
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-5 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">{t('averagePerDay')}</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                  {(solarData.reduce((sum, d) => sum + d.energy, 0) / solarData.length / 1000).toFixed(2)}
                  <span className="text-lg sm:text-xl ml-1">kWh</span>
                </p>
                <p className="text-xs text-slate-500">
                  {Math.round(solarData.reduce((sum, d) => sum + d.energy, 0) / solarData.length).toLocaleString()} Wh
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-5 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">{t('maximum')}</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">
                  {(Math.max(...solarData.map((d) => d.energy)) / 1000).toFixed(2)}
                  <span className="text-lg sm:text-xl ml-1">kWh</span>
                </p>
                <p className="text-xs text-slate-500">
                  {Math.max(...solarData.map((d) => d.energy)).toLocaleString()} Wh
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Training & Prediction */}
        {solarData.length > 0 && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl px-4 sm:px-8 pt-6 pb-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                {t('aiTitle')}
              </h3>
            </div>

            <div className="mb-5">
              <button
                onClick={handleTrainAndPredict}
                disabled={aiTraining || loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {aiTraining ? t('trainingButton') : aiModel ? t('retrainButton') : t('trainButton')}
              </button>
            </div>

            {trainingProgress && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-5 shadow-sm">
                <p className="text-sm sm:text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('trainingModel')}: Epoch {trainingProgress.epoch}/{trainingProgress.totalEpochs}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 shadow-md"
                    style={{ width: `${(trainingProgress.epoch / trainingProgress.totalEpochs) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs sm:text-sm">
                  <div className="bg-white/70 rounded-lg px-3 py-1.5 border border-blue-100">
                    <span className="text-slate-600">{t('loss')}:</span>{' '}
                    <span className="font-semibold text-blue-700">{trainingProgress.loss?.toFixed(4)}</span>
                  </div>
                  <div className="bg-white/70 rounded-lg px-3 py-1.5 border border-indigo-100">
                    <span className="text-slate-600">{t('valLoss')}:</span>{' '}
                    <span className="font-semibold text-indigo-700">{trainingProgress.valLoss?.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            )}

            {aiPrediction && (
              <div className="mt-5">
                <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t('comparisonTitle')}
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-lg">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="py-3 sm:py-4 px-3 sm:px-6 border-b-2 border-slate-200 text-left text-xs sm:text-sm font-bold text-slate-700">
                          {t('day')}
                        </th>
                        <th className="py-3 sm:py-4 px-3 sm:px-6 border-b-2 border-slate-200 text-left text-xs sm:text-sm font-bold text-slate-700">
                          {t('actual')}
                        </th>
                        <th className="py-3 sm:py-4 px-3 sm:px-6 border-b-2 border-slate-200 text-left text-xs sm:text-sm font-bold text-slate-700">
                          {t('aiPrediction')}
                        </th>
                        <th className="py-3 sm:py-4 px-3 sm:px-6 border-b-2 border-slate-200 text-left text-xs sm:text-sm font-bold text-slate-700">
                          {t('difference')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aiPrediction.map((item, index) => {
                        const diff = item.aiSunHours - item.sunHours;
                        const diffPercent = ((diff / item.sunHours) * 100).toFixed(1);
                        return (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm text-slate-700 font-medium">
                              {item.day}
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-semibold">
                                {item.sunHours} h
                              </span>
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-semibold">
                                {item.aiSunHours} h
                              </span>
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-semibold ${
                                diff > 0
                                  ? 'bg-green-100 text-green-800'
                                  : diff < 0
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)} h ({diffPercent > 0 ? '+' : ''}{diffPercent}%)
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-purple-800">
                      {t('aiInfo')} <span className="font-semibold">{locationInfo?.name}</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!aiPrediction && !aiTraining && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm sm:text-base text-slate-600">
                    {t('aiDescription')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
