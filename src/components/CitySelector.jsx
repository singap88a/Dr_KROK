import React, { useState, useRef } from 'react';
import { FiMapPin, FiChevronDown, FiSearch } from 'react-icons/fi';
import { useApi } from '../context/ApiContext';
import { useTranslation } from 'react-i18next';

const CitySelector = ({ value, onChange, required = false, onCitySelect }) => {
  const { request } = useApi();
  const { t } = useTranslation();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);
  const inputRef = useRef(null);

  const fetchCities = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (query.length >= 3) {
        response = await request(`cities/search?query=${encodeURIComponent(query)}`);
      } else {
        // If no query or less than 3 chars, show empty
        setCities([]);
        setLoading(false);
        return;
      }

      if (response && response.data) {
        setCities(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch cities');
      console.error('Error fetching cities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced search
    const timer = setTimeout(() => {
      fetchCities(query);
    }, 300); // 300ms debounce

    setDebounceTimer(timer);
  };

  const handleSelect = (city) => {
    onChange({
      target: {
        name: 'city',
        value: city.name,
        city_id: city.id
      }
    });
    if (onCitySelect) {
      onCitySelect(city);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
        <FiMapPin /> {t('books.city')} {required && '*'}
      </label>

      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-3 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={loading}
        >
          <span className={value ? 'text-text' : 'text-text-secondary'}>
            {loading ? t('city_selector.loading') : (value || t('city_selector.select_city'))}
          </span>
          <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 border rounded-lg shadow-lg bg-surface border-border">
            {/* Search Input */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <FiSearch className="absolute transform -translate-y-1/2 left-3 top-1/2 text-text-secondary" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t('city_selector.search_placeholder')}
                  className="w-full py-2 pl-10 pr-3 text-sm border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-60">
              {error ? (
                <div className="p-3 text-sm text-red-500">
                  {error}
                  <button
                    onClick={() => fetchCities(searchQuery)}
                    className="block mt-2 text-primary hover:underline"
                  >
                    {t('city_selector.retry')}
                  </button>
                </div>
              ) : loading ? (
                <div className="p-3 text-sm text-text-secondary">
                  {t('city_selector.searching')}
                </div>
              ) : cities.length > 0 ? (
                cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelect(city)}
                    className="w-full p-3 text-left hover:bg-background/50 focus:bg-background/50 focus:outline-none"
                  >
                    {city.name}
                  </button>
                ))
              ) : searchQuery.length >= 3 ? (
                <div className="p-3 text-sm text-text-secondary">
                  {t('city_selector.no_cities_found', { query: searchQuery })}
                </div>
              ) : (
                <div className="p-3 text-sm text-text-secondary">
                  {t('city_selector.type_at_least_3')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CitySelector;
