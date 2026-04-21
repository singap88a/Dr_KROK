import React, { useState } from "react";
import {
  FaPlay,
  FaStar,
  FaVideo,
  FaBroadcastTower,
  FaCalendarAlt,
  FaGlobe,
  FaTag,
  FaGraduationCap,
  FaClock,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ─── helpers ────────────────────────────────────────────────────────────────
const isLive = (course) =>
  course.type === "live_course" ||
  course.type === "live" ||
  course.course_type === "live_course" ||
  course.course_type === "live";

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatPrice = (price, discount) => {
  if (!price) return null;
  const original = parseFloat(price);
  const pct = discount ? parseFloat(discount) : 0;
  const final = pct ? original - (original * pct) / 100 : original;
  return { original, pct, final };
};

// ─── Stars ──────────────────────────────────────────────────────────────────
const Stars = ({ rating }) => {
  const val = Number(rating) || 0;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          className={`text-xs ${
            s <= val ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </span>
  );
};

// ─── Single Card ─────────────────────────────────────────────────────────────
const CourseCard = ({ course, onClick }) => {
  const { t } = useTranslation();
  const live = isLive(course);
  const price = formatPrice(course.price, course.discount);

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border cursor-pointer
        bg-surface border-border shadow-sm
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <img
          src={course.image || course.image_url || "/course-placeholder.jpg"}
          alt={course.title || course.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/course-placeholder.jpg";
          }}
        />

        {/* dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
              live
                ? "bg-rose-500"
                : "bg-primary"
            }`}
          >
            {live ? (
              <FaBroadcastTower className="text-white text-lg" />
            ) : (
              <FaPlay className="text-white text-sm translate-x-0.5" />
            )}
          </div>
        </div>

        {/* Type badge – top-left */}
        <span
          className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow ${
            live
              ? "bg-rose-500 text-white"
              : "bg-primary text-white"
          }`}
        >
          {live ? (
            <><FaBroadcastTower className="inline mr-1 text-[10px]" />Live</>
          ) : (
            <><FaVideo className="inline mr-1 text-[10px]" />Video</>
          )}
        </span>

        {/* Level badge – top-right */}
        {course.level && (
          <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/50 text-white capitalize">
            {course.level}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-2 leading-snug">
          {course.title || course.name}
        </h3>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-secondary">
          {course.language && (
            <span className="flex items-center gap-1">
              <FaGlobe className="shrink-0" />
              {course.language}
            </span>
          )}
          {course.college_year && (
            <span className="flex items-center gap-1">
              <FaGraduationCap className="shrink-0" />
              {t("courses.collegeYear")} {course.college_year}
            </span>
          )}

          {course.course_duration_days && (
            <span className="flex items-center gap-1">
              <FaClock className="shrink-0" />
              {course.course_duration_days}d
            </span>
          )}
        </div>

        {/* Live: session date */}
        {live && course.started_at && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <FaCalendarAlt />
            {formatDate(course.started_at)}
          </div>
        )}

        {/* Rating */}
        {course.avg_rating !== undefined && course.avg_rating !== null && (
          <div className="flex items-center gap-1.5">
            <Stars rating={course.avg_rating} />
            <span className="text-xs text-text-secondary">{Number(course.avg_rating).toFixed(1)}</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border">
          <div className="flex flex-col">
            {price ? (
              <>
                {price.pct > 0 && (
                  <span className="text-[11px] line-through text-text-secondary">
                    ₴{price.original.toLocaleString()}
                  </span>
                )}
                <span className="text-sm font-bold text-primary">
                  ₴{price.final.toLocaleString()}
                  {price.pct > 0 && (
                    <span className="ml-1 text-[11px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                      -{price.pct}%
                    </span>
                  )}
                </span>
              </>
            ) : null}
          </div>

          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-all ${
              live
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-primary hover:bg-secondary"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {live ? t("liveCourses.joinLive") : t("myCourses.continue")}
            <FaChevronRight className="text-[10px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Section header ──────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, label, count, accent }) => (
  <div className={`flex items-center gap-3 mb-4`}>
    <span
      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
        accent === "live"
          ? "bg-rose-100 dark:bg-rose-900/30 text-rose-500"
          : "bg-primary/10 text-primary"
      }`}
    >
      <Icon className="text-base" />
    </span>
    <div>
      <h3 className="font-bold text-base">{label}</h3>
    </div>
    <span
      className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${
        accent === "live"
          ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600"
          : "bg-primary/10 text-primary"
      }`}
    >
      {count}
    </span>
  </div>
);

// ─── Filter tabs ─────────────────────────────────────────────────────────────
const FILTERS = ["all", "video_course", "live_course"];

// ─── Main component ───────────────────────────────────────────────────────────
const MyCourses = ({ enrolledCourses }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");

  const handleCourseClick = (course) => {
    if (isLive(course)) {
      navigate(`/live-courses/${course.id}/lessons`);
    } else {
      navigate(`/courses/${course.id}/lessons`);
    }
  };

  const videoCourses = enrolledCourses.filter((c) => !isLive(c));
  const liveCourses = enrolledCourses.filter((c) => isLive(c));

  const visibleVideo =
    filter === "live_course" ? [] : filter === "video_course" ? videoCourses : videoCourses;
  const visibleLive =
    filter === "video_course" ? [] : filter === "live_course" ? liveCourses : liveCourses;

  const filterLabel = (f) => {
    if (f === "all") return t("testYourself.filters.all");
    if (f === "video_course") return t("courses.videoCourse");
    return t("courses.liveCourse");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <h2 className="text-2xl font-bold">{t("myCourses.title")}</h2>
        <span className="text-sm text-text-secondary">
          {t("myCourses.enrolledCount", { count: enrolledCourses.length })}
        </span>
      </div>

      {/* Filter tabs */}
      {enrolledCourses.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const cnt =
              f === "all"
                ? enrolledCourses.length
                : f === "video_course"
                ? videoCourses.length
                : liveCourses.length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filter === f
                    ? f === "live_course"
                      ? "bg-rose-500 text-white border-rose-500 shadow"
                      : "bg-primary text-white border-primary shadow"
                    : "bg-surface border-border text-text-secondary hover:border-primary hover:text-primary"
                }`}
              >
                {f === "live_course" ? (
                  <FaBroadcastTower className="text-xs" />
                ) : f === "video_course" ? (
                  <FaVideo className="text-xs" />
                ) : (
                  <FaTag className="text-xs" />
                )}
                {filterLabel(f)}
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    filter === f ? "bg-white/20" : "bg-border"
                  }`}
                >
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Video Courses section ── */}
      {visibleVideo.length > 0 && (
        <section>
          <SectionHeader
            icon={FaVideo}
            label={t("courses.videoCourse")}
            count={visibleVideo.length}
            accent="video"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {visibleVideo.map((course, idx) => (
              <CourseCard
                key={`video-${course.id}-${idx}`}
                course={course}
                onClick={() => handleCourseClick(course)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Live Courses section ── */}
      {visibleLive.length > 0 && (
        <section>
          <SectionHeader
            icon={FaBroadcastTower}
            label={t("courses.liveCourse")}
            count={visibleLive.length}
            accent="live"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {visibleLive.map((course, idx) => (
              <CourseCard
                key={`live-${course.id}-${idx}`}
                course={course}
                onClick={() => handleCourseClick(course)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {enrolledCourses.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FaPlay className="text-2xl text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{t("myCourses.noCourses")}</h3>
          <p className="text-text-secondary text-sm">{t("myCourses.browseCourses")}</p>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
