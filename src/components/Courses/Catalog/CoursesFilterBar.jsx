import React from "react";
import { FaPlayCircle, FaVideo, FaStar, FaBuilding } from "react-icons/fa";
import { FiFilter, FiX } from "react-icons/fi";
import FlashOfferBanner from "../../Home/FlashOfferBanner";

export default function CoursesFilterBar({
  activeTab,
  setActiveTab,
  query,
  setQuery,
  showBestsellers,
  setShowBestsellers,
  centerFilter,
  setCenterFilter,
  setCenterPage,
  activeFiltersCount,
  isFilterActive,
  appliedSpecialization,
  appliedCollegeYear,
  setTempSpecialization,
  setTempCollegeYear,
  setShowFilterModal,
  selectedSpecName,
  selectedYearName,
  handleRemoveSpecializationFilter,
  handleRemoveCollegeYearFilter,
  handleClearFilter,
  filteredCount,
  visibleCount,
  t,
}) {
  return (
    <>
      {/* Header */}
      <header className="flex flex-col gap-5 mb-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 max-w-xl pr-4">
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
            {t("courses.allCourses", "All Courses")}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {t(
              "courses.chooseType",
              "Choose course type — Recorded Video Courses or Interactive Live Courses."
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <div
            className={`hidden sm:flex items-center p-0.5 bg-white rounded-full shadow-sm dark:bg-gray-800 border-2 transition-colors duration-300 ${
              activeTab === "video"
                ? "border-primary"
                : activeTab === "live"
                ? "border-red-600"
                : "border-teal-500"
            }`}
          >
            <button
              onClick={() => {
                setActiveTab("video");
                setQuery("");
              }}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTab === "video"
                  ? "bg-primary text-white"
                  : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <FaPlayCircle /> {t("courses.videoCourse", "Video Course")}
            </button>
            <button
              onClick={() => {
                setActiveTab("live");
                setQuery("");
              }}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTab === "live"
                  ? "bg-red-600 text-white"
                  : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <FaVideo /> {t("courses.liveCourse", "Live Course")}
            </button>
            <button
              onClick={() => {
                setActiveTab("center");
                setQuery("");
              }}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTab === "center"
                  ? "bg-teal-500 text-white"
                  : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <FaBuilding /> {t("courses.centerCourse", "Center Course")}
            </button>
          </div>

          {/* Bestsellers Toggle */}
          <button
            onClick={() => setShowBestsellers(!showBestsellers)}
            className={`hidden sm:flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
              showBestsellers
                ? "bg-yellow-500 text-white border-yellow-500 shadow-md"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
            aria-pressed={showBestsellers}
          >
            <FaStar
              className={showBestsellers ? "text-white" : "text-yellow-500"}
            />
            {t("courses.bestsellers", "Bestsellers")}
          </button>

          {/* Search & Filter Unified Group */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search */}
            <div className="flex items-center px-3 py-1.5 transition-all duration-200 bg-white border border-gray-300 rounded-full shadow-sm focus-within:border-primary dark:bg-gray-800 dark:border-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
                />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-24 sm:w-32 md:w-36 px-2 text-xs sm:text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none dark:text-gray-200 dark:placeholder-gray-500"
                placeholder={t("courses.searchPlaceholder", "Search...")}
                aria-label="Search courses"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Modal Trigger Button */}
            <button
              onClick={() => {
                setTempSpecialization(appliedSpecialization);
                setTempCollegeYear(appliedCollegeYear);
                setShowFilterModal(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm border whitespace-nowrap ${
                activeFiltersCount > 0
                  ? "bg-primary text-white border-primary shadow-primary/20"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
              aria-label="Filter courses"
              title={t("courses.filterCourses", "Filter Courses")}
            >
              <FiFilter
                className={
                  activeFiltersCount > 0 ? "text-white" : "text-primary"
                }
              />
              <span className="hidden sm:inline">
                {t("courses.filter", "Filter")}
              </span>
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-white text-primary">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Flash Offer Banner for Video Course & Live Course */}
      {activeTab !== "center" && (
        <div className="mb-8">
          <FlashOfferBanner
            type={activeTab === "video" ? "video_course" : "live_course"}
          />
        </div>
      )}

      {/* Active Filter Chips */}
      {isFilterActive && (
        <div className="flex flex-wrap items-center gap-2.5 mb-6 p-3.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl">
          <span className="text-xs font-bold text-primary uppercase tracking-wide">
            {t("courses.activeFilters", "Active Filters")}:
          </span>
          {appliedSpecialization && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              <span>
                {t("courses.filterBySpecialization", "Specialization")}:{" "}
                {selectedSpecName}
              </span>
              <button
                onClick={handleRemoveSpecializationFilter}
                className="p-0.5 text-gray-400 hover:text-red-500 rounded-full transition"
                title="Remove filter"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {appliedCollegeYear && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              <span>
                {t("courses.filterByCollegeYear", "College Year")}:{" "}
                {selectedYearName}
              </span>
              <button
                onClick={handleRemoveCollegeYearFilter}
                className="p-0.5 text-gray-400 hover:text-red-500 rounded-full transition"
                title="Remove filter"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilter}
            className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 underline ml-auto transition"
          >
            {t("courses.clearAll", "Clear all")}
          </button>
        </div>
      )}

      {/* Mobile Toggle */}
      <div className="flex flex-wrap gap-2 mb-4 sm:hidden">
        <button
          onClick={() => {
            setActiveTab("video");
            setQuery("");
          }}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
            activeTab === "video"
              ? "bg-primary text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          }`}
        >
          <FaPlayCircle className="inline mr-1" /> Video
        </button>
        <button
          onClick={() => {
            setActiveTab("live");
            setQuery("");
          }}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
            activeTab === "live"
              ? "bg-red-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          }`}
        >
          <FaVideo className="inline mr-1" /> Live
        </button>
        <button
          onClick={() => {
            setActiveTab("center");
            setQuery("");
          }}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
            activeTab === "center"
              ? "bg-teal-500 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          }`}
        >
          <FaBuilding className="inline mr-1" /> Center
        </button>
      </div>

      {/* Center Courses Sub-filters */}
      {activeTab === "center" && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {["closest", "expired", "completed"].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setCenterFilter(filter);
                setCenterPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                centerFilter === filter
                  ? "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              {t(
                `centerCourses.filter_${filter}`,
                filter.charAt(0).toUpperCase() + filter.slice(1)
              )}
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("courses.showing", "Showing")} {filteredCount}{" "}
          {t("courses.of", "of")} {visibleCount} — {t("courses.type", "Type")}:{" "}
          <span className="font-medium">
            {activeTab === "video"
              ? t("courses.videoCourse", "Video Course")
              : activeTab === "live"
              ? t("courses.liveCourse", "Live Course")
              : t("courses.centerCourse", "Center Course")}
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t("courses.layoutModern", "Layout: Modern Cards")}
        </div>
      </div>
    </>
  );
}
