import React, { useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaChartBar, FaClipboardList, FaSync, FaTimes } from "react-icons/fa";
import { useApi } from "../../../context/ApiContext";

const translateReviewQuestion = (q) => {
  const isMcq = q.type === "mcq" || !q.type;
  
  const translated = {
    id: q.question_id,
    title: q.question_title,
    image: q.question_image,
    question_score: q.question_score,
    type: q.type || 'mcq',
    correct_answer_index: q.correct_answer_index,
    is_correct: q.is_correct !== undefined ? q.is_correct : (q.isCorrect || false),
    correct_answer: q.correct_answer,
  };
  
  if (isMcq) {
    if (q.student_answer_index !== null && q.student_answer_index !== undefined && q.student_answer_index !== "") {
      translated.student_answer = `answer_${parseInt(q.student_answer_index) + 1}`;
    } else {
      translated.student_answer = q.student_answer || "";
    }
    
    if (Array.isArray(q.answers)) {
      q.answers.forEach((ans) => {
        const num = ans.index + 1;
        translated[`answer_${num}`] = ans.text;
        translated[`answer_${num}_image`] = ans.image;
      });
    }
  } else {
    translated.student_answer = q.student_answer || "";
  }
  
  return translated;
};

export default function PreviousTestResult({ test, previousTestResult, navigate, t, location, id, scope, onRetake }) {
  const { getStudentTestReview } = useApi();
  const [showReview, setShowReview] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const result = previousTestResult.test_result;
  const percentage = result.total_score > 0 ? (parseFloat(result.score) / parseFloat(result.total_score)) * 100 : 0;
  const passed = result.passed === 1;

  const handleToggleReview = async () => {
    if (showReview) {
      setShowReview(false);
      return;
    }

    if (reviewQuestions.length > 0) {
      setShowReview(true);
      return;
    }

    try {
      setLoadingReview(true);
      setReviewError("");
      const response = await getStudentTestReview(test.id, result.id);
      
      let rawQuestions = null;
      if (response && (response.success || response.code === 200)) {
        if (Array.isArray(response.data)) {
          rawQuestions = response.data;
        } else if (response.data && Array.isArray(response.data.questions)) {
          rawQuestions = response.data.questions;
        }
      }

      if (rawQuestions) {
        const translated = rawQuestions.map(translateReviewQuestion);
        setReviewQuestions(translated);
        setShowReview(true);
      } else {
        setReviewError(response?.message || t("courses.failedToLoadReview", "Failed to load review questions"));
      }
    } catch (error) {
      console.error("Error fetching test review:", error);
      setReviewError(error?.message || t("courses.failedToLoadReview", "Failed to load review questions"));
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <section className="min-h-screen px-4 py-8 bg-background text-text">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-primary hover:text-secondary"
          >
            <FaArrowLeft /> {t("common.back", "Back")}
          </button>
        </div>

        <div className="overflow-hidden border shadow rounded-2xl bg-surface border-border">
          <div className="p-6 text-white bg-primary">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <h1 className="text-2xl font-bold">
                {test?.name || t("courses.test", "Test")}
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-white/20">
                <FaExclamationTriangle className="text-yellow-300" />
                <span>{t("courses.previouslyTaken", "Previously Taken")}</span>
              </div>
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${passed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {passed ? <FaCheckCircle size={48} /> : <FaExclamationTriangle size={48} />}
              </div>
            </div>

            <h2 className="mb-3 text-2xl font-bold text-text">
              {passed
                ? t("courses.testPassedBefore", "You have passed this test before")
                : t("courses.testTakenBefore", "You have taken this test before")}
            </h2>

            <p className="mb-6 text-text-muted text-sm">
              {previousTestResult.message || t("courses.cannotRetakeTest", "You cannot retake this test.")}
            </p>

            {/* Results Card */}
            <div className="max-w-3xl mx-auto mb-6 overflow-hidden border rounded-xl shadow-sm bg-gradient-to-br from-surface to-accent border-border">
              <div className="p-6">
                <div className="flex items-center justify-center mb-6">
                  <FaChartBar className="mr-2 text-primary" />
                  <h3 className="text-lg font-semibold text-text">
                    {t("courses.yourPreviousScore", "Your Previous Score")}
                  </h3>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                  {/* Left Column: Percentage Circle */}
                  <div className="flex flex-col items-center">
                    <div className="relative inline-flex items-center justify-center mb-2">
                      <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none" stroke="#E5E7EB" strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={passed ? "#10B981" : "#F59E0B"}
                            strokeWidth="3"
                            strokeDasharray={`${percentage}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-yellow-600'}`}>
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Score Details Grid */}
                  <div className="flex-1 w-full text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-lg dark:bg-gray-800 border border-border/50">
                        <div className="text-xs text-text-muted">{t("courses.yourScore", "Your Score")}</div>
                        <div className="text-base font-bold text-text">{result.score}</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg dark:bg-gray-800 border border-border/50">
                        <div className="text-xs text-text-muted">{t("courses.totalScore", "Total Score")}</div>
                        <div className="text-base font-bold text-text">{result.total_score}</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg dark:bg-gray-800 border border-border/50">
                        <div className="text-xs text-text-muted">{t("courses.totalQuestions", "Total Questions")}</div>
                        <div className="text-base font-bold text-text">{result.total_questions}</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg dark:bg-gray-800 border border-border/50">
                        <div className="text-xs text-text-muted">{t("courses.status", "Status")}</div>
                        <div className={`text-base font-bold ${passed ? 'text-green-600' : 'text-yellow-600'}`}>
                          {passed ? t("courses.passed", "Passed") : t("courses.failed", "Failed")}
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg dark:bg-gray-800 border border-border/50">
                        <div className="text-xs text-text-muted">{t("courses.attemptsCount", "Attempts Count")}</div>
                        <div className="text-base font-bold text-text">{previousTestResult.attempts_count}</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg dark:bg-gray-800 border border-border/50">
                        <div className="text-xs text-text-muted">{t("courses.testDate", "Test Date")}</div>
                        <div className="text-sm font-bold text-text truncate">
                          {new Date(result.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center items-center">
              {onRetake && scope !== "final" && (
                <button
                  onClick={onRetake}
                  className="px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-secondary font-bold shadow-md hover:shadow-lg"
                >
                  {t("courses.retakeTest", "Retake Test")}
                </button>
              )}
              <button
                onClick={handleToggleReview}
                disabled={loadingReview}
                className="px-6 py-3 font-semibold text-white bg-secondary hover:bg-secondary/90 transition-all rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loadingReview ? (
                  <FaSync className="animate-spin" />
                ) : (
                  <FaClipboardList />
                )}
                {showReview ? t("courses.hideReview", "Hide Review") : t("courses.reviewQuestions", "Review Questions")}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 transition-colors border rounded-lg border-primary text-primary hover:bg-primary hover:text-white"
              >
                {t("common.goBack", "Go Back")}
              </button>
              <button
                onClick={() => {
                  const basePath = location.pathname.includes('live-courses') ? '/live-courses' : '/courses';
                  navigate(`${basePath}/${id}/lessons`);
                }}
                className="px-6 py-3 transition-colors border rounded-lg border-primary text-primary hover:bg-primary hover:text-white"
              >
                {t("courses.returnToLessons", "Return to Lessons")}
              </button>
            </div>

            {reviewError && (
              <div className="mt-6 text-sm text-red-600 font-semibold bg-red-50 dark:bg-red-950/20 p-4 rounded-lg flex items-center gap-2">
                <FaExclamationTriangle />
                {reviewError}
              </div>
            )}

            {showReview && reviewQuestions.length > 0 && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden text-left animate-slideUp">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border bg-accent">
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                      <FaClipboardList />
                      {t("courses.detailedReview", "Detailed Question Review")}
                    </h3>
                    <button
                      onClick={() => setShowReview(false)}
                      className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all duration-200"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {reviewQuestions.map((q, qIdx) => {
                      const isMcq = q.type === "mcq" || !q.type;
                      
                      if (isMcq) {
                        const answerKeys = [];
                        let i = 1;
                        while (q[`answer_${i}`] || q[`answer_${i}_image`]) {
                          answerKeys.push(`answer_${i}`);
                          i++;
                        }
                        
                        const studentAnswerKey = q.student_answer || q.studentAnswer || "";
                        const correctAnswerKey = q.correct_answer_index !== undefined 
                          ? `answer_${parseInt(q.correct_answer_index) + 1}`
                          : `answer_${parseInt(q.correct_answer) + 1}`;

                        return (
                          <div key={q.id || qIdx} className="p-5 border rounded-xl bg-accent border-border shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                              <span className="font-bold text-lg text-primary">{qIdx + 1}.</span>
                              <div
                                className="font-semibold text-text"
                                dangerouslySetInnerHTML={{ __html: q.title || "" }}
                              />
                            </div>
                            
                            <div className="space-y-3">
                              {answerKeys.map((key) => {
                                const text = q[key];
                                const img = q[`${key}_image`];
                                if (!text && !img) return null;

                                const isStudentSelected = studentAnswerKey === key;
                                const isCorrectChoice = correctAnswerKey === key;

                                let optionStyle = "border-border bg-surface";
                                let badge = null;

                                if (isCorrectChoice) {
                                  optionStyle = "border-green-500 bg-green-50 dark:bg-green-950/20";
                                  badge = <span className="ml-auto text-green-600 font-semibold text-sm flex items-center gap-1"><FaCheckCircle /> {t("courses.correct", "Correct")}</span>;
                                } else if (isStudentSelected) {
                                  optionStyle = "border-red-500 bg-red-50 dark:bg-red-950/20";
                                  badge = <span className="ml-auto text-red-600 font-semibold text-sm flex items-center gap-1"><FaExclamationTriangle /> {t("courses.yourAnswer", "Your Answer")}</span>;
                                }

                                return (
                                  <div
                                    key={key}
                                    className={`p-4 border-2 rounded-lg transition-all flex items-center gap-3 ${optionStyle}`}
                                  >
                                    <div className="flex-1">
                                      {text && <div className="text-text">{text}</div>}
                                      {img && (
                                        <img
                                          src={img}
                                          alt="Option"
                                          className="mt-2 rounded max-h-32 shadow-sm"
                                        />
                                      )}
                                    </div>
                                    {badge}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      } else {
                        const isCorrect = q.is_correct || q.isCorrect;
                        const studentAnswerText = q.student_answer || q.studentAnswer || t("courses.noAnswer", "No Answer");
                        const correctAnswerText = q.correct_answer || q.correctAnswer || "";

                        return (
                          <div key={q.id || qIdx} className="p-5 border rounded-xl bg-accent border-border shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                              <span className="font-bold text-lg text-primary">{qIdx + 1}.</span>
                              <div
                                className="font-semibold text-text"
                                dangerouslySetInnerHTML={{ __html: q.title || "" }}
                              />
                            </div>
                            <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-text-muted">{t("courses.yourAnswer", "Your Answer")}:</span>
                                <span className={isCorrect ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                  {studentAnswerText}
                                </span>
                              </div>
                              {!isCorrect && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-text-muted">{t("courses.correctAnswer", "Correct Answer")}:</span>
                                  <span className="text-green-600 font-bold">{correctAnswerText}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-border bg-accent flex justify-end">
                    <button
                      onClick={() => setShowReview(false)}
                      className="px-6 py-2.5 font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all"
                    >
                      {t("common.close", "Close")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
