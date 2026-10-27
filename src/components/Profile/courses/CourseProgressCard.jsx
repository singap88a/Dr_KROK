import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  FaPaperPlane,
  FaCoins,
  FaFileAlt,
  FaAward,
  FaCreditCard,
} from "react-icons/fa";

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

export default function CourseProgressCard({ course, onOpenTests, onOpenSchedule }) {
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

        {/* ── 3. Progress Bar System ── */}
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

        {/* ── Installment Payment Status (if enrolled via installment) ── */}
        {course.payment && (course.payment.is_installment || course.payment.plan === "installment") && (() => {
          const p = course.payment;
          const paidMonths = Number(p.paid_months ?? 0);
          const totalMonths = Number(p.installment_months ?? 0);
          const isFullyPaid = p.remaining_months === 0;
          const instProgress = totalMonths > 0 ? Math.min(100, Math.round((paidMonths / totalMonths) * 100)) : 0;

          return (
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <FaCreditCard className="text-[11px] text-emerald-600 dark:text-emerald-400" />
                  <span>{t("installments.installmentPlan", "Installment Plan")}</span>
                </span>
                {isFullyPaid ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                    <FaCheckCircle className="text-[9px]" />
                    {t("installments.fullyPaid", "Fully Paid")}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                    {t("installments.monthsPaid", "{{paid}} / {{total}} months paid", {
                      paid: paidMonths,
                      total: totalMonths,
                    })}
                  </span>
                )}
              </div>

              {/* Installment Progress Bar */}
              {totalMonths > 0 && (
                <div className="w-full h-1.5 rounded-full bg-border/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${instProgress}%` }}
                  />
                </div>
              )}

              {/* Financial info & next installment date */}
              <div className="flex items-center justify-between text-[11px] text-text-secondary pt-0.5">
                <span>
                  {!isFullyPaid && p.remaining_amount != null
                    ? t("installments.remainingAmount", "Remaining: ₴{{amount}}", {
                        amount: Number(p.remaining_amount).toFixed(2),
                      })
                    : isFullyPaid
                    ? `₴${Number(p.total_price || 0).toFixed(2)}`
                    : ""}
                </span>
                {!isFullyPaid && p.next_installment_date && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <FaCalendarAlt className="text-[9px]" />
                    <span>{p.next_installment_date}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── 4. Student Rank & Points ── */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Rank Box */}
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

          {/* Points Box */}
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

        {/* Certificate Eligibility Banner */}
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
          {/* Action triggers */}
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

            {/* Live Course Schedule & Timeline Trigger */}
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
}
