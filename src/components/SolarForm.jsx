import { useState } from 'react';

function SolarForm({ onSubmit }) {
  const [area, setArea] = useState('10');
  const [efficiency, setEfficiency] = useState('0.2');

  const handleSubmit = (e) => {
    e.preventDefault();

    const areaNum = parseFloat(area);
    const efficiencyNum = parseFloat(efficiency);

    // Validace
    if (isNaN(areaNum) || areaNum <= 0) {
      alert('Zadejte platnou plochu panelu (větší než 0)');
      return;
    }

    if (isNaN(efficiencyNum) || efficiencyNum < 0 || efficiencyNum > 1) {
      alert('Zadejte platnou účinnost (0-1)');
      return;
    }

    onSubmit({ area: areaNum, efficiency: efficiencyNum });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Parametry solárního panelu</h2>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="area">
          Plocha panelu (m²)
        </label>
        <input
          id="area"
          type="number"
          step="0.1"
          min="0"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="např. 10"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="efficiency">
          Účinnost (0-1)
        </label>
        <input
          id="efficiency"
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={efficiency}
          onChange={(e) => setEfficiency(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="např. 0.2"
        />
        <p className="text-gray-600 text-xs mt-1">Typická hodnota: 0.15-0.22</p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
        >
          Vypočítat energii
        </button>
      </div>
    </form>
  );
}

export default SolarForm;
