import { useState } from 'react';
import SolarForm from './components/SolarForm';
import SolarChart from './components/SolarChart';
import { simulateSolarData } from './data/simulateSolarData';

function App() {
  const [solarData, setSolarData] = useState([]);

  const handleFormSubmit = ({ area, efficiency }) => {
    const data = simulateSolarData(area, efficiency);
    setSolarData(data);
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
            Predikce výroby solární energie na základě parametrů panelu
          </p>
        </header>

        {/* Formulář */}
        <SolarForm onSubmit={handleFormSubmit} />

        {/* Graf */}
        <SolarChart data={solarData} />

        {/* Patička s informacemi */}
        {solarData.length > 0 && (
          <div className="mt-6 bg-white shadow-md rounded-lg px-8 pt-4 pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Statistiky</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-sm">Celková energie</p>
                <p className="text-2xl font-bold text-blue-600">
                  {solarData.reduce((sum, d) => sum + d.energy, 0).toLocaleString()} Wh
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Průměr/den</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    solarData.reduce((sum, d) => sum + d.energy, 0) / solarData.length
                  ).toLocaleString()} Wh
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Maximum</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.max(...solarData.map((d) => d.energy)).toLocaleString()} Wh
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
