import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaCheckCircle,
  FaBroadcastTower,
  FaPaperPlane,
  FaChalkboardTeacher,
  FaExternalLinkAlt,
  FaFilter,
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";

export default function LiveCourseScheduleModal({
  isOpen,
  onClose,
  course,
  onNavigateToLessons,
}) {
  const { t } = useTranslation();
  const { getMyLiveSchedule } = useApi();
  const [filterMode, setFilterMode] = useState("all"); // "all" | "active"
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const courseId = course?.course_id || course?.id;

  useEffect(() => {
    if (!isOpen || !courseId) return;

    if (course.schedule && course.schedule.length > 0) {
      setFetchedData(course);
      return;
    }

    let isMounted = true;
    const loadSchedule = async () => {
      try {
        setLoading(true);
        if (getMyLiveSchedule) {
          const res = await getMyLiveSchedule({ only_lessons: 1 }, { useCache: true });
          if (isMounted && res?.data && Array.isArray(res.data)) {
            const found = res.data.find(
              (c) => String(c.course_id) === String(courseId)
            );
            setFetchedData(found || course);
          }
        }
      } catch (err) {
        console.warn("Could not load schedule for course:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, [isOpen, courseId, course, getMyLiveSchedule]);

  if (!isOpen || !course) return null;

  const currentCourse = fetchedData || course;
  const batch = currentCourse.batch || {};
  const instructor = batch.instructor || {};
  const schedule = currentCourse.schedule || [];

  const filteredSchedule = useMemo(() => {
    if (filterMode === "active") {
      return schedule.filter(
        (item) =>
          item.is_active === true &&
          (item.is_upcoming ||
            item.is_today ||
            item.timing_status === "started" ||
            item.timing_status === "upcoming" ||
            item.can_join)
      );
    }
    return schedule;
  }, [schedule, filterMode]);

  const upcomingCount = schedule.filter((i) => i.is_upcoming || i.is_today).length;
  const attendedCount = schedule.filter((i) => i.is_attended).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-surface border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-primary/10 via-surface to-surface flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-xl shrink-0">
              <FaBroadcastTower />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500 text-white">
                  {t("courses.liveCourse", "Live")}
                </span>
                {batch.name && (
                  <span className="text-xs font-semibold text-text-secondary truncate max-w-xs">
                    {batch.name}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-text truncate">
                {course.course_title || course.title}
              </h3>

              {/* Instructor & Telegram info */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-text-secondary">
                {instructor.name && (
                  <span className="flex items-center gap-1.5">
                    <FaChalkboardTeacher className="text-primary" />
                    <span>{instructor.name}</span>
                  </span>
                )}
                {batch.telegram_link && (
                  <a
                    href={batch.telegram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sky-500 hover:text-sky-600 font-semibold"
                  >
                    <FaPaperPlane className="text-[11px]" />
                    <span>{t("profile.dashboard.telegramBatch", "Telegram Group")}</span>
                    <FaExternalLinkAlt className="text-[9px]" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-text hover:bg-background transition-colors shrink-0"
            aria-label="Close modal"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* ── Subheader Controls & Metrics ── */}
        <div className="px-5 sm:px-6 py-3 border-b border-border/60 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-text-secondary">
            <span>
              {t("myCourses.totalLessons", "Total Lessons")}:{" "}
              <strong className="text-text font-bold">{schedule.length}</strong>
            </span>
            <span>
              {t("profile.dashboard.sessionUpcoming", "Upcoming")}:{" "}
              <strong className="text-blue-500 font-bold">{upcomingCount}</strong>
            </span>
            <span>
              {t("profile.dashboard.attendedBadge", "Attended")}:{" "}
              <strong className="text-emerald-500 font-bold">{attendedCount}</strong>
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-surface rounded-xl border border-border">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterMode === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {t("profile.dashboard.allLessonsFilter", "All Scheduled")}
            </button>
            <button
              onClick={() => setFilterMode("active")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterMode === "active"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {t("profile.dashboard.activeLessonsFilter", "Active & Upcoming")}
            </button>
          </div>
        </div>

        {/* ── Timeline Lessons List ── */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-3.5 scrollbar-thin">
          {filteredSchedule.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              <FaCalendarAlt className="text-3xl mx-auto mb-2 opacity-40 text-primary" />
              <p className="text-sm font-medium">
                {t(
                  "profile.dashboard.noScheduledSessions",
                  "No live lecture sessions found for the selected filter."
                )}
              </p>
            </div>
          ) : (
            filteredSchedule.map((lesson, idx) => {
              const isLiveNow =
                lesson.is_today ||
                lesson.timing_status === "started" ||
                (lesson.can_join && lesson.zoom_link);

              return (
                <div
                  key={lesson.id || lesson.batch_lesson_id || idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                    isLiveNow
                      ? "bg-emerald-500/5 border-emerald-500/30 shadow-sm"
                      : lesson.is_upcoming
                      ? "bg-surface border-border hover:border-primary/40 shadow-sm"
                      : "bg-background/60 border-border/50 opacity-80"
                  }`}
                >
                  {/* Left: Timing & Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status Badges */}
                      {isLiveNow ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white animate-pulse shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          {t("profile.dashboard.sessionLiveNow", "LIVE NOW")}
                        </span>
                      ) : lesson.is_upcoming ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {t("profile.dashboard.sessionUpcoming", "Upcoming")}
                        </span>
                      ) : lesson.is_past ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-500/10 text-text-secondary border border-border">
                          {t("profile.dashboard.sessionCompleted", "Completed")}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                          {t("profile.dashboard.sessionNotScheduled", "Not Scheduled")}
                        </span>
                      )}

                      {/* Attended Pill */}
                      {lesson.is_attended && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <FaCheckCircle className="text-[10px]" />
                          {t("profile.dashboard.attendedBadge", "Attended")}
                        </span>
                      )}

                      {lesson.section_title && (
                        <span className="text-xs text-text-secondary truncate">
                          {lesson.section_title}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-text leading-snug">
                      {lesson.title}
                    </h4>

                    {/* Schedule Date & Time */}
                    <div className="flex items-center gap-3 text-xs text-text-secondary pt-0.5 flex-wrap">
                      {lesson.day_name && (
                        <span className="font-semibold text-text">{lesson.day_name}</span>
                      )}
                      {(lesson.formatted_date || lesson.date) && (
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-primary text-[11px]" />
                          {lesson.formatted_date || lesson.date}
                        </span>
                      )}
                      {(lesson.formatted_time || lesson.time) && (
                        <span className="flex items-center gap-1">
                          <FaClock className="text-primary text-[11px]" />
                          {lesson.formatted_time || lesson.time}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {/* Direct Zoom Join Link */}
                    {lesson.zoom_link && lesson.can_join ? (
                      <a
                        href={lesson.zoom_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                      >
                        <FaVideo className="text-xs" />
                        <span>{t("profile.dashboard.joinLiveZoom", "Join Zoom")}</span>
                        <FaExternalLinkAlt className="text-[9px]" />
                      </a>
                    ) : null}

                    {/* Open Lesson in Platform */}
                    {onNavigateToLessons && (
                      <button
                        type="button"
                        onClick={() => onNavigateToLessons(course.course_id || course.id)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-background border border-border hover:border-primary text-text transition-colors"
                      >
                        {t("profile.dashboard.viewLessons", "Go to Lessons")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 px-6 border-t border-border bg-background/50 flex items-center justify-between gap-4 text-xs">
          <p className="text-text-secondary text-[11px] truncate">
            {t(
              "profile.dashboard.syncNotice",
              "Your live lecture schedule and sessions will be automatically synced once finalized by the academy administration."
            )}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-secondary transition-colors shrink-0 shadow-sm"
          >
            {t("common.close", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
