import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaPlay,
  FaStar,
  FaVideo,
  FaBroadcastTower,
  FaCalendarAlt,
  FaClock,
  FaChevronRight,
  FaTrophy,
  FaMedal,
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaPaperPlane,
  FaCoins,
  FaCheck,
  FaTimes,
  FaSyncAlt,
  FaFileAlt,
  FaAward,
  FaChevronLeft,
  FaFilter,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import LiveCourseScheduleModal from "./LiveCourseScheduleModal";

// ─── Helpers ────────────────────────────────────────────────────────────────
const isLive = (course) =>
  course?.course_type === "live" ||
  course?.course_type === "live_course" ||
  course?.type === "live_course" ||
  course?.type === "live";

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

// ─── Tests History Modal ─────────────────────────────────────────────────────
const TestsHistoryModal = ({ course, isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen || !course) return null;

  const tests = Array.isArray(course.tests) ? course.tests : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
              <FaFileAlt />
            </div>
            <div>
              <h3 className="font-bold text-lg text-text">
                {t("myCourses.testsHistoryModalTitle", "Course Tests History")}
              </h3>
              <p className="text-xs text-text-secondary truncate max-w-sm sm:max-w-md">
                {course.title || course.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text hover:bg-border/40 rounded-xl transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {tests.length === 0 ? (
            <div className="py-12 text-center text-text-secondary">
              <FaFileAlt className="text-3xl mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                {t("myCourses.noTestsYet", "No tests solved in this course yet.")}
              </p>
            </div>
          ) : (
            tests.map((test, idx) => {
              const passed = Boolean(test.passed);
              return (
                <div
                  key={test.student_test_id || idx}
                  className="p-4 rounded-xl border border-border/80 bg-background/50 hover:bg-background transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-text">
                        {test.test_name || `Test #${idx + 1}`}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-border text-text-secondary">
                        {test.is_lesson_test
                          ? t("myCourses.lessonTest", "Lesson Quiz")
                          : t("myCourses.finalTest", "Final Exam")}
                      </span>
                    </div>

                    {test.lesson_title && (
                      <p className="text-xs text-text-secondary">
                        {test.lesson_title}
                      </p>
                    )}

                    {test.date && (
                      <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                        <FaCalendarAlt className="text-[10px]" />
                        <span>{formatDate(test.date)}</span>
                      </div>
                    )}
                  </div>

                  {/* Score & Passed Status */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-sm font-bold text-text">
                        {test.student_score} / {test.total_score}
                      </div>
                      <div className="text-[11px] text-text-secondary font-medium">
                        {test.percentage !== undefined ? `${test.percentage}%` : ""}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        passed
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                      }`}
                    >
                      {passed ? (
                        <>
                          <FaCheck className="text-[10px]" />
                          {t("myCourses.passed", "Passed")}
                        </>
                      ) : (
                        <>
                          <FaTimes className="text-[10px]" />
                          {t("myCourses.failed", "Failed")}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex justify-end bg-surface/80">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-surface border border-border hover:bg-border/50 text-text transition-colors"
          >
            {t("myCourses.close", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Single Course Card ──────────────────────────────────────────────────────
const CourseProgressCard = ({ course, onOpenTests, onOpenSchedule }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const live = isLive(course);

  const courseId = course.course_id || course.id;
  const progress = course.progress || {};
  const points = course.points || {};
  const rank = course.rank || {};
  const testsSummary = course.tests_summary || {};
  const cert = course.certificate_eligibility || {};
  const batch = course.batch || {};

  const progressPct = Math.min(100, Math.max(0, Number(progress.percentage || 0)));
  const completedLessons = Number(progress.completed_lessons || 0);
  const totalLessons = Number(progress.total_lessons || 0);

  const handleCardClick = () => {
    if (live) {
      navigate(`/live-courses/${courseId}/lessons`);
    } else {
      navigate(`/courses/${courseId}/lessons`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* ── 1. Thumbnail & Top Badges ── */}
      <div className="relative h-48 overflow-hidden shrink-0 bg-background">
        <img
          src={course.image || course.image_url || "/course-placeholder.jpg"}
          alt={course.title || course.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/course-placeholder.jpg";
          }}
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />

        {/* Play/Join Button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform ${
              live ? "bg-rose-500 text-white" : "bg-primary text-white"
            }`}
          >
            {live ? <FaBroadcastTower className="text-base" /> : <FaPlay className="text-sm translate-x-0.5" />}
          </div>
        </div>

        {/* Type Badge - Top Left */}
        <span
          className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-md backdrop-blur-md flex items-center gap-1 text-white ${
            live ? "bg-rose-500/90" : "bg-primary/90"
          }`}
        >
          {live ? (
            <>
              <FaBroadcastTower className="text-[10px]" />
              {t("courses.liveCourse", "Live")}
            </>
          ) : (
            <>
              <FaVideo className="text-[10px]" />
              {t("courses.videoCourse", "Video")}
            </>
          )}
        </span>

        {/* Expiry / Status Badge - Top Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {course.is_expired ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md bg-red-500/90 text-white backdrop-blur-md flex items-center gap-1">
              <FaTimesCircle className="text-[10px]" />
              {t("myCourses.expiredBadge", "Expired")}
            </span>
          ) : course.days_remaining !== undefined && course.days_remaining !== null ? (
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md text-white flex items-center gap-1 ${
                course.days_remaining <= 7 ? "bg-amber-500/90" : "bg-black/60"
              }`}
            >
              <FaClock className="text-[10px]" />
              {course.days_remaining === 0
                ? t("myCourses.expiresToday", "Expires today")
                : t("myCourses.expiresIn", "{{days}} days left", { days: course.days_remaining })}
            </span>
          ) : null}
        </div>

        {/* Completion Star Badge if 100% */}
        {progressPct >= 100 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow-md flex items-center gap-1">
            <FaCheckCircle className="text-[10px]" />
            <span>100%</span>
          </div>
        )}
      </div>

      {/* ── 2. Card Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-3.5">
        {/* Title & Category */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
            <span>{course.category || course.specialization || "Dr. KROK Course"}</span>
          </div>
          <h3 className="font-bold text-base text-text line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {course.title || course.name}
          </h3>
        </div>

        {/* Live Course Batch & Telegram Info */}
        {live && batch.name && (
          <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15 flex items-center justify-between gap-2 text-xs">
            <div className="truncate">
              <span className="text-text-secondary font-medium">{t("myCourses.batch", "Batch")}: </span>
              <strong className="text-text font-bold">{batch.name}</strong>
            </div>

            {batch.telegram_link && (
              <a
                href={batch.telegram_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] shadow-sm shrink-0 transition-colors"
                title={t("myCourses.joinTelegram", "Join Telegram Group")}
              >
                <FaPaperPlane className="text-[10px]" />
                <span>Telegram</span>
              </a>
            )}
          </div>
        )}

        {/* ── 3. UPDATE 11: Progress Bar System ── */}
        <div className="p-3 rounded-xl bg-background/60 border border-border/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t("myCourses.progress", "Progress")}
            </span>
            <span className="font-black text-primary text-sm">{progressPct}%</span>
          </div>

          {/* Progress bar track */}
          <div className="w-full h-2 rounded-full bg-border/60 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progressPct >= 100
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-primary to-blue-400"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-text-secondary pt-0.5">
            <span>
              {totalLessons > 0
                ? t("myCourses.lessonsCompleted", "{{completed}} of {{total}} lessons", {
                    completed: completedLessons,
                    total: totalLessons,
                  })
                : t("myCourses.inProgress", "In Progress")}
            </span>
            {progress.last_watched_at ? (
              <span className="truncate max-w-[140px]">
                {t("myCourses.lastWatched", "Last watched")}: {formatDate(progress.last_watched_at)}
              </span>
            ) : (
              <span>{t("myCourses.neverWatched", "Not started yet")}</span>
            )}
          </div>
        </div>

        {/* ── 4. UPDATE 14: Student Rank & UPDATE 15: Points & Test Scores ── */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Rank Box (Update 14) */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between ${
              rank.is_first
                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                : rank.is_top_three
                ? "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300"
                : "bg-background/60 border-border/60 text-text"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                {rank.is_first ? (
                  <FaTrophy className="text-amber-500 text-xs" />
                ) : rank.is_top_three ? (
                  <FaMedal className="text-purple-500 text-xs" />
                ) : (
                  <FaStar className="text-primary text-xs" />
                )}
                {t("myCourses.rankInCourse", "Rank")}
              </span>
              {rank.top_score_percentage !== undefined && (
                <span className="text-[10px] text-text-secondary">
                  Top: {rank.top_score_percentage}%
                </span>
              )}
            </div>

            <div className="text-base font-extrabold flex items-center gap-1.5">
              <span>{rank.rank_label || `${rank.current_rank || 1} / ${rank.total_students || 1}`}</span>
              {rank.is_first && <span title="1st Place">🏆</span>}
            </div>

            <div className="text-[10px] text-text-secondary mt-0.5 font-medium truncate">
              {rank.is_first
                ? t("myCourses.firstPlace", "1st Place Champion")
                : rank.is_top_three
                ? t("myCourses.topThree", "Top 3 Scholar")
                : `${rank.earned_points || 0} pts`}
            </div>
          </div>

          {/* Points Box (Update 15) */}
          <div className="p-3 rounded-xl border border-border/60 bg-background/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                <FaCoins className="text-yellow-500 text-xs" />
                {t("myCourses.coursePoints", "Points")}
              </span>
              {points.score_percentage !== undefined && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {points.score_percentage}%
                </span>
              )}
            </div>

            <div className="text-base font-extrabold text-text">
              {points.points_label || `${points.earned_points || 0} / ${points.total_possible_points || 0}`}
            </div>

            <div className="text-[10px] text-text-secondary mt-0.5 font-medium truncate">
              {testsSummary.solved_tests_count !== undefined
                ? t("myCourses.testsCount", "{{passed}} / {{solved}} tests passed", {
                    passed: testsSummary.passed_tests_count || 0,
                    solved: testsSummary.solved_tests_count || 0,
                  })
                : t("myCourses.testsBreakdown", "Tests Breakdown")}
            </div>
          </div>
        </div>

        {/* Certificate Eligibility Banner (if eligible or near) */}
        {cert.is_eligible ? (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">
                <FaGraduationCap />
              </div>
              <div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block leading-tight">
                  {t("myCourses.certificateEligible", "Certificate Eligible")}
                </span>
                <span className="text-[10px] text-text-secondary">
                  Score: {cert.current_percentage}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/certificate?courseId=${courseId}`);
              }}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors"
            >
              {t("myCourses.certificateDownload", "Get Certificate")}
            </button>
          </div>
        ) : cert.required_percentage ? (
          <div className="px-3 py-1.5 rounded-xl bg-background/40 border border-border/40 flex items-center justify-between text-[11px] text-text-secondary">
            <span className="flex items-center gap-1.5">
              <FaAward className="text-primary text-xs" />
              {t("myCourses.certificateRequirement", "Required {{required}}% (Current {{current}}%)", {
                required: cert.required_percentage,
                current: cert.current_percentage || 0,
              })}
            </span>
          </div>
        ) : null}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── 5. Action Buttons & Test Results Trigger ── */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
          {/* Action triggers (Tests History + Schedule for live) */}
          <div className="flex flex-wrap items-center gap-2">
            {Array.isArray(course.tests) && course.tests.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenTests(course);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-surface border border-border hover:border-primary/50 text-text transition-colors flex items-center gap-1.5"
              >
                <FaFileAlt className="text-primary text-xs" />
                <span>
                  {t("myCourses.viewTestsHistory", "View Tests History ({{count}})", {
                    count: course.tests.length,
                  })}
                </span>
              </button>
            )}

            {/* Live Course Schedule & Timeline Trigger (Update 10) */}
            {live && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSchedule && onOpenSchedule(course);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FaCalendarAlt className="text-rose-500 text-xs" />
                <span>{t("myCourses.courseTimeline", "Schedule & Timeline")}</span>
              </button>
            )}

            {!course.tests?.length && !live && course.expiry_date && (
              <span className="text-[11px] text-text-secondary">
                {t("myCourses.activeUntil", "Active until {{date}}", {
                  date: formatDate(course.expiry_date),
                })}
              </span>
            )}
          </div>

          {/* Continue / Join Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
              live
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                : "bg-primary hover:bg-secondary shadow-primary/20"
            }`}
          >
            <span>{live ? t("liveCourses.joinLive", "Join Live") : t("myCourses.continue", "Continue")}</span>
            <FaChevronRight className="text-[10px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Summary Header Cards Component ──────────────────────────────────────────
const CoursesSummaryHeader = ({ summary }) => {
  const { t } = useTranslation();
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
      {/* 1. Total Enrolled */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
            <FaGraduationCap />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {summary.video_courses_count || 0}V • {summary.live_courses_count || 0}L
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-text">
            {summary.total_enrolled_courses || 0}
          </div>
          <div className="text-xs font-medium text-text-secondary mt-1">
            {t("myCourses.totalEnrolled", "Enrolled Courses")}
          </div>
        </div>
      </div>

      {/* 2. Course Completion */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">
            <FaCheckCircle />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {summary.in_progress_courses_count || 0} {t("myCourses.inProgress", "In Progress")}
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-text">
            {summary.completed_courses_count || 0}
          </div>
          <div className="text-xs font-medium text-text-secondary mt-1">
            {t("myCourses.completed", "Completed Courses")}
          </div>
        </div>
      </div>

      {/* 3. Total Points (Update 15) */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg">
            <FaCoins />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {summary.overall_points_percentage || 0}%
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-text">
            {summary.total_earned_points || 0}{" "}
            <span className="text-xs text-text-secondary font-normal">
              / {summary.total_possible_points || 0}
            </span>
          </div>
          <div className="text-xs font-medium text-text-secondary mt-1">
            {t("myCourses.totalPointsEarned", "Points Earned")}
          </div>
        </div>
      </div>

      {/* 4. Tests Solved & Passed */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg">
            <FaTrophy />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
            {summary.total_tests_solved > 0
              ? `${Math.round(((summary.total_tests_passed || 0) / summary.total_tests_solved) * 100)}%`
              : "0%"}
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-text">
            {summary.total_tests_passed || 0}{" "}
            <span className="text-xs text-text-secondary font-normal">
              / {summary.total_tests_solved || 0}
            </span>
          </div>
          <div className="text-xs font-medium text-text-secondary mt-1">
            {t("myCourses.testsPassed", "Tests Passed")}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main MyCourses Component ────────────────────────────────────────────────
export default function MyCourses({ enrolledCourses: propEnrolledCourses = [] }) {
  const { t } = useTranslation();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-sm">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: t("myCourses.filterAll", "All Courses"), icon: FaGraduationCap },
            { id: "video", label: t("myCourses.filterVideo", "Video Courses"), icon: FaVideo },
            { id: "live", label: t("myCourses.filterLive", "Live Courses"), icon: FaBroadcastTower },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTypeChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? tab.id === "live"
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                      : "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-background text-text-secondary hover:text-text border border-border/80"
                }`}
              >
                <Icon className="text-xs" />
                <span>{tab.label}</span>
                {summary && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      active ? "bg-white/20 text-white" : "bg-border text-text-secondary"
                    }`}
                  >
                    {tab.id === "all"
                      ? summary.total_enrolled_courses || 0
                      : tab.id === "video"
                      ? summary.video_courses_count || 0
                      : summary.live_courses_count || 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status Filter (All / Active / Expired) */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-background p-1 rounded-xl border border-border/80 text-xs">
          {[
            { id: "all", label: t("myCourses.filterAll", "All") },
            { id: "active", label: t("myCourses.filterActive", "Active") },
            { id: "expired", label: t("myCourses.filterExpired", "Expired") },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => handleStatusChange(st.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterStatus === st.id
                  ? "bg-surface text-primary shadow-sm font-bold"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

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
