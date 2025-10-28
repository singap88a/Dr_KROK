// QuizSystem/QuizModal.jsx
import React from "react";
import { FaTimes, FaChartLine } from "react-icons/fa"; // تأكد من وجود FaTimes هنا أيضاً
import { useTranslation } from "react-i18next";

export const QuizModal = ({ quizModal, setQuizModal, setAnsweredQuizzes, setQuizResults }) => {
  const { t } = useTranslation();

  if (!quizModal.isOpen || !quizModal.currentQuiz) return null;

  const { currentQuiz, currentQuestionIndex } = quizModal;

  const handleQuizSubmit = (answerIndex) => {
    const { currentQuiz, userAnswers, currentQuestionIndex } = quizModal;

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = answerIndex;

    const isCorrect = answerIndex === currentQuiz.correct_answer_index;

    setQuizResults((prev) => ({
      ...prev,
      [currentQuiz.id]: {
        question: currentQuiz.title,
        userAnswer: answerIndex,
        correctAnswer: currentQuiz.correct_answer_index,
        isCorrect: isCorrect,
        score: isCorrect ? parseInt(currentQuiz.question_score) : 0,
        showAtTime: currentQuiz.show_at_time,
      },
    }));

    setAnsweredQuizzes((prev) => new Set([...prev, currentQuiz.id]));

    setQuizModal({
      isOpen: false,
      currentQuiz: null,
      currentTest: null,
      currentQuestionIndex: 0,
      userAnswers: [],
      showResult: false,
    });

    const videoElement = document.querySelector("video");
    if (videoElement) {
      videoElement.play();
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#00000086]">
      <div className="flex items-center justify-center w-full h-full p-4">
        <div className="w-full max-w-lg overflow-hidden transition-all transform shadow-xl bg-surface rounded-2xl">
          {/* Header */}
          <div className="p-4 text-white bg-primary">
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
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            {/* Question */}
            <div className="mb-4">
              <h4 className="mb-3 text-sm font-semibold leading-relaxed text-text">
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

                  return (
                    <button
                      key={index}
                      onClick={() => handleQuizSubmit(index - 1)}
                      className="w-full p-3 text-sm text-left transition-all border rounded-lg cursor-pointer bg-surface border-border hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-medium text-gray-500 border border-gray-300 rounded-full">
                          {String.fromCharCode(64 + index)}
                        </div>
                        <span className="text-sm font-medium text-text">
                          {answer}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setQuizModal({
                    isOpen: false,
                    currentQuiz: null,
                    currentTest: null,
                    currentQuestionIndex: 0,
                    userAnswers: [],
                    showResult: false,
                  });
                  const videoElement = document.querySelector("video");
                  if (videoElement) {
                    videoElement.play();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs font-medium transition-colors rounded-lg text-text bg-accent hover:bg-accent/80"
              >
                {t("common.skip", "Skip")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};