import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaSyncAlt,
  FaGraduationCap,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import LiveCourseScheduleModal from "./LiveCourseScheduleModal";

// Modular Courses Components
import CoursesSummaryHeader from "./components/courses/CoursesSummaryHeader";
import CoursesFilterBar from "./components/courses/CoursesFilterBar";
import CourseProgressCard from "./components/courses/CourseProgressCard";
import TestsHistoryModal from "./components/courses/TestsHistoryModal";

export default function MyCourses({ enrolledCourses: propEnrolledCourses = [] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getMyCoursesProgress } = useApi();

  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // "all" | "video" | "live"
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "active" | "expired"
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
    has_more: false,
  });

  const [selectedCourseForTests, setSelectedCourseForTests] = useState(null);
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] = useState(null);

  const propCoursesRef = useRef(propEnrolledCourses);
  propCoursesRef.current = propEnrolledCourses;

  // Fetch courses with full progress, rank and points
  const loadCourses = useCallback(
    async (currentPage = 1, currentType = filterType, currentStatus = filterStatus) => {
      try {
        setLoading(true);
        if (getMyCoursesProgress) {
          const res = await getMyCoursesProgress({
            type: currentType,
            status: currentStatus,
            page: currentPage,
            per_page: 10,
          });

          if (res && res.data) {
            const data = res.data;
            setSummary(data.summary || null);

            // Determine which course array to show based on filterType
            let target = [];
            let targetPagination = {
              total: 0,
              per_page: 10,
              current_page: currentPage,
              last_page: 1,
              has_more: false,
            };

            if (currentType === "video" && data.video_courses) {
              target = data.video_courses.data || [];
              targetPagination = data.video_courses.pagination || targetPagination;
            } else if (currentType === "live" && data.live_courses) {
              target = data.live_courses.data || [];
              targetPagination = data.live_courses.pagination || targetPagination;
            } else if (data.all_courses) {
              target = data.all_courses.data || [];
              targetPagination = data.all_courses.pagination || targetPagination;
            } else {
              // Combine video and live if all_courses not provided
              const videos = data.video_courses?.data || [];
              const lives = data.live_courses?.data || [];
              target = [...videos, ...lives];
              targetPagination = {
                total: target.length,
                per_page: 10,
                current_page: 1,
                last_page: 1,
                has_more: false,
              };
            }

            setCoursesList(target);
            setPagination(targetPagination);
            return;
          }
        }

        // Fallback to propEnrolledCourses
        const fallbackCourses = propCoursesRef.current;
        if (Array.isArray(fallbackCourses) && fallbackCourses.length > 0) {
          setCoursesList(fallbackCourses);
          setPagination({
            total: fallbackCourses.length,
            per_page: fallbackCourses.length,
            current_page: 1,
            last_page: 1,
            has_more: false,
          });
        }
      } catch (err) {
        console.error("Failed to load courses progress:", err);
        const fallbackCourses = propCoursesRef.current;
        if (Array.isArray(fallbackCourses)) {
          setCoursesList(fallbackCourses);
        }
      } finally {
        setLoading(false);
      }
    },
    [getMyCoursesProgress, filterType, filterStatus]
  );

  useEffect(() => {
    loadCourses(page, filterType, filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterType, filterStatus]);

  const handleTypeChange = (newType) => {
    setFilterType(newType);
    setPage(1);
  };

  const handleStatusChange = (newStatus) => {
    setFilterStatus(newStatus);
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Top Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            {t("myCourses.title", "My Courses & Progress")}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            {t(
              "myCourses.dashboardProgressSubtitle",
              "Track your completion, points, and class ranking across enrolled courses"
            )}
          </p>
        </div>

        <button
          onClick={() => loadCourses(page, filterType, filterStatus)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-border hover:border-primary/50 text-text transition-colors self-start sm:self-auto shadow-sm"
        >
          <FaSyncAlt className={`text-xs ${loading ? "animate-spin text-primary" : ""}`} />
          <span>{t("common.refresh", "Refresh")}</span>
        </button>
      </div>

      {/* ── Summary Stats Cards (data.summary) ── */}
      {summary && <CoursesSummaryHeader summary={summary} />}

      {/* ── Filter Controls ── */}
      <CoursesFilterBar
        filterType={filterType}
        handleTypeChange={handleTypeChange}
        filterStatus={filterStatus}
        handleStatusChange={handleStatusChange}
        summary={summary}
      />

      {/* ── Courses Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : coursesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coursesList.map((course, idx) => (
            <CourseProgressCard
              key={course.course_id || course.id || idx}
              course={course}
              onOpenTests={(c) => setSelectedCourseForTests(c)}
              onOpenSchedule={(c) => setSelectedCourseForSchedule(c)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center rounded-3xl bg-surface border border-border/70 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
            <FaGraduationCap />
          </div>
          <h3 className="mb-2 text-lg font-bold text-text">
            {t("myCourses.noCourses", "No courses enrolled yet")}
          </h3>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            {t("myCourses.browseCourses", "Browse our courses and start learning today!")}
          </p>
        </div>
      )}

      {/* ── Pagination Controls ── */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="text-xs text-text-secondary">
            {t("myCourses.page", "Page {{current}} of {{total}}", {
              current: pagination.current_page || page,
              total: pagination.last_page || 1,
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border bg-surface text-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-border/40 transition-colors"
            >
              <FaChevronLeft className="text-[10px]" />
              <span>{t("myCourses.prev", "Previous")}</span>
            </button>

            <button
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border bg-surface text-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-border/40 transition-colors"
            >
              <span>{t("myCourses.next", "Next")}</span>
              <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>
      )}

      {/* ── Tests History Modal ── */}
      <TestsHistoryModal
        course={selectedCourseForTests}
        isOpen={Boolean(selectedCourseForTests)}
        onClose={() => setSelectedCourseForTests(null)}
      />

      {/* ── Live Course Schedule & Timeline Modal (Update 10) ── */}
      <LiveCourseScheduleModal
        course={selectedCourseForSchedule}
        isOpen={Boolean(selectedCourseForSchedule)}
        onClose={() => setSelectedCourseForSchedule(null)}
        onNavigateToLessons={(id) => navigate(`/live-courses/${id}/lessons`)}
      />
    </div>
  );
}
