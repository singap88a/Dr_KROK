import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaGamepad,
  FaRegCopy,
  FaEdit,
  FaArrowLeft,
  FaArrowRight,
  FaLock,
  FaUnlock,
  FaPlay,
  FaClock,
  FaClipboardList,
  FaHashtag,
} from "react-icons/fa";
import LessonFlashCards from "../LessonFlashCards";
import LessonEssayQuestions from "../LessonEssayQuestions";
import RecreationalQuizRunner from "./RecreationalQuizRunner";

function SectionHeading({ title, count, badgeClass, textClass }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${badgeClass}`}
      >
        <FaHashtag />
      </span>
      <h5 className={`text-base sm:text-lg font-extrabold tracking-tight ${textClass || "text-text"}`}>
        {title}
      </h5>
      {count !== undefined && count !== null && (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-black ${badgeClass}`}
        >
          {count}
        </span>
      )}
    </div>
  );
}

export default function LessonHomeworkSection({
  currentLesson,
  course,
  id,
  isLiveCourse = false,
  hasAccess = false,
  lessonStatuses = {},
  setShowPurchaseModal,
  essayQuestions = [],
  essayLoading = false,
  recreationalQuizzes = [],
  recreationalForbidden = false,
  recreationalForbiddenMessage = null,
  recreationalLoading = false,
  flashcardsCount = 0,
  flashcardsLoading = false,
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.dir() === "rtl";

  // activeMode: "hub" | "recreational" | "flashcards" | "essay"
  const [activeMode, setActiveMode] = useState("hub");
  const [selectedRecQuiz, setSelectedRecQuiz] = useState(null);
  const [filterType, setFilterType] = useState("all");

  // Reset sub-view when switching lessons
  useEffect(() => {
    setActiveMode("hub");
    setSelectedRecQuiz(null);
    setFilterType("all");
  }, [currentLesson?.id]);

  // Separate Lesson-End Tests vs Periodic Quizzes
  const endTestType = isLiveCourse
    ? "Lesson-End Test (Live Session)"
    : "Lesson-End Test (Video Session)";

  const lessonEndTests = useMemo(() => {
    if (!currentLesson?.lesson_end_tests) return [];
    return currentLesson.lesson_end_tests.filter(
      (test) => test.test_type === endTestType
    );
  }, [currentLesson, endTestType]);

  const hasPeriodicQuizzes = useMemo(() => {
    const inEndTests = (currentLesson?.lesson_end_tests || []).some(
      (test) => test.test_type && test.test_type.includes("Periodic Quiz")
    );
    const inSeparate =
      Array.isArray(currentLesson?.periodic_quizzes) &&
      currentLesson.periodic_quizzes.length > 0;
    return inEndTests || inSeparate;
  }, [currentLesson]);

  const lessonProgress = lessonStatuses?.[currentLesson?.id] || {};
  const progressPercentage =
    lessonProgress.percentage || lessonProgress.lesson_percentage || 0;
  const canTakeLessonTest = progressPercentage >= 50;
  const basePath = isLiveCourse ? `/live-courses/${id}` : `/courses/${id}`;

  const essayTotalScore = useMemo(() => {
    const sum = essayQuestions.reduce(
      (acc, q) => acc + parseFloat(q.score || 0),
      0
    );
    return Number.isInteger(sum) ? sum : Number(sum.toFixed(1));
  }, [essayQuestions]);

  const hasRecreational = recreationalQuizzes.length > 0 || recreationalForbidden;
  const hasLessonTests = lessonEndTests.length > 0 || hasPeriodicQuizzes;
  const hasFlashcards = flashcardsCount > 0;
  const hasEssay = essayQuestions.length > 0;

  const isAnyLoading =
    recreationalLoading || essayLoading || flashcardsLoading;

  const totalTasks =
    recreationalQuizzes.length +
    lessonEndTests.length +
    (hasFlashcards ? 1 : 0) +
    (hasEssay ? 1 : 0);

  // ── Sub-view: Recreational Quiz Runner ────────────────────────────────────
  if (activeMode === "recreational" && selectedRecQuiz) {
    return (
      <RecreationalQuizRunner
        quizSummary={selectedRecQuiz}
        isLiveCourse={isLiveCourse}
        onBack={() => {
          setActiveMode("hub");
          setSelectedRecQuiz(null);
        }}
        onSubscribeClick={
          setShowPurchaseModal ? () => setShowPurchaseModal(true) : undefined
        }
      />
    );
  }

  // ── Sub-view: Flashcards Practice ─────────────────────────────────────────
  if (activeMode === "flashcards" && currentLesson) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
          <button
            type="button"
            onClick={() => setActiveMode("hub")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {isRtl ? <FaArrowRight /> : <FaArrowLeft />}
            <span>{t("homework.backToHomework", "Back to Homework")}</span>
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <FaRegCopy />
            {t("flashcards.title", "Lesson Flash Cards")}
          </span>
        </div>
        <LessonFlashCards
          lessonId={currentLesson.id}
          isLiveCourse={isLiveCourse}
          hasAccess={hasAccess}
        />
      </div>
    );
  }

  // ── Sub-view: Essay Questions ─────────────────────────────────────────────
  if (activeMode === "essay" && currentLesson) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
          <button
            type="button"
            onClick={() => setActiveMode("hub")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-600 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {isRtl ? <FaArrowRight /> : <FaArrowLeft />}
            <span>{t("homework.backToHomework", "Back to Homework")}</span>
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            <FaEdit />
            {t("homework.essayTitle", "Essay Assessment")}
          </span>
        </div>
        <LessonEssayQuestions
          key={currentLesson.id}
          questions={essayQuestions}
          isLiveCourse={isLiveCourse}
        />
      </div>
    );
  }

  // ── Filter Options (only shown when > 1 category exists) ──────────────────
  const categoriesAvailable = [
    hasRecreational && {
      id: "recreational",
      label: t("homework.filters.recreational", "Recreational"),
      count: recreationalQuizzes.length,
      activeClass:
        "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/40",
    },
    hasLessonTests && {
      id: "quizzes",
      label: t("homework.filters.quizzes", "Quizzes"),
      count: lessonEndTests.length,
      activeClass:
        "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40",
    },
    hasFlashcards && {
      id: "flashcards",
      label: t("homework.filters.flashcards", "Flashcards"),
      count: 1,
      activeClass:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    },
    hasEssay && {
      id: "essay",
      label: t("homework.filters.essay", "Essay"),
      count: 1,
      activeClass:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
    },
  ].filter(Boolean);

  const filterOptions =
    categoriesAvailable.length > 1
      ? [
          {
            id: "all",
            label: t("homework.filters.all", "All"),
            count: totalTasks,
            activeClass: "bg-primary/15 text-primary border-primary/40",
          },
          ...categoriesAvailable,
        ]
      : [];

  const showRec =
    hasRecreational && (filterType === "all" || filterType === "recreational");
  const showTests =
    hasLessonTests && (filterType === "all" || filterType === "quizzes");
  const showFlash =
    hasFlashcards && (filterType === "all" || filterType === "flashcards");
  const showEssay =
    hasEssay && (filterType === "all" || filterType === "essay");

  const hasAnyItem =
    hasRecreational || hasLessonTests || hasFlashcards || hasEssay;

  return (
    <div className="space-y-6">
      {/* Compact Translucent Filter Bar */}
      {filterOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map((opt) => {
            const active = filterType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilterType(opt.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  active
                    ? opt.activeClass
                    : "bg-surface/60 text-text-secondary border-border hover:text-text hover:border-border/80"
                }`}
              >
                <span># {opt.label}</span>
                {opt.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none bg-background/80 text-current">
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading Skeleton */}
      {isAnyLoading && !hasAnyItem && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-24 rounded-2xl bg-accent/30 border border-border animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isAnyLoading && !hasAnyItem && (
        <div className="p-6 rounded-2xl border border-dashed border-border bg-surface/50 text-center space-y-1.5">
          <FaClipboardList className="text-2xl text-text-muted mx-auto opacity-60" />
          <h5 className="text-sm font-bold text-text">
            {t("homework.emptyTitle", "No Homework Available Yet")}
          </h5>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {t(
              "homework.emptyDesc",
              "This lesson does not have quizzes, flashcards, essay questions, or recreational games assigned yet."
            )}
          </p>
        </div>
      )}

      {/* ── 1. Recreational Quizzes Section (Translucent Violet) ───────────── */}
      {showRec && (
        <section>
          <SectionHeading
            title={t("homework.recreational.sectionTitle", "Recreational Quizzes")}
            count={recreationalQuizzes.length || null}
            badgeClass="bg-violet-500/15 text-violet-700 dark:text-violet-300"
          />

          {recreationalForbidden ? (
            <div className="p-4 rounded-2xl border border-violet-500/25 bg-violet-500/[0.05] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <FaLock />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text">
                    {t(
                      "homework.recreational.subscriptionRequiredTitle",
                      "Subscription Required"
                    )}
                  </p>
                  <p className="text-xs text-text-muted">
                    {recreationalForbiddenMessage ||
                      t(
                        "homework.recreational.subscriptionRequiredDesc",
                        "You need to subscribe to this course first to access recreational quizzes."
                      )}
                  </p>
                </div>
              </div>
              {setShowPurchaseModal && (
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(true)}
                  className="px-4 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-600 text-violet-700 dark:text-violet-300 hover:text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
                >
                  {t("courses.subscribeNow", "Subscribe Now")}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {recreationalQuizzes.map((quiz, idx) => {
                const qCount =
                  quiz.questions_count ??
                  quiz.total_questions ??
                  (Array.isArray(quiz.questions) ? quiz.questions.length : null);
                const qScore =
                  quiz.total_score ??
                  quiz.score ??
                  quiz.max_score ??
                  (Array.isArray(quiz.questions) && quiz.questions.length > 0
                    ? quiz.questions.reduce(
                        (s, q) => s + Number(q.score || 1),
                        0
                      )
                    : null);

                return (
                  <div
                    key={`rec-${quiz.id || idx}`}
                    onClick={() => {
                      setSelectedRecQuiz(quiz);
                      setActiveMode("recreational");
                    }}
                    className="group p-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] hover:bg-violet-500/[0.09] hover:border-violet-500/40 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                        <FaGamepad />
                      </div>
                      <div className="min-w-0">
                        <h6 className="text-sm font-bold text-text truncate">
                          {quiz.title ||
                            quiz.name ||
                            `${t("homework.recreational.title", "Recreational Quiz")} ${idx + 1}`}
                        </h6>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-semibold text-text-muted">
                          <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold">
                            # {t("homework.filters.recreational", "Recreational")}
                          </span>
                          {qCount !== null && (
                            <span>
                              {qCount}{" "}
                              {t("homework.questionsCountLabel", "Questions")}
                            </span>
                          )}
                          {qScore !== null && (
                            <span>
                              • {qScore} {t("essay.pts", "pts")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 text-violet-700 dark:text-violet-300 group-hover:bg-violet-600 group-hover:text-white text-xs font-bold shrink-0 transition-colors">
                      <FaPlay className="text-[10px]" />
                      <span>{t("common.continue", "Start")}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── 2. Lesson Quizzes Section (Translucent Sky Blue + Progress Bar) ── */}
      {showTests && (
        <section className="space-y-3">
          <SectionHeading
            title={t("courses.lessonEndTests", "Lesson End Assessment")}
            count={lessonEndTests.length || null}
            badgeClass="bg-sky-500/15 text-sky-700 dark:text-sky-300"
          />

          {lessonEndTests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {lessonEndTests.map((test, idx) => {
                const questionsCount =
                  test.number_student_questions > 0
                    ? test.number_student_questions
                    : test.questions_count ??
                      test.total_questions ??
                      (Array.isArray(test.quizzes) ? test.quizzes.length : null);
                const totalScore =
                  test.total_score ??
                  test.score ??
                  test.max_score ??
                  (Array.isArray(test.quizzes) &&
                  test.quizzes.length > 0 &&
                  !(test.number_student_questions > 0)
                    ? test.quizzes.reduce(
                        (sum, q) => sum + Number(q.question_score || 1),
                        0
                      )
                    : null);

                return (
                  <div
                    key={`test-${test.id || idx}`}
                    onClick={() => {
                      if (canTakeLessonTest) {
                        navigate(`${basePath}/test/lesson/${test.id}`, {
                          state: {
                            course,
                            test,
                            lessonId: currentLesson.id,
                          },
                        });
                      }
                    }}
                    className={`group p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      canTakeLessonTest
                        ? "border-sky-500/20 bg-sky-500/[0.05] hover:bg-sky-500/[0.09] hover:border-sky-500/40 cursor-pointer"
                        : "border-sky-500/15 bg-sky-500/[0.03] opacity-90 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            canTakeLessonTest
                              ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                              : "bg-accent text-text-muted"
                          }`}
                        >
                          {canTakeLessonTest ? <FaUnlock /> : <FaLock />}
                        </div>
                        <div className="min-w-0">
                          <h6 className="text-sm font-bold text-text truncate">
                            {test.name ||
                              `${t("courses.lessonEndTest", "Lesson End Test")} ${idx + 1}`}
                          </h6>
                          {test.description && (
                            <p className="mt-0.5 text-xs text-text-muted line-clamp-1">
                              {test.description.replace(/<[^>]*>/g, "")}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-text-muted">
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold">
                              # {t("homework.filters.quizzes", "Quizzes")}
                            </span>
                            {questionsCount !== null && (
                              <span>
                                {questionsCount}{" "}
                                {t("homework.questionsCountLabel", "Questions")}
                              </span>
                            )}
                            {totalScore !== null && (
                              <span>
                                • {totalScore} {t("essay.pts", "pts")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                          canTakeLessonTest
                            ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 group-hover:bg-sky-600 group-hover:text-white transition-colors"
                            : "bg-accent text-text-muted"
                        }`}
                      >
                        {canTakeLessonTest
                          ? t("courses.available", "Available")
                          : t("courses.locked", "Locked")}
                      </span>
                    </div>

                    {/* Lesson Progress Bar */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-text-muted font-medium">
                          {t("courses.lessonProgress", "Lesson Progress")}
                        </span>
                        <span className="text-[11px] font-bold text-text">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-accent/70 overflow-hidden">
                        <div
                          className={`h-2 transition-all duration-500 rounded-full ${
                            canTakeLessonTest ? "bg-sky-500" : "bg-sky-500/50"
                          }`}
                          style={{
                            width: `${Math.min(progressPercentage, 100)}%`,
                          }}
                        />
                      </div>
                      {!canTakeLessonTest && (
                        <p className="flex items-center gap-1 mt-1.5 text-[11px] text-red-500 font-medium">
                          <FaLock className="text-[10px]" />
                          {t(
                            "courses.watchVideoToUnlockTest",
                            "Watch 50% of the lesson to unlock"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Periodic Quizzes Translucent Bar */}
          {hasPeriodicQuizzes && (
            <div className="px-4 py-3 rounded-2xl bg-sky-500/[0.05] border border-sky-500/20 text-xs text-text-secondary flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <FaClock />
              </div>
              <span>
                <strong className="text-text">
                  {t("courses.periodicQuizzes", "Periodic Quizzes")}:
                </strong>{" "}
                {t(
                  "courses.quizzesWillAppear",
                  "Quizzes will appear automatically during the video"
                )}
              </span>
            </div>
          )}
        </section>
      )}

      {/* ── 3 & 4. Flashcards (Emerald) & Essay (Amber) Side-by-Side ──────── */}
      {(showFlash || showEssay) && (
        <div
          className={`grid grid-cols-1 ${
            showFlash && showEssay ? "md:grid-cols-2" : ""
          } gap-4`}
        >
          {/* 3. Flashcards Section (Translucent Emerald) */}
          {showFlash && (
            <section>
              <SectionHeading
                title={t("flashcards.title", "Lesson Flash Cards")}
                badgeClass="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              />
              <div
                onClick={() => setActiveMode("flashcards")}
                className="group p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] hover:bg-emerald-500/[0.09] hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FaRegCopy />
                  </div>
                  <div className="min-w-0">
                    <h6 className="text-sm font-bold text-text truncate">
                      {t("flashcards.title", "Lesson Flash Cards")}
                    </h6>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-semibold text-text-muted">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                        # {t("homework.filters.flashcards", "Flashcards")}
                      </span>
                      <span>
                        {flashcardsCount} {t("homework.cardsLabel", "Cards")}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white text-xs font-bold shrink-0 transition-colors">
                  <FaPlay className="text-[10px]" />
                  <span>{t("common.continue", "Start")}</span>
                </span>
              </div>
            </section>
          )}

          {/* 4. Essay Section (Translucent Amber) */}
          {showEssay && (
            <section>
              <SectionHeading
                title={t("homework.essayTitle", "Essay Assessment")}
                badgeClass="bg-amber-500/15 text-amber-700 dark:text-amber-300"
              />
              <div
                onClick={() => setActiveMode("essay")}
                className="group p-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] hover:bg-amber-500/[0.09] hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <FaEdit />
                  </div>
                  <div className="min-w-0">
                    <h6 className="text-sm font-bold text-text truncate">
                      {t("homework.essayTitle", "Essay Assessment")}
                    </h6>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-semibold text-text-muted">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
                        # {t("homework.filters.essay", "Essay")}
                      </span>
                      <span>
                        {essayQuestions.length}{" "}
                        {t("homework.questionsCountLabel", "Questions")}
                      </span>
                      {essayTotalScore > 0 && (
                        <span>
                          • {essayTotalScore} {t("essay.pts", "pts")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 group-hover:bg-amber-600 group-hover:text-white text-xs font-bold shrink-0 transition-colors">
                  <FaPlay className="text-[10px]" />
                  <span>{t("common.continue", "Start")}</span>
                </span>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
