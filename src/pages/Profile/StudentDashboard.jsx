import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaBroadcastTower,
  FaBook,
  FaShoppingCart,
  FaCalendarAlt,
  FaClock,
  FaUserCheck,
  FaArrowRight,
  FaArrowLeft,
  FaVideo,
  FaExclamationCircle,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaChevronRight,
  FaBuilding,
  FaFire,
  FaTrophy,
  FaChartBar,
  FaBolt,
  FaCoins,
  FaMedal,
  FaStar,
  FaPlay,
  FaPaperPlane,
  FaExternalLinkAlt,
  FaFilter,
} from "react-icons/fa";
import { useStudyTracker } from "../../context/StudyTrackerContext";
import { useApi } from "../../context/ApiContext";

export default function StudentDashboard({ user, setActiveTab }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getMyCoursesProgress, getMyLiveSchedule } = useApi();
  const isRtl = i18n.language === "ar" || i18n.dir?.() === "rtl";
  const { streak, today, thisWeek, thisMonth } = useStudyTracker();
  const [coursesProgressData, setCoursesProgressData] = useState(null);
  const [loadingCoursesProgress, setLoadingCoursesProgress] = useState(false);

  // Live Lectures Schedule State (Update 10)
  const [liveScheduleCourses, setLiveScheduleCourses] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedScheduleCourseId, setSelectedScheduleCourseId] = useState("all");
  const [scheduleFilterMode, setScheduleFilterMode] = useState("all"); // "all" | "active"

  useEffect(() => {
    let isMounted = true;
    const fetchCoursesProgress = async () => {
      try {
        setLoadingCoursesProgress(true);
        if (getMyCoursesProgress) {
          const res = await getMyCoursesProgress({ per_page: 4 }, { useCache: true });
          if (isMounted && res?.data) {
            setCoursesProgressData(res.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch courses progress in StudentDashboard:", err);
      } finally {
        if (isMounted) setLoadingCoursesProgress(false);
      }
    };
    fetchCoursesProgress();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Live Lessons Schedule (Update 10)
  useEffect(() => {
    let isMounted = true;
    const fetchLiveSchedule = async () => {
      try {
        setLoadingSchedule(true);
        if (getMyLiveSchedule) {
          const res = await getMyLiveSchedule({ only_lessons: 1 }, { useCache: true });
          if (isMounted && res?.data && Array.isArray(res.data)) {
            setLiveScheduleCourses(res.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch live schedule in StudentDashboard:", err);
      } finally {
        if (isMounted) setLoadingSchedule(false);
      }
    };
    fetchLiveSchedule();
    return () => {
      isMounted = false;
    };
  }, []);

  // University & year display helpers
  const universityName =
    user?.university?.name ||
    (typeof user?.university === "string" ? user.university : null) ||
    t("profile.dashboard.notSpecified", "Not specified");
  const collegeYear = user?.college_year || t("profile.dashboard.notSpecified", "Not specified");

  // Compute lessons list from live courses schedule (Update 10)
  const flattenedSchedule = useMemo(() => {
    if (!liveScheduleCourses || !Array.isArray(liveScheduleCourses) || liveScheduleCourses.length === 0) {
      return [];
    }

    let coursesToInclude = liveScheduleCourses;
    if (selectedScheduleCourseId !== "all") {
      coursesToInclude = liveScheduleCourses.filter(
        (c) => String(c.course_id) === String(selectedScheduleCourseId)
      );
    }

    const allLessons = [];
    coursesToInclude.forEach((c) => {
      const schedule = c.schedule || [];
      schedule.forEach((lesson) => {
        allLessons.push({
          ...lesson,
          course_id: c.course_id,
          course_title: c.course_title,
          course_slug: c.slug,
          course_image: c.image,
          batch: c.batch,
          instructor: c.batch?.instructor,
        });
      });
    });

    // Filter by active if requested ("ولو عاويزن نلفتر نرجع المواعيد الفعالة فقط")
    let result = allLessons;
    if (scheduleFilterMode === "active") {
      result = result.filter(
        (item) =>
          item.is_active === true &&
          (item.is_upcoming ||
            item.is_today ||
            item.timing_status === "started" ||
            item.timing_status === "upcoming" ||
            item.can_join)
      );
    }

    // Sort: live/upcoming first, then by date/time ascending
    return result.sort((a, b) => {
      const aLive = a.timing_status === "started" || (a.is_today && a.can_join);
      const bLive = b.timing_status === "started" || (b.is_today && b.can_join);
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;

      if (a.is_upcoming && !b.is_upcoming) return -1;
      if (!a.is_upcoming && b.is_upcoming) return 1;

      const dateA = a.started_at || a.date || "";
      const dateB = b.started_at || b.date || "";
      if (dateA && dateB) return dateA.localeCompare(dateB);
      if (dateA) return -1;
      if (dateB) return 1;
      return 0;
    });
  }, [liveScheduleCourses, selectedScheduleCourseId, scheduleFilterMode]);

  const summary = coursesProgressData?.summary || null;
  const coursesProgressList =
    coursesProgressData?.all_courses?.data ||
    [
      ...(coursesProgressData?.video_courses?.data || []),
      ...(coursesProgressData?.live_courses?.data || []),
    ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Hero Welcome Banner (Classic Primary) ───────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-6 sm:p-8 shadow-lg border border-primary/20">
        {/* Subtle executive geometric background accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider border border-white/15">
              <FaGraduationCap className="text-xs text-white/90" />
              <span>{t("profile.dashboard.studentSpace", "Student Space")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t("profile.dashboard.welcomeBack", "Welcome back,")}{" "}
              <span>{user?.name || t("profile.dashboard.student", "Dear Student")}</span>
            </h1>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              {t(
                "profile.dashboard.heroDesc",
                "Track your live lecture schedule and learning progress seamlessly in one place."
              )}
            </p>

            {/* University & Academic Year Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/15 text-white">
                <FaBuilding className="text-white/70 text-xs" />
                <span className="text-white/75">{t("profile.dashboard.university", "University")}:</span>
                <strong className="font-semibold text-white">{universityName}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/15 text-white">
                <FaCalendarAlt className="text-white/70 text-xs" />
                <span className="text-white/75">{t("profile.dashboard.year", "Academic Year")}:</span>
                <strong className="font-semibold text-white">{collegeYear}</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab("profile")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary hover:bg-white/95 font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
            >
              <FaUserCheck className="text-sm" />
              <span>{t("profile.dashboard.viewProfile", "My Profile")}</span>
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-sm rounded-xl backdrop-blur-sm transition-all duration-150"
            >
              <span>{t("profile.dashboard.myCoursesBtn", "Enrolled Courses")}</span>
              {isRtl ? <FaArrowLeft className="text-xs" /> : <FaArrowRight className="text-xs" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Quick Stats Overview (Real Metrics) ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Courses Stat */}
        <div
          onClick={() => setActiveTab("courses")}
          className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaGraduationCap />
            </div>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
              {t("profile.dashboard.view", "View")}
              <FaChevronRight className="text-[10px]" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-text">
              {summary?.total_enrolled_courses ?? user?.stats?.courses ?? 0}
            </div>
            <div className="text-xs font-medium text-text-secondary mt-1">
              {t("profile.stats.courses", "Courses")}
            </div>
          </div>
        </div>

        {/* Orders Stat */}
        <div
          onClick={() => setActiveTab("orders")}
          className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaShoppingCart />
            </div>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
              {t("profile.dashboard.view", "View")}
              <FaChevronRight className="text-[10px]" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-text">{user?.stats?.orders ?? 0}</div>
            <div className="text-xs font-medium text-text-secondary mt-1">
              {t("profile.stats.orders", "Orders")}
            </div>
          </div>
        </div>

        {/* Rating Stat (Moved from Profile Sidebar) */}
        <div
          onClick={() => setActiveTab("ratings")}
          className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaStar />
            </div>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
              {t("profile.dashboard.view", "View")}
              <FaChevronRight className="text-[10px]" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1 text-2xl font-black text-text">
              <span>{user?.stats?.rating || user?.rating || 0}</span>
              <span className="text-xs font-normal text-text-secondary">/ 5</span>
            </div>
            <div className="text-xs font-medium text-text-secondary mt-1">
              {t("profile.stats.rating", "Rating")}
            </div>
          </div>
        </div>

        {/* Total Points Earned Stat (Update 15) */}
        <div
          onClick={() => setActiveTab("courses")}
          className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaCoins />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {summary?.overall_points_percentage ? `${summary.overall_points_percentage}%` : "Points"}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-text">
              {summary?.total_earned_points ?? 0}
            </div>
            <div className="text-xs font-medium text-text-secondary mt-1">
              {t("myCourses.totalPointsEarned", "Points Earned")}
            </div>
          </div>
        </div>

        {/* Study Materials Stat */}
        <div
          onClick={() => setActiveTab("materials")}
          className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaBook />
            </div>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
              {t("profile.dashboard.view", "View")}
              <FaChevronRight className="text-[10px]" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-text">{user?.materials_count || 0}</div>
            <div className="text-xs font-medium text-text-secondary mt-1">
              {t("profile.sidebar.myMaterials", "My Material")}
            </div>
          </div>
        </div>
      </div>

      {/* ─── UPDATE 11, 14, 15: Course Progress, Ranking & Points Section ──── */}
      {coursesProgressList.length > 0 && (
        <div className="rounded-3xl bg-surface border border-border/70 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FaChartBar className="text-lg" />
                </div>
                <h2 className="text-xl font-bold text-text">
                  {t("myCourses.dashboardProgressTitle", "My Learning Progress & Ranking")}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary">
                {t(
                  "myCourses.dashboardProgressSubtitle",
                  "Track your completion, points, and class ranking across enrolled courses"
                )}
              </p>
            </div>

            <button
              onClick={() => setActiveTab("courses")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-secondary transition-all shadow-sm self-start sm:self-auto"
            >
              <span>{t("myCourses.viewAllCourses", "View All Courses")}</span>
              <FaChevronRight className="text-[10px]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coursesProgressList.slice(0, 4).map((course, idx) => {
              const live = course.course_type === "live" || course.type === "live_course";
              const courseId = course.course_id || course.id;
              const progressPct = Math.min(100, Math.max(0, Number(course.progress?.percentage || 0)));
              const rank = course.rank || {};
              const points = course.points || {};

              return (
                <div
                  key={courseId || idx}
                  onClick={() => {
                    if (live) {
                      navigate(`/live-courses/${courseId}/lessons`);
                    } else {
                      navigate(`/courses/${courseId}/lessons`);
                    }
                  }}
                  className="p-4 rounded-2xl bg-background/60 hover:bg-background border border-border/70 hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={course.image || "/course-placeholder.jpg"}
                      alt={course.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border"
                      onError={(e) => {
                        e.currentTarget.src = "/course-placeholder.jpg";
                      }}
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            live
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {live ? t("courses.liveCourse", "Live") : t("courses.videoCourse", "Video")}
                        </span>
                        {course.category && (
                          <span className="text-[10px] text-text-secondary truncate">
                            {course.category}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-text line-clamp-1 group-hover:text-primary transition-colors">
                        {course.title || course.name}
                      </h4>
                    </div>
                  </div>

                  {/* Progress Bar (Update 11) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary font-medium">
                        {t("myCourses.progress", "Progress")}:{" "}
                        <strong className="text-text font-bold">
                          {course.progress?.completed_lessons || 0} / {course.progress?.total_lessons || 0}
                        </strong>
                      </span>
                      <span className="font-black text-primary">{progressPct}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-border/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPct >= 100
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-primary to-blue-400"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Rank & Points Mini Row (Update 14 & 15) */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    {/* Rank (Update 14) */}
                    <div className="flex items-center gap-1.5">
                      {rank.is_first ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-extrabold text-[11px]">
                          🏆 {rank.rank_label || "1 / 1"}
                        </span>
                      ) : rank.is_top_three ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
                          🥇 {rank.rank_label}
                        </span>
                      ) : (
                        <span className="text-text-secondary text-[11px]">
                          {t("myCourses.rankInCourse", "Rank")}:{" "}
                          <strong className="text-text">
                            {rank.rank_label || `${rank.current_rank || 1} / ${rank.total_students || 1}`}
                          </strong>
                        </span>
                      )}
                    </div>

                    {/* Points (Update 15) */}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-text">
                      <FaCoins className="text-yellow-500 text-xs" />
                      <span>{points.points_label || `${points.earned_points || 0} pts`}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Live Lectures Schedule Section (Update 10) ─────────────────── */}
      <div className="rounded-3xl bg-surface border border-border/70 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <FaBroadcastTower className="text-lg animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-text">
                {t("profile.dashboard.scheduleTitle", "Live Lectures Schedule")}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">
              {t(
                "profile.dashboard.scheduleSubtitle",
                "Follow the live broadcast schedule and interactive sessions for your enrolled courses."
              )}
            </p>
          </div>

          {/* Controls: Course Selector & Active vs All Filter */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Course Filter Dropdown if student has multiple live courses */}
            {liveScheduleCourses.length > 1 && (
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedScheduleCourseId}
                  onChange={(e) => setSelectedScheduleCourseId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-background border border-border text-text focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="all">
                    {t("profile.dashboard.allLiveCourses", "All Live Courses")} ({liveScheduleCourses.length})
                  </option>
                  {liveScheduleCourses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Active Only Filter (Update 10: ولو عايزين نفلتر نرجع المواعيد الفعالة فقط) */}
            <div className="flex items-center gap-1 p-1 bg-background rounded-xl border border-border/60 text-xs">
              <button
                type="button"
                onClick={() => setScheduleFilterMode("active")}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  scheduleFilterMode === "active"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                {t("profile.dashboard.activeLessonsFilter", "Active & Upcoming")}
              </button>
              <button
                type="button"
                onClick={() => setScheduleFilterMode("all")}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  scheduleFilterMode === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                {t("profile.dashboard.allLessonsFilter", "All Scheduled")}
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Cards List */}
        {loadingSchedule ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-secondary">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-medium">{t("common.loading", "Loading schedule...")}</span>
          </div>
        ) : flattenedSchedule.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-background/50 border border-border/60 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-surface border border-border flex items-center justify-center text-text-secondary text-xl">
              <FaCalendarAlt />
            </div>
            <h4 className="text-sm font-bold text-text">
              {t("profile.dashboard.noScheduledSessions", "No live lecture sessions found for the selected filter.")}
            </h4>
            <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
              {t(
                "profile.dashboard.syncNotice",
                "Your live lecture schedule and sessions will be automatically synced once finalized by the academy administration."
              )}
            </p>
            {scheduleFilterMode === "active" && (
              <button
                type="button"
                onClick={() => setScheduleFilterMode("all")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-surface border border-border hover:border-primary text-primary transition-colors shadow-sm"
              >
                {t("profile.dashboard.allLessonsFilter", "View All Scheduled")}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {flattenedSchedule.map((item, idx) => {
              const isLiveNow = item.timing_status === "started" || (item.is_today && item.can_join);
              const isUpcoming = item.is_upcoming || item.timing_status === "upcoming";
              const isCompleted = item.is_past;

              return (
                <div
                  key={item.id || item.batch_lesson_id || idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isLiveNow
                      ? "bg-gradient-to-r from-rose-500/5 via-background to-background border-rose-500/40 shadow-sm shadow-rose-500/10"
                      : item.is_active === false
                      ? "bg-background/40 border-border/40 opacity-75"
                      : "bg-background border-border/70 hover:border-primary/40 shadow-sm"
                  }`}
                >
                  {/* Left / Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <img
                      src={item.course_image || "/course-placeholder.jpg"}
                      alt={item.course_title}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-border"
                      onError={(e) => {
                        e.currentTarget.src = "/course-placeholder.jpg";
                      }}
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Course badge, Batch name, Timing Pill */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className="text-[11px] font-bold text-primary truncate max-w-[220px]"
                          title={item.course_title}
                        >
                          {item.course_title}
                        </span>

                        {item.batch?.name && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface text-text-secondary border border-border/60 truncate max-w-[180px]">
                            {item.batch.name}
                          </span>
                        )}

                        {/* Timing status pill */}
                        {isLiveNow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-sm animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            {t("profile.dashboard.sessionLiveNow", "LIVE NOW")}
                          </span>
                        ) : isUpcoming ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            <FaClock className="text-[9px]" />
                            {t("profile.dashboard.sessionUpcoming", "Upcoming")}
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/10 text-text-secondary border border-border/50">
                            {t("profile.dashboard.sessionCompleted", "Completed")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/10 text-text-secondary border border-border/50">
                            {t("profile.dashboard.sessionNotScheduled", "Not Scheduled")}
                          </span>
                        )}

                        {/* Attended badge */}
                        {item.is_attended && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <FaCheckCircle className="text-[9px]" />
                            {t("profile.dashboard.attendedBadge", "Attended")}
                          </span>
                        )}
                      </div>

                      {/* Lesson Title */}
                      <h3 className="text-sm sm:text-base font-bold text-text leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Section Title if available */}
                      {item.section_title && (
                        <p className="text-xs text-text-secondary flex items-center gap-1.5 truncate">
                          <span className="text-primary font-medium">§</span>
                          <span>{item.section_title}</span>
                        </p>
                      )}

                      {/* Date, Time, Instructor */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary pt-0.5">
                        <span className="flex items-center gap-1 font-medium">
                          <FaCalendarAlt className="text-primary text-[11px]" />
                          {item.formatted_date || item.date || t("myCourses.dateTBA", "Date TBA")}
                        </span>

                        {(item.formatted_time || item.time) && (
                          <span className="flex items-center gap-1 font-medium">
                            <FaClock className="text-primary text-[11px]" />
                            {item.formatted_time || item.time}
                          </span>
                        )}

                        {item.day_name && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface border border-border/60">
                            {item.day_name}
                          </span>
                        )}

                        {item.instructor?.name && (
                          <span className="flex items-center gap-1.5 font-medium">
                            <FaChalkboardTeacher className="text-primary text-[11px]" />
                            <span>{item.instructor.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Zoom Live Link Button */}
                    {item.zoom_link && (item.can_join || item.is_active) && (
                      <a
                        href={item.zoom_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/20 transition-all"
                      >
                        <FaVideo className="text-xs" />
                        <span>{t("profile.dashboard.joinLiveZoom", "Join Zoom")}</span>
                        <FaExternalLinkAlt className="text-[10px]" />
                      </a>
                    )}

                    {/* Telegram Batch Link Button */}
                    {item.batch?.telegram_link && (
                      <a
                        href={item.batch.telegram_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition-colors"
                      >
                        <FaPaperPlane className="text-xs" />
                        <span>{t("profile.dashboard.telegramBatch", "Telegram")}</span>
                      </a>
                    )}

                    {/* View Course Lessons */}
                    <button
                      type="button"
                      onClick={() => navigate(`/live-courses/${item.course_id}/lessons`)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-surface border border-border hover:border-primary/50 text-text transition-colors"
                    >
                      {t("profile.dashboard.viewLessons", "Lessons")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Streamlined Study Tracker & Activity Section (In place, visually rich, 100% English & Ukrainian) ─── */}
      <div className="rounded-3xl bg-surface border border-border/80 p-5 sm:p-6 shadow-sm space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all shadow-sm ${
                streak.is_studied_today
                  ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white animate-pulse"
                  : "bg-background text-gray-400 border border-border"
              }`}
            >
              <FaFire className={streak.is_studied_today ? "text-white" : "text-gray-400"} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-text">
                  {streak.current_streak || 0} {t("studyTracker.daysStreak", "Days Streak")}
                </h3>
                {streak.is_studied_today ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <FaCheckCircle className="text-[10px]" />
                    {t("studyTracker.studiedToday", "Active Today 🔥")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <FaBolt className="text-[10px]" />
                    {t("studyTracker.studyNeeded", "Study today to keep streak!")}
                  </span>
                )}
              </div>

              <p className="text-xs text-text-secondary mt-0.5">
                {streak.is_studied_today
                  ? t("studyTracker.greatStreak", "Keep the momentum going! Great work today.")
                  : t("studyTracker.startStudying", "Spend a few minutes studying now to maintain your flame!")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("study_tracker")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-semibold transition-all self-start sm:self-auto shadow-sm"
          >
            <span>{t("studyTracker.viewFullReport", "Monthly Report & Calendar")}</span>
            {isRtl ? <FaArrowLeft className="text-[10px]" /> : <FaArrowRight className="text-[10px]" />}
          </button>
        </div>

        {/* Visual Charts & Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Quick Metrics (Today's Study + Best Streak + Commitment) */}
          <div className="space-y-3 flex flex-col justify-between">
            {/* Today's Study Card */}
            <div className="p-4 rounded-2xl border border-border/80 bg-background/50 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                  {t("studyTracker.todayStudy", "Today's Study")}
                </span>
                <div className="text-2xl font-black text-text">
                  {today.formatted_time || `${today.hours || 0}h`}
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {today.total_seconds > 0
                    ? t("studyTracker.activeStudyLogged", "Net focused active time logged today")
                    : t("studyTracker.noTimeYet", "Timer running as you browse & learn")}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg shrink-0">
                <FaClock />
              </div>
            </div>

            {/* Best Streak & Commitment 2-col */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50">
                <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1">
                  <FaTrophy className="text-xs" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    {t("studyTracker.longestStreak", "Best Streak")}
                  </span>
                </div>
                <div className="text-lg font-black text-text">
                  {streak.longest_streak || streak.current_streak || 0}{" "}
                  <span className="text-xs font-normal text-text-secondary">{t("studyTracker.days", "days")}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50">
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 mb-1">
                  <FaChartBar className="text-xs" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    {t("studyTracker.monthlyGoal", "Commitment")}
                  </span>
                </div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {thisMonth.commitment_percentage || 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Weekly 7-Day Interactive Activity Bar Chart */}
          <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl border border-border/80 bg-background/50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text flex items-center gap-1.5">
                  <FaChartBar className="text-primary text-xs" />
                  <span>{t("studyTracker.weeklyActivity", "Weekly Activity (Last 7 Days)")}</span>
                </h4>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {t("studyTracker.totalThisWeek", "Total:")}{" "}
                  <strong className="text-text">{thisWeek.formatted_time || `${thisWeek.total_hours || 0}h`}</strong>{" "}
                  {t("studyTracker.across", "across")}{" "}
                  <strong className="text-text">{thisWeek.active_days || 0}</strong>{" "}
                  {t("studyTracker.activeDays", "active days")}
                </p>
              </div>

              <div className="flex items-center gap-2.5 text-[11px] text-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-gradient-to-t from-amber-500 to-orange-500"></span>
                  {t("studyTracker.studied", "Studied")}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-border"></span>
                  {t("studyTracker.noStudy", "No study")}
                </span>
              </div>
            </div>

            {/* 7 Days Bars */}
            <div className="grid grid-cols-7 gap-2 pt-4 items-end min-h-[120px]">
              {(thisWeek.days && thisWeek.days.length > 0
                ? thisWeek.days
                : [
                    { day_short: "Mon", total_seconds: 0, is_studied: false },
                    { day_short: "Tue", total_seconds: 0, is_studied: false },
                    { day_short: "Wed", total_seconds: 0, is_studied: false },
                    { day_short: "Thu", total_seconds: 0, is_studied: false },
                    { day_short: "Fri", total_seconds: 0, is_studied: false },
                    { day_short: "Sat", total_seconds: 0, is_studied: false },
                    { day_short: "Sun", total_seconds: 0, is_studied: false },
                  ]
              ).map((day, idx) => {
                const maxSeconds = Math.max(
                  ...((thisWeek.days || []).map((d) => d.total_seconds || 0)),
                  3600
                );
                const heightPercent = day.is_studied
                  ? Math.min(100, Math.max(20, Math.round(((day.total_seconds || 0) / maxSeconds) * 100)))
                  : 8;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 group">
                    {/* Time tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-text-secondary select-none">
                      {day.formatted_time || (day.hours ? `${day.hours}h` : "0m")}
                    </div>

                    {/* Bar track & fill */}
                    <div className="w-full max-w-[32px] h-20 bg-surface border border-border/70 rounded-lg flex items-end p-1 overflow-hidden relative">
                      <div
                        className={`w-full rounded-md transition-all duration-500 ${
                          day.is_studied
                            ? "bg-gradient-to-t from-amber-500 to-orange-500 shadow-sm"
                            : "bg-border/60"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Day Label */}
                    <span
                      className={`text-[11px] font-medium transition-colors ${
                        day.is_today
                          ? "text-primary font-bold underline"
                          : "text-text-secondary"
                      }`}
                    >
                      {day.day_short || day.day_name?.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Quick Shortcuts ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab("courses")}
          className="p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary text-start transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
            <FaVideo />
          </div>
          <h4 className="font-bold text-text text-sm mb-1">{t("profile.dashboard.continueCourses", "Continue Courses")}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t("profile.dashboard.continueCoursesDesc", "Watch recorded lectures and test your knowledge.")}
          </p>
        </button>

        <button
          onClick={() => setActiveTab("materials")}
          className="p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary text-start transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
            <FaBook />
          </div>
          <h4 className="font-bold text-text text-sm mb-1">{t("profile.dashboard.materialsLibrary", "Materials & Question Bank")}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t("profile.dashboard.materialsLibraryDesc", "Browse and download your KROK summaries and files.")}
          </p>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className="p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary text-start transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
            <FaCheckCircle />
          </div>
          <h4 className="font-bold text-text text-sm mb-1">{t("profile.dashboard.accountSettings", "Account Settings & Info")}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t("profile.dashboard.accountSettingsDesc", "Update phone, university, and academic year.")}
          </p>
        </button>
      </div>
    </div>
  );
}
