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

  // Close suggestions when clicking outside
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

    // Debounce for API calls
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

    // Validation
    if (isNaN(areaNum) || areaNum <= 0) {
      alert('Enter valid panel area (greater than 0)');
      return;
    }

    if (isNaN(efficiencyNum) || efficiencyNum < 0 || efficiencyNum > 1) {
      alert('Enter valid efficiency (0-1)');
      return;
    }

    if (!city.trim()) {
      alert('Enter city or use geolocation');
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
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl px-4 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8 mb-6 sm:mb-8 border border-slate-200">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Parametry solárního panelu
      </h2>

      {/* Lokace s autocomplete */}
      <div className="mb-5 sm:mb-6 relative" ref={wrapperRef}>
        <label className="block text-slate-700 text-sm font-semibold mb-2.5" htmlFor="city">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Město nebo obec
          </div>
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              id="city"
              type="text"
              value={city}
              onChange={handleCityChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="shadow-sm border-2 border-slate-200 rounded-xl w-full py-2.5 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="např. Praha, Brno, Ostrava"
              disabled={geoLoading}
              autoComplete="off"
            />

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-slate-700 border-b border-slate-100 last:border-b-0 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="font-semibold text-sm">{suggestion.displayName}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
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
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 px-4 sm:px-5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all duration-200 whitespace-nowrap disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {geoLoading ? 'Načítám...' : 'Moje poloha'}
          </button>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          Začněte psát město, zobrazí se návrhy. Nebo použijte geolokaci.
        </p>
        {selectedSuggestion && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-lg border border-green-200">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Vybráno: {selectedSuggestion.displayName}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6">
        {/* Plocha panelu */}
        <div>
          <label className="block text-slate-700 text-sm font-semibold mb-2.5" htmlFor="area">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Plocha panelu (m²)
            </div>
          </label>
          <input
            id="area"
            type="number"
            step="0.1"
            min="0"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="shadow-sm border-2 border-slate-200 rounded-xl w-full py-2.5 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="např. 10"
          />
        </div>

        {/* Účinnost */}
        <div>
          <label className="block text-slate-700 text-sm font-semibold mb-2.5" htmlFor="efficiency">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Účinnost (0-1)
            </div>
          </label>
          <input
            id="efficiency"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={efficiency}
            onChange={(e) => setEfficiency(e.target.value)}
            className="shadow-sm border-2 border-slate-200 rounded-xl w-full py-2.5 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="např. 0.2"
          />
          <p className="text-slate-500 text-xs mt-1.5">Typická hodnota: 0.15-0.22</p>
        </div>
      </div>

      {/* Orientace střechy */}
      <div className="mb-6 sm:mb-8">
        <label className="block text-slate-700 text-sm font-semibold mb-2.5" htmlFor="orientation">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Orientace střechy
          </div>
        </label>
        <select
          id="orientation"
          value={orientation}
          onChange={(e) => setOrientation(e.target.value)}
          className="shadow-sm border-2 border-slate-200 rounded-xl w-full py-2.5 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all"
        >
          <option value="south">🧭 Jih (optimální - 100%)</option>
          <option value="southeast">↘️ Jihovýchod (90%)</option>
          <option value="southwest">↙️ Jihozápad (90%)</option>
          <option value="east">→ Východ (75%)</option>
          <option value="west">← Západ (75%)</option>
          <option value="north">⬆️ Sever (50%)</option>
        </select>
        <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Jižní orientace poskytuje nejvyšší výkon
        </p>
      </div>

      <div className="flex items-center justify-center sm:justify-start">
        <button
          type="submit"
          disabled={loading || geoLoading}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 sm:py-3.5 px-8 sm:px-10 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {loading ? 'Načítám data...' : 'Vypočítat energii'}
        </button>
      </div>
    </form>
  );
}

export default SolarForm;
