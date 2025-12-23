// QuizSystem/QuizModal.jsx
import React, { useState } from "react";
import { FaTimes, FaChartLine, FaCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export const QuizModal = ({ quizModal, setQuizModal, setAnsweredQuizzes, setQuizResults }) => {
  const { t } = useTranslation();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!quizModal.isOpen || !quizModal.currentQuiz) return null;

  const { currentQuiz, currentQuestionIndex } = quizModal;
  const correctAnswerIndex = currentQuiz.correct_answer_index;
  const isCorrect = showFeedback && selectedAnswer === correctAnswerIndex;

  const handleAnswerSelect = (answerIndex) => {
    if (!showFeedback) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleAnswerConfirm = () => {
    if (selectedAnswer === null) return;

    const { currentQuiz, userAnswers, currentQuestionIndex } = quizModal;
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = selectedAnswer;

    const isCorrect = selectedAnswer === currentQuiz.correct_answer_index;

    setQuizResults((prev) => ({
      ...prev,
      [currentQuiz.id]: {
        question: currentQuiz.title,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuiz.correct_answer_index,
        isCorrect: isCorrect,
        score: isCorrect ? parseInt(currentQuiz.question_score) : 0,
        showAtTime: currentQuiz.show_at_time,
      },
    }));

    setAnsweredQuizzes((prev) => new Set([...prev, currentQuiz.id]));
    setShowFeedback(true);
  };

  const handleContinueAfterQuiz = () => {
    setQuizModal({
      isOpen: false,
      currentQuiz: null,
      currentTest: null,
      currentQuestionIndex: 0,
      userAnswers: [],
      showResult: false,
    });

    setSelectedAnswer(null);
    setShowFeedback(false);

    const videoElement = document.querySelector("video");
    if (videoElement) {
      videoElement.play();
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#00000086]">
      <div className="flex items-center justify-center w-full h-full p-4">
        <div className="w-full max-w-lg overflow-hidden transition-all transform shadow-xl bg-surface dark:bg-surface-dark rounded-2xl">
          {/* Header */}
          <div className="p-4 text-white bg-primary dark:bg-primary-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full bg-opacity-20">
                  <FaChartLine className="text-sm" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {t("courses.quickQuiz", "Quick Quiz")}
                  </h3>
                  <p className="text-xs text-white text-opacity-90">
                    {t("courses.atTime", "At")} {currentQuiz.show_at_time}s
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-white rounded-full bg-opacity-20">
                  {currentQuestionIndex + 1}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 bg-surface dark:bg-surface-dark">
            {/* Question */}
            <div className="mb-4">
              <h4 className="mb-3 text-sm font-semibold leading-relaxed text-text dark:text-text-dark">
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentQuiz.title || t("courses.question", "Question"),
                  }}
                />
              </h4>

              {/* Answers */}
              <div className="space-y-2">
                {[1, 2, 3, 4].map((index) => {
                  const answer = currentQuiz[`answer_${index}`];
                  if (!answer) return null;

                  const answerIndex = index - 1;
                  const isSelected = selectedAnswer === answerIndex;
                  const isCorrectAnswer = answerIndex === correctAnswerIndex;

                  // Determine button styling
                  let buttonClass = "w-full p-3 text-sm text-left transition-all border rounded-lg ";

                  if (showFeedback) {
                    // After submission - show feedback
                    if (isCorrectAnswer) {
                      buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-400";
                    } else {
                      buttonClass += "border-border bg-surface dark:border-border-dark dark:bg-surface-dark opacity-60";
                    }
                  } else {
                    // Before submission - allow selection
                    if (isSelected) {
                      buttonClass += "border-primary bg-primary/10 dark:border-primary-dark dark:bg-primary-dark/10 cursor-pointer";
                    } else {
                      buttonClass += "border-border bg-surface dark:border-border-dark dark:bg-surface-dark hover:border-primary dark:hover:border-primary-dark hover:bg-primary/5 dark:hover:bg-primary-dark/5 cursor-pointer";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(answerIndex)}
                      disabled={showFeedback}
                      className={buttonClass}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-medium rounded-full border ${
                          showFeedback && isCorrectAnswer
                            ? "bg-green-500 text-white border-green-500 dark:bg-green-400 dark:border-green-400"
                            : showFeedback && isSelected && !isCorrect
                            ? "bg-red-500 text-white border-red-500 dark:bg-red-400 dark:border-red-400"
                            : isSelected
                            ? "bg-primary text-white border-primary dark:bg-primary-dark dark:border-primary-dark"
                            : "text-gray-500 border-gray-300 dark:text-gray-400 dark:border-gray-500"
                        }`}>
                          {showFeedback && isCorrectAnswer ? <FaCheck className="text-xs" /> : String.fromCharCode(64 + index)}
                        </div>
                        <span className={`text-sm font-medium ${
                          showFeedback && isCorrectAnswer
                            ? "text-green-700 dark:text-green-300"
                            : showFeedback && isSelected && !isCorrect
                            ? "text-red-700 dark:text-red-300"
                            : "text-text dark:text-text-dark"
                        }`}>{answer}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Message */}
            {showFeedback && (
              <div className={`mb-4 p-3 rounded-lg border ${
                isCorrect
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              }`}>
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <FaCheck className="text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {t("courses.correctAnswer", "Correct Answer! Well done")}
                      </span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        {t("courses.incorrectAnswer", "Incorrect Answer. The correct answer is shown above")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!showFeedback ? (
                <>
                  <button
                    onClick={handleContinueAfterQuiz}
                    className="flex-1 px-3 py-2 text-xs font-medium transition-colors rounded-lg text-text dark:text-text-dark bg-accent dark:bg-accent-dark hover:bg-accent/80 dark:hover:bg-accent-dark/80"
                  >
                    {t("common.skip", "Skip")}
                  </button>
                  <button
                    onClick={handleAnswerConfirm}
                    disabled={selectedAnswer === null}
                    className={`flex-1 px-3 py-2 text-xs font-medium text-white transition-all rounded-lg ${
                      selectedAnswer === null
                        ? "bg-gray-400 cursor-not-allowed dark:bg-gray-600"
                        : "bg-primary dark:bg-primary-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90"
                    }`}
                  >
                    {t("common.submit", "Submit Answer")}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleContinueAfterQuiz}
                  className="w-full px-3 py-2 text-xs font-medium text-white transition-all rounded-lg bg-primary dark:bg-primary-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90"
                >
                  {t("common.continue", "Continue")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};