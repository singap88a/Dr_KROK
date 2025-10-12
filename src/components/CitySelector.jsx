import React, { useState, useEffect } from 'react';
import { FiMapPin, FiChevronDown } from 'react-icons/fi';
import { useApi } from '../context/ApiContext';
import { useTranslation } from 'react-i18next';

const CitySelector = ({ value, onChange, required = false, placeholder = "Select City", onCitySelect }) => {
  const { request } = useApi();
  const { t } = useTranslation();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await request('cities');
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
            {loading ? 'Loading...' : (value || placeholder)}
          </span>
          <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 overflow-y-auto border rounded-lg shadow-lg bg-surface border-border max-h-60">
            {error ? (
              <div className="p-3 text-sm text-red-500">
                {error}
                <button
                  onClick={fetchCities}
                  className="block mt-2 text-primary hover:underline"
                >
                  Retry
                </button>
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
            ) : (
              <div className="p-3 text-sm text-text-secondary">
                No cities found
              </div>
            )}
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
