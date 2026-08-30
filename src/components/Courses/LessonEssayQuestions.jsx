// LessonEssayQuestions.jsx
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { FaCheck, FaTimes, FaPen, FaChevronRight, FaTrophy, FaKey, FaLightbulb } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Checks the student's answer against the keywords.
 * Returns { isCorrect, matchedCount, requiredCount }.
 */
function evaluateAnswer(answer, keywords, requiredCount) {
  const lowerAnswer = (answer || "").toLowerCase();
  const matched = keywords.filter((kw) =>
    lowerAnswer.includes(kw.toLowerCase())
  );
  const matchedCount = matched.length;
  const isCorrect = matchedCount >= requiredCount;
  return { isCorrect, matchedCount, requiredCount, matched };
}

// ─── Summary Screen ──────────────────────────────────────────────────────────
function EssaySummary({ questions, answers, t }) {
  const totalScore = answers.reduce((sum, a) => sum + (a.scoreAchieved || 0), 0);
  const maxScore = questions.reduce((sum, q) => sum + parseFloat(q.score || 0), 0);
  const correctCount = answers.filter((a) => a.isCorrect).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <FaTrophy className="text-white text-sm" />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">{t("essay.totalScore", "Total Score")}</p>
            <p className="text-xl font-black text-primary">{totalScore.toFixed(1)} / {maxScore.toFixed(1)}</p>
          </div>
        </div>
        <div className="flex gap-3 flex-1">
          <div className="flex-1 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 text-center">
            <p className="text-2xl font-black text-green-600 dark:text-green-400">{correctCount}</p>
            <p className="text-xs text-green-700 dark:text-green-300 font-medium mt-1">{t("essay.correct", "Correct")}</p>
          </div>
          <div className="flex-1 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-center">
            <p className="text-2xl font-black text-red-600 dark:text-red-400">{questions.length - correctCount}</p>
            <p className="text-xs text-red-700 dark:text-red-300 font-medium mt-1">{t("essay.incorrect", "Incorrect")}</p>
          </div>
        </div>
      </motion.div>

      {/* Per-Question Breakdown */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const ans = answers[idx];
          if (!ans) return null;
          const correct = ans.isCorrect;

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`rounded-2xl border overflow-hidden ${
                correct
                  ? "border-green-200 dark:border-green-800/40"
                  : "border-red-200 dark:border-red-800/40"
              }`}
            >
              {/* Question header */}
              <div
                className={`px-4 py-3 flex items-center gap-3 ${
                  correct
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    correct ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {correct ? (
                    <FaCheck className="text-white text-xs" />
                  ) : (
                    <FaTimes className="text-white text-xs" />
                  )}
                </div>
                <p className="text-sm font-bold text-text flex-1">{q.question}</p>
                <span
                  className={`text-xs font-black px-2 py-1 rounded-full ${
                    correct
                      ? "bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300"
                  }`}
                >
                  {ans.scoreAchieved.toFixed(1)} / {parseFloat(q.score).toFixed(1)}
                </span>
              </div>

              <div className="px-4 py-3 space-y-3 bg-surface dark:bg-surface">
                {/* Student answer */}
                <div>
                  <p className="text-xs text-text-muted font-semibold mb-1 flex items-center gap-1">
                    <FaPen className="text-[10px]" />
                    {t("essay.yourAnswer", "Your Answer")}
                  </p>
                  <p className="text-sm text-text leading-relaxed bg-accent/30 rounded-xl px-3 py-2">
                    {ans.studentAnswer || <em className="text-text-muted">{t("essay.noAnswer", "No answer provided")}</em>}
                  </p>
                </div>

                {/* Model answer */}
                <div>
                  <p className="text-xs text-text-muted font-semibold mb-1 flex items-center gap-1">
                    <FaLightbulb className="text-[10px] text-yellow-500" />
                    {t("essay.modelAnswer", "Model Answer")}
                  </p>
                  <p className="text-sm text-text leading-relaxed bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl px-3 py-2">
                    {q.answer}
                  </p>
                </div>

                {/* Keywords */}
                {q.keywords && q.keywords.length > 0 && (
                  <div>
                    <p className="text-xs text-text-muted font-semibold mb-1.5 flex items-center gap-1">
                      <FaKey className="text-[10px]" />
                      {t("essay.keywords", "Keywords")} ({ans.matchedCount}/{q.required_keywords_count} {t("essay.matched", "matched")})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {q.keywords.map((kw, ki) => {
                        const wasMatched = ans.matched?.includes(kw.toLowerCase())
                          || (ans.studentAnswer || "").toLowerCase().includes(kw.toLowerCase());
                        return (
                          <span
                            key={ki}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                              wasMatched
                                ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300"
                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {wasMatched ? "✓" : "✗"} {kw}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LessonEssayQuestions({ questions, isLiveCourse = false }) {
  const { t } = useTranslation();
  const { submitEssayAnswer } = useApi();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [answers, setAnswers] = useState([]); // { isCorrect, scoreAchieved, studentAnswer, matched, matchedCount }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const textareaRef = useRef(null);

  const current = questions[currentIndex];

  const handleSubmit = async () => {
    if (!studentAnswer.trim()) return;
    setIsSubmitting(true);

    const { isCorrect, matchedCount, matched } = evaluateAnswer(
      studentAnswer,
      current.keywords || [],
      current.required_keywords_count || 1
    );
    const scoreAchieved = isCorrect ? parseFloat(current.score || 0) : 0;

    const newAnswer = {
      isCorrect,
      scoreAchieved,
      studentAnswer,
      matched,
      matchedCount,
    };

    // Submit to backend (fire and forget, don't block UX)
    try {
      await submitEssayAnswer({
        essayQuestionId: current.id,
        studentAnswer,
        isCorrect,
        scoreAchieved,
      });
    } catch (err) {
      console.warn("Essay submit error (non-blocking):", err);
    }

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setIsSubmitting(false);

    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setStudentAnswer("");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setStudentAnswer("");
    setAnswers([]);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text">
            {t("essay.summaryTitle", "Essay Summary")}
          </h3>
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors"
          >
            {t("essay.retake", "Retake")}
          </button>
        </div>
        <EssaySummary questions={questions} answers={answers} t={t} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="font-semibold">
          {t("essay.question", "Question")} {currentIndex + 1} / {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < currentIndex
                  ? "w-6 bg-primary"
                  : i === currentIndex
                  ? "w-8 bg-primary"
                  : "w-4 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Question */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-primary/30">
                <span className="text-white text-sm font-black">{currentIndex + 1}</span>
              </div>
              <p className="text-base font-bold text-text leading-relaxed">{current.question}</p>
            </div>
          </div>

          {/* Score badge */}
          <div className="flex items-center justify-end">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent/60 text-text-muted border border-border/40">
              {t("essay.worth", "Worth")} {parseFloat(current.score || 0).toFixed(1)} {t("essay.pts", "pts")}
            </span>
          </div>

          {/* Answer textarea */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
              <FaPen className="text-[10px]" />
              {t("essay.writeAnswer", "Write your answer below")}
            </label>
            <textarea
              ref={textareaRef}
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              rows={5}
              autoFocus
              placeholder={t("essay.placeholder", "Type your detailed answer here...")}
              className="w-full px-4 py-3 text-sm text-text bg-surface border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 placeholder:text-text-muted/50"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>{studentAnswer.trim().split(/\s+/).filter(Boolean).length} {t("essay.words", "words")}</span>
              <span>{studentAnswer.length} {t("essay.chars", "characters")}</span>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!studentAnswer.trim() || isSubmitting}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
              !studentAnswer.trim() || isSubmitting
                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:bg-secondary shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]"
            }`}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {currentIndex + 1 < questions.length
                  ? t("essay.submitNext", "Submit & Next")
                  : t("essay.submitFinish", "Submit & Finish")}
                <FaChevronRight className="text-xs" />
              </>
            )}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
