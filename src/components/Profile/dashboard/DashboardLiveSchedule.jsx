import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaBroadcastTower,
  FaCalendarAlt,
  FaClock,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaVideo,
  FaExternalLinkAlt,
  FaPaperPlane,
} from "react-icons/fa";

// ── Schedule Lesson Card ──────────────────────────────────────────────────────
function LiveScheduleCard({ item, navigate, t }) {
  const isLiveNow = item.timing_status === "started" || (item.is_today && item.can_join);
  const isUpcoming = item.is_upcoming || item.timing_status === "upcoming";
  const isCompleted = item.is_past;

  return (
    <div
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
          {/* Badges row */}
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

            {item.is_attended && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <FaCheckCircle className="text-[9px]" />
                {t("profile.dashboard.attendedBadge", "Attended")}
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-bold text-text leading-snug line-clamp-2">
            {item.title}
          </h3>

          {item.section_title && (
            <p className="text-xs text-text-secondary flex items-center gap-1.5 truncate">
              <span className="text-primary font-medium">§</span>
              <span>{item.section_title}</span>
            </p>
          )}

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
}

// ── Main Section Component ────────────────────────────────────────────────────
export default function DashboardLiveSchedule({
  liveScheduleCourses,
  flattenedSchedule,
  loadingSchedule,
  selectedScheduleCourseId,
  setSelectedScheduleCourseId,
  scheduleFilterMode,
  setScheduleFilterMode,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl bg-surface border border-border/70 p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
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

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {liveScheduleCourses.length > 1 && (
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
          )}

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

      {/* Body */}
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
          {flattenedSchedule.map((item, idx) => (
            <LiveScheduleCard
              key={item.id || item.batch_lesson_id || idx}
              item={item}
              navigate={navigate}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
