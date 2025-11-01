import { useState, useEffect, useRef } from 'react';
import { searchCities } from '../services/weatherService';

function SolarForm({ onSubmit, loading }) {
  const [area, setArea] = useState('10');
  const [efficiency, setEfficiency] = useState('0.2');
  const [orientation, setOrientation] = useState('south');
  const [city, setCity] = useState('Praha');
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);

  // Zavře suggestions při kliknutí mimo
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Váš prohlížeč nepodporuje geolokaci');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        setUseGeolocation(true);
        const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        setCity(coords);
        setShowSuggestions(false);
        setSelectedSuggestion({
          displayName: `Vaše poloha (${coords})`,
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        setGeoLoading(false);
        alert('Nepodařilo se získat vaši polohu. Zkuste to znovu nebo zadejte město ručně.');
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    setUseGeolocation(false);
    setSelectedSuggestion(null);

    // Debounce pro API volání
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.length >= 2) {
      debounceTimer.current = setTimeout(async () => {
        const results = await searchCities(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.displayName);
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

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

    if (!city.trim()) {
      alert('Zadejte město nebo použijte geolokaci');
      return;
    }

    onSubmit({
      area: areaNum,
      efficiency: efficiencyNum,
      orientation,
      city: city.trim(),
      useGeolocation
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Parametry solárního panelu</h2>

      {/* Lokace s autocomplete */}
      <div className="mb-4 relative" ref={wrapperRef}>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
          Město nebo obec
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="city"
              type="text"
              value={city}
              onChange={handleCityChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="např. Praha, Brno, Ostrava"
              disabled={geoLoading}
              autoComplete="off"
            />

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-700 border-b last:border-b-0"
                  >
                    <div className="font-medium">{suggestion.displayName}</div>
                    <div className="text-xs text-gray-500">
                      {suggestion.lat.toFixed(4)}, {suggestion.lon.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleGeolocation}
            disabled={geoLoading || loading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {geoLoading ? 'Načítám...' : '📍 Moje poloha'}
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-1">
          Začněte psát město, zobrazí se návrhy. Nebo použijte geolokaci.
        </p>
        {selectedSuggestion && (
          <p className="text-green-600 text-xs mt-1">
            ✓ Vybráno: {selectedSuggestion.displayName}
          </p>
        )}
      </div>

      {/* Plocha panelu */}
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
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="např. 10"
        />
      </div>

      {/* Účinnost */}
      <div className="mb-4">
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
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="např. 0.2"
        />
        <p className="text-gray-600 text-xs mt-1">Typická hodnota: 0.15-0.22</p>
      </div>

      {/* Orientace střechy - bez appearance-none */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orientation">
          🧭 Orientace střechy
        </label>
        <select
          id="orientation"
          value={orientation}
          onChange={(e) => setOrientation(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="south">Jih (optimální)</option>
          <option value="southeast">Jihovýchod</option>
          <option value="southwest">Jihozápad</option>
          <option value="east">Východ</option>
          <option value="west">Západ</option>
          <option value="north">Sever</option>
        </select>
        <p className="text-gray-600 text-xs mt-1">
          Jižní orientace poskytuje nejvyšší výkon
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading || geoLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Načítám data...' : 'Vypočítat energii'}
        </button>
      </div>
    </form>
  );
}

export default SolarForm;
