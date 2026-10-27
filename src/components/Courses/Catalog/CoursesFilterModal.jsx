import React from "react";
import { FiFilter, FiX, FiCheck } from "react-icons/fi";

export default function CoursesFilterModal({
  showFilterModal,
  setShowFilterModal,
  specializations,
  tempSpecialization,
  setTempSpecialization,
  collegeYears,
  tempCollegeYear,
  setTempCollegeYear,
  handleClearFilter,
  handleApplyFilter,
  t,
}) {
  if (!showFilterModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={() => setShowFilterModal(false)}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <FiFilter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("courses.filterCourses", "Filter Courses")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  "courses.filterModalDescription",
                  "Filter courses by specialization and/or college year"
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilterModal(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[65vh] overflow-y-auto p-6 space-y-6">
          {/* Specialization Section */}
          <div>
            <label className="block mb-2.5 text-sm font-bold text-gray-800 dark:text-gray-200">
              {t("courses.filterBySpecialization", "Specialization")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTempSpecialization("")}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  tempSpecialization === ""
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary/50"
                }`}
              >
                {tempSpecialization === "" && <FiCheck className="w-3.5 h-3.5" />}
                {t("courses.allSpecializations", "All Specializations")}
              </button>
              {specializations.map((spec) => {
                const isSelected =
                  String(tempSpecialization) === String(spec.id);
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setTempSpecialization(spec.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all capitalize ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary/50"
                    }`}
                  >
                    {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                    {spec.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* College Year Section */}
          <div>
            <label className="block mb-2.5 text-sm font-bold text-gray-800 dark:text-gray-200">
              {t("courses.filterByCollegeYear", "College Year")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTempCollegeYear("")}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  tempCollegeYear === ""
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary/50"
                }`}
              >
                {tempCollegeYear === "" && <FiCheck className="w-3.5 h-3.5" />}
                {t("courses.allCollegeYears", "All Years")}
              </button>
              {collegeYears.map((year) => {
                const isSelected = String(tempCollegeYear) === String(year.id);
                return (
                  <button
                    key={year.id}
                    type="button"
                    onClick={() => setTempCollegeYear(year.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary/50"
                    }`}
                  >
                    {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                    {year.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClearFilter}
            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            {t("courses.clearFilters", "Reset Filters")}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilterModal(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="button"
              onClick={handleApplyFilter}
              className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20 transition"
            >
              {t("courses.applyFilters", "Apply Filters")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
