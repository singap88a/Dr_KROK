import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaFilter, FaChevronDown } from "react-icons/fa";

export default function DashboardFilters({
  t,
  searchQuery,
  onSearchChange,
  selectedYear,
  onYearChange,
  uniqueYears
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectYear = (year) => {
    onYearChange(year);
    setDropdownOpen(false);
  };

  // Find displaying label
  const getSelectedYearLabel = () => {
    if (!selectedYear) return t("universityRepresentative.filterYear", "All Years");
    return selectedYear;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
      {/* Search Input */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 border rounded-xl bg-surface/40 hover:bg-surface/70 border-border text-sm transition-all duration-300 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary w-full sm:w-64">
        <FaSearch className="text-text-muted text-sm shrink-0" />
        <input
          type="text"
          placeholder={t("universityRepresentative.searchPlaceholder", "Search students...")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent focus:outline-none text-sm text-text"
        />
      </div>

      {/* Custom Year Filter Dropdown */}
      <div className="relative w-full sm:w-48" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(prev => !prev)}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 border rounded-xl bg-surface/40 hover:bg-surface/70 border-border text-sm transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-left text-text-secondary font-medium"
        >
          <FaFilter className="text-text-muted text-xs shrink-0" />
          <span className="flex-1 truncate">
            {getSelectedYearLabel()}
          </span>
          <FaChevronDown className={`text-xs text-text-muted transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fadeIn divide-y divide-border">
            {/* All Years option */}
            <button
              type="button"
              onClick={() => handleSelectYear("")}
              className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-primary/5 ${
                selectedYear === ""
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-text-secondary"
              }`}
            >
              {t("universityRepresentative.filterYear", "All Years")}
            </button>

            {/* Custom Years option */}
            {uniqueYears.map(year => (
              <button
                key={year}
                type="button"
                onClick={() => handleSelectYear(year)}
                className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-primary/5 ${
                  selectedYear === year
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-text-secondary"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
