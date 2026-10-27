import React from "react";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Pagination from "../../components/Common/Pagination";
import VideoCourses from "./VideoCourses";
import LiveCourses from "../Live_courses/LiveCourses";
import CenterCourses from "../Center_courses/CenterCourses";
import SEO from "../../components/SEO/SEO";
import CoursesFilterBar from "../../components/Courses/Catalog/CoursesFilterBar";
import CoursesFilterModal from "../../components/Courses/Catalog/CoursesFilterModal";
import { useCoursesCatalog } from "../../components/Courses/Catalog/useCoursesCatalog";

export default function Courses() {
  const {
    activeTab,
    setActiveTab,
    query,
    setQuery,
    showBestsellers,
    setShowBestsellers,
    centerFilter,
    setCenterFilter,
    setCenterPage,
    loading,
    error,
    filtered,
    visible,
    favoriteIds,
    onToggleFavorite,
    goToDetails,
    currentPage,
    totalPages,
    handlePageChange,
    specializations,
    collegeYears,
    showFilterModal,
    setShowFilterModal,
    tempSpecialization,
    setTempSpecialization,
    tempCollegeYear,
    setTempCollegeYear,
    appliedSpecialization,
    appliedCollegeYear,
    isFilterActive,
    activeFiltersCount,
    selectedSpecName,
    selectedYearName,
    handleApplyFilter,
    handleClearFilter,
    handleRemoveSpecializationFilter,
    handleRemoveCollegeYearFilter,
    isLoggedIn,
    navigate,
    t,
  } = useCoursesCatalog();

  return (
    <div className="min-h-screen py-10 transition-colors duration-300">
      <SEO
        title={activeTab === "video" ? "Video Courses" : "Live Courses"}
        description={`Explore our comprehensive ${
          activeTab === "video" ? "recorded video courses" : "interactive live courses"
        } for KROK preparation. Best study materials for medicine, dentistry, and pharmacy students.`}
        url={activeTab === "video" ? "/courses" : "/live-courses"}
      />
      <div className="px-4 mx-auto max-w-7xl sm:px-0">
        <CoursesFilterBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          query={query}
          setQuery={setQuery}
          showBestsellers={showBestsellers}
          setShowBestsellers={setShowBestsellers}
          centerFilter={centerFilter}
          setCenterFilter={setCenterFilter}
          setCenterPage={setCenterPage}
          activeFiltersCount={activeFiltersCount}
          isFilterActive={isFilterActive}
          appliedSpecialization={appliedSpecialization}
          appliedCollegeYear={appliedCollegeYear}
          setTempSpecialization={setTempSpecialization}
          setTempCollegeYear={setTempCollegeYear}
          setShowFilterModal={setShowFilterModal}
          selectedSpecName={selectedSpecName}
          selectedYearName={selectedYearName}
          handleRemoveSpecializationFilter={handleRemoveSpecializationFilter}
          handleRemoveCollegeYearFilter={handleRemoveCollegeYearFilter}
          handleClearFilter={handleClearFilter}
          filteredCount={filtered.length}
          visibleCount={visible.length}
          t={t}
        />

        {/* Courses Grid Section */}
        <section>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {!!error && (
                <div className="p-6 mb-6 text-center text-red-600 bg-white shadow dark:bg-gray-800 rounded-2xl">
                  {t("common.error", "Error")}: {error}
                </div>
              )}
              {activeTab === "video" ? (
                <VideoCourses
                  courses={filtered}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={onToggleFavorite}
                  goToDetails={goToDetails}
                  t={t}
                  isLoggedIn={isLoggedIn}
                  navigate={navigate}
                />
              ) : activeTab === "live" ? (
                <LiveCourses
                  courses={filtered}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={onToggleFavorite}
                  goToDetails={goToDetails}
                  t={t}
                  isLoggedIn={isLoggedIn}
                  navigate={navigate}
                />
              ) : (
                <CenterCourses
                  courses={filtered}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={onToggleFavorite}
                  goToDetails={goToDetails}
                  t={t}
                  isLoggedIn={isLoggedIn}
                  navigate={navigate}
                />
              )}

              {/* Pagination — only when not searching */}
              {!query && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              )}
            </>
          )}
        </section>
      </div>

      <CoursesFilterModal
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}
        specializations={specializations}
        tempSpecialization={tempSpecialization}
        setTempSpecialization={setTempSpecialization}
        collegeYears={collegeYears}
        tempCollegeYear={tempCollegeYear}
        setTempCollegeYear={setTempCollegeYear}
        handleClearFilter={handleClearFilter}
        handleApplyFilter={handleApplyFilter}
        t={t}
      />
    </div>
  );
}
