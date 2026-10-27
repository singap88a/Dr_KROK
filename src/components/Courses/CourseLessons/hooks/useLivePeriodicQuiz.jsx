import { useState, useEffect } from "react";

export function useLivePeriodicQuiz({
  currentLesson,
  lessonStatuses,
  setLessonStatuses,
  completeLiveLessonProgress,
  updateLessonStatus,
  id,
  isLoggedIn,
  setCourseProgress,
}) {
  const [quizModal, setQuizModal] = useState({
    isOpen: false,
    currentQuiz: null,
    currentTest: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    showResult: false,
  });

  const [resultsModal, setResultsModal] = useState({
    isOpen: false,
    test: null,
    totalQuestions: 0,
    correctAnswers: 0,
    score: 0,
  });

  const [answeredQuizzes, setAnsweredQuizzes] = useState(new Set());
  const [quizResults, setQuizResults] = useState({});
  const [processedQuizzes, setProcessedQuizzes] = useState(new Set());

  // Reset quiz states when lesson changes
  useEffect(() => {
    setProcessedQuizzes(new Set());
    setAnsweredQuizzes(new Set());
    setQuizResults({});
  }, [currentLesson?.id]);

  const getPeriodicQuizzes = () => {
    if (!currentLesson || !currentLesson.lesson_end_tests) return [];
    return currentLesson.lesson_end_tests.filter(
      (test) => test.test_type === "Periodic Quiz (Live Session)"
    );
  };

  const handleVideoTimeUpdate = (e) => {
    const time = Math.floor(e.target.currentTime);
    const periodicQuizzes = getPeriodicQuizzes();
    let foundQuiz = null;
    let foundTest = null;
    let questionIndex = 0;

    periodicQuizzes.forEach((test) => {
      test.quizzes.forEach((quiz, idx) => {
        if (
          quiz.show_at_time === time &&
          !processedQuizzes.has(quiz.id) &&
          !answeredQuizzes.has(quiz.id)
        ) {
          foundQuiz = quiz;
          foundTest = test;
          questionIndex = idx;
        }
      });
    });

    if (foundQuiz) {
      e.target.pause();
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch((err) => console.warn(err));
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
      setProcessedQuizzes((prev) => new Set([...prev, foundQuiz.id]));
      setQuizModal({
        isOpen: true,
        currentQuiz: foundQuiz,
        currentTest: foundTest,
        currentQuestionIndex: questionIndex,
        userAnswers: [],
        showResult: false,
      });
    }
  };

  const handleVideoEnd = async () => {
    const periodicQuizzes = getPeriodicQuizzes();
    if (periodicQuizzes.length > 0) {
      let totalQuestions = 0;
      let correctAnswers = 0;
      let totalScore = 0;
      let maxScore = 0;

      periodicQuizzes.forEach((test) => {
        test.quizzes.forEach((quiz) => {
          totalQuestions++;
          maxScore += parseInt(quiz.question_score) || 50;
          const result = quizResults[quiz.id];
          if (result && result.isCorrect) {
            correctAnswers++;
            totalScore += result.score;
          }
        });
      });

      if (totalQuestions > 0) {
        setTimeout(() => {
          setResultsModal({
            isOpen: true,
            test: periodicQuizzes[0],
            totalQuestions,
            correctAnswers,
            score: Math.round((totalScore / maxScore) * 100),
          });
        }, 1000);
      }
    }

    if (isLoggedIn && currentLesson) {
      try {
        const currentStatus = lessonStatuses[currentLesson.id] || {};
        const hasTests =
          currentLesson.lesson_end_tests &&
          currentLesson.lesson_end_tests.length > 0;
        let newPercentage = 100;

        if (hasTests) {
          const quizCompleted = currentStatus.quiz_percentage >= 100;
          newPercentage = quizCompleted ? 100 : 50;
        }

        setLessonStatuses((prev) => ({
          ...prev,
          [currentLesson.id]: {
            ...prev[currentLesson.id],
            lesson_percentage: 100,
            percentage: newPercentage,
            status: newPercentage === 100 ? "completed" : "in_progress",
          },
        }));

        const res = await completeLiveLessonProgress(
          id,
          currentLesson.id,
          "lesson"
        );
        if (res?.course_progress) setCourseProgress(res.course_progress);
        if (res?.lesson) {
          setLessonStatuses((prev) => ({
            ...prev,
            [currentLesson.id]: {
              ...prev[currentLesson.id],
              ...res.lesson,
            },
          }));
        }
        await updateLessonStatus(currentLesson.id);
      } catch {
        // Handle error silently
      }
    }
  };

  return {
    quizModal,
    setQuizModal,
    resultsModal,
    setResultsModal,
    answeredQuizzes,
    setAnsweredQuizzes,
    quizResults,
    setQuizResults,
    processedQuizzes,
    setProcessedQuizzes,
    handleVideoTimeUpdate,
    handleVideoEnd,
  };
}
