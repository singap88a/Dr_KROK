import React from "react";
import { FaChevronDown } from "react-icons/fa";

export default function OrderFilterDropdown({
  filterType,
  setFilterType,
  filterOptions,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
}) {
  const activeOption = filterOptions.find((opt) => opt.value === filterType);

  return (
    <div className="relative mb-6 z-20" ref={dropdownRef}>
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-between w-full sm:w-[280px] px-5 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:border-primary/50 dark:hover:border-primary/50 cursor-pointer transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          {activeOption?.icon}
          <span className="font-bold text-gray-700 dark:text-gray-200">
            {activeOption?.label}
          </span>
        </div>
        <FaChevronDown
          className={`text-gray-400 transition-transform duration-300 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-full sm:w-[280px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn origin-top">
          {filterOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                setFilterType(option.value);
                setIsDropdownOpen(false);
              }}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                filterType === option.value
                  ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-primary"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent"
              }`}
            >
              {option.icon}
              <span
                className={`font-semibold ${
                  filterType === option.value
                    ? "text-primary"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
