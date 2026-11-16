import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import CoursesSummaryHeader from "../../components/Profile/courses/CoursesSummaryHeader";
import CoursesFilterBar from "../../components/Profile/courses/CoursesFilterBar";
import CourseProgressCard from "../../components/Profile/courses/CourseProgressCard";
import TestsHistoryModal from "../../components/Profile/courses/TestsHistoryModal";

const PER_PAGE = 10;

const isLiveCourse = (course) => {
  const type = String(course?.course_type || course?.type || "").toLowerCase();
  return (
    type === "live" ||
    type === "live_course" ||
    Boolean(course?.is_live) ||
    Boolean(course?.batch?.id || course?.batch?.name || course?.batch_id)
  );
};

const isExpiredCourse = (course) => {
  if (!course) return false;
  if (course.is_expired === true || course.is_expired === 1) return true;
  if (String(course.status || "").toLowerCase() === "expired") return true;
  if (
    course.days_remaining !== undefined &&
    course.days_remaining !== null &&
    Number(course.days_remaining) < 0
  ) {
    return true;
  }
  return false;
};

const extractCourseArray = (section) => {
  if (Array.isArray(section)) return section;
  if (Array.isArray(section?.data)) return section.data;
  return [];
};

const getCourseRawId = (course) => String(course?.course_id ?? course?.id ?? "");

export default function MyCourses({ enrolledCourses: propEnrolledCourses = [] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getMyCoursesProgress } = useApi();

  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // "all" | "video" | "live"
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "active" | "expired"
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState(null);
  const [allCourses, setAllCourses] = useState([]);

  const [selectedCourseForTests, setSelectedCourseForTests] = useState(null);
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] = useState(null);

  const propCoursesRef = useRef(propEnrolledCourses);
  propCoursesRef.current = propEnrolledCourses;

  // Fetch all enrolled courses once with full progress, rank and points
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      if (getMyCoursesProgress) {
        const res = await getMyCoursesProgress({ per_page: 1000 });

        if (res && res.data) {
          const data = res.data;
          setSummary(data.summary || null);

          const videoCourses = extractCourseArray(data.video_courses).map((c) => ({
            ...c,
            course_type: c.course_type || c.type || "video",
          }));
          const liveCourses = extractCourseArray(data.live_courses).map((c) => ({
            ...c,
            course_type: c.course_type || c.type || "live",
          }));
          const rawAll = extractCourseArray(data.all_courses || data.courses);

          const videoIds = new Set(videoCourses.map(getCourseRawId).filter(Boolean));
          const liveIds = new Set(liveCourses.map(getCourseRawId).filter(Boolean));

          const fallbackList = Array.isArray(propCoursesRef.current)
            ? propCoursesRef.current
            : [];
          const propTypeById = new Map();
          const propTypeByTitle = new Map();
          fallbackList.forEach((c) => {
            const cType = isLiveCourse(c) ? "live" : "video";
            const cid = getCourseRawId(c);
            if (cid && !propTypeById.has(cid)) propTypeById.set(cid, cType);
            const titleKey = String(c?.title || c?.name || "").trim().toLowerCase();
            if (titleKey && !propTypeByTitle.has(titleKey)) {
              propTypeByTitle.set(titleKey, cType);
            }
          });

          const resolveCourseType = (course) => {
            if (course?.course_type || course?.type || isLiveCourse(course)) {
              return isLiveCourse(course) ? "live" : "video";
            }
            const cid = getCourseRawId(course);
            const inVideo = cid && videoIds.has(cid);
            const inLive = cid && liveIds.has(cid);
            if (inLive && !inVideo) return "live";
            if (inVideo && !inLive) return "video";

            const titleKey = String(course?.title || course?.name || "")
              .trim()
              .toLowerCase();
            if (titleKey) {
              const inLiveTitle = liveCourses.some(
                (lc) => String(lc?.title || lc?.name || "").trim().toLowerCase() === titleKey
              );
              const inVideoTitle = videoCourses.some(
                (vc) => String(vc?.title || vc?.name || "").trim().toLowerCase() === titleKey
              );
              if (inLiveTitle && !inVideoTitle) return "live";
              if (inVideoTitle && !inLiveTitle) return "video";
              if (propTypeByTitle.has(titleKey)) return propTypeByTitle.get(titleKey);
            }
            if (cid && propTypeById.has(cid)) return propTypeById.get(cid);
            return "video";
          };

          const mergedMap = new Map();
          const addCourse = (course, explicitType = null) => {
            const resolvedType = explicitType || resolveCourseType(course);
            const normalized = { ...course, course_type: resolvedType };
            const cid = getCourseRawId(normalized);
            const key = cid
              ? `${resolvedType}-${cid}`
              : `${resolvedType}-${String(normalized?.title || normalized?.name || mergedMap.size)}`;
            if (!mergedMap.has(key)) {
              mergedMap.set(key, normalized);
            }
          };

          if (rawAll.length > 0) {
            rawAll.forEach((c) => addCourse(c));
          }
          videoCourses.forEach((c) => addCourse(c, "video"));
          liveCourses.forEach((c) => addCourse(c, "live"));

          const combined = Array.from(mergedMap.values());
          setAllCourses(combined.length > 0 ? combined : fallbackList);
          return;
        }
      }

      // Fallback to propEnrolledCourses
      const fallbackCourses = propCoursesRef.current;
      if (Array.isArray(fallbackCourses) && fallbackCourses.length > 0) {
        setAllCourses(fallbackCourses);
      }
    } catch (err) {
      console.error("Failed to load courses progress:", err);
      const fallbackCourses = propCoursesRef.current;
      if (Array.isArray(fallbackCourses)) {
        setAllCourses(fallbackCourses);
      }
    } finally {
      setLoading(false);
    }
  }, [getMyCoursesProgress]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Apply status and type filtering client-side
  const { statusFilteredCourses, counts } = useMemo(() => {
    const byStatus = allCourses.filter((course) => {
      if (filterStatus === "active") return !isExpiredCourse(course);
      if (filterStatus === "expired") return isExpiredCourse(course);
      return true;
    });

    let videoCount = 0;
    let liveCount = 0;
    byStatus.forEach((course) => {
      if (isLiveCourse(course)) liveCount += 1;
      else videoCount += 1;
    });

    return {
      statusFilteredCourses: byStatus,
      counts: {
        all: byStatus.length,
        video: videoCount,
        live: liveCount,
      },
    };
  }, [allCourses, filterStatus]);

  const filteredCourses = useMemo(() => {
    if (filterType === "video") {
      return statusFilteredCourses.filter((course) => !isLiveCourse(course));
    }
    if (filterType === "live") {
      return statusFilteredCourses.filter((course) => isLiveCourse(course));
    }
    return statusFilteredCourses;
  }, [statusFilteredCourses, filterType]);

  const pagination = useMemo(() => {
    const total = filteredCourses.length;
    const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
    const currentPage = Math.min(page, lastPage);
    return {
      total,
      per_page: PER_PAGE,
      current_page: currentPage,
      last_page: lastPage,
      has_more: currentPage * PER_PAGE < total,
    };
  }, [filteredCourses.length, page]);

  const coursesList = useMemo(() => {
    const start = (pagination.current_page - 1) * PER_PAGE;
    return filteredCourses.slice(start, start + PER_PAGE);
  }, [filteredCourses, pagination.current_page]);

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
          onClick={() => loadCourses()}
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
        counts={counts}
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
              key={`${isLiveCourse(course) ? "live" : "video"}-${course.course_id || course.id || "c"}-${idx}`}
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
