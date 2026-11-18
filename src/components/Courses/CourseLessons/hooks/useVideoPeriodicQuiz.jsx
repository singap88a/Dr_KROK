import { useState, useEffect, useRef } from "react";

export function useVideoPeriodicQuiz({
  currentLesson,
  isLoggedIn,
  handleLessonComplete,
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
  const [processedTimes, setProcessedTimes] = useState(new Set());

  // Reset quiz states when lesson changes
  useEffect(() => {
    setProcessedQuizzes(new Set());
    setAnsweredQuizzes(new Set());
    setProcessedTimes(new Set());
    setQuizResults({});
  }, [currentLesson?.id]);

  // Synchronous guard: state updates are async, so several timeupdate events
  // can fire before processedQuizzes re-renders. The ref prevents double-opens.
  const triggeredRef = useRef(new Set());
  useEffect(() => {
    triggeredRef.current = new Set();
  }, [currentLesson?.id]);

  // Backend sends "Periodic Quiz (Video Session)", "Periodic Quiz", etc.
  // Accept any periodic quiz that isn't explicitly a live-session one.
  const getPeriodicQuizzes = () => {
    if (!currentLesson) return [];
    const fromEndTests = (currentLesson.lesson_end_tests || []).filter(
      (test) =>
        typeof test?.test_type === "string" &&
        test.test_type.includes("Periodic Quiz") &&
        !test.test_type.includes("Live")
    );

    // Some responses ship periodic quizzes separately: either as tests
    // (with a `quizzes` array) or as a flat list of quiz questions.
    const separate = Array.isArray(currentLesson.periodic_quizzes)
      ? currentLesson.periodic_quizzes
      : [];
    const separateTests = separate.filter((item) => Array.isArray(item?.quizzes));
    const looseQuizzes = separate.filter((item) => !Array.isArray(item?.quizzes));
    const extra = looseQuizzes.length
      ? [{ id: `periodic-${currentLesson.id}`, test_type: "Periodic Quiz", quizzes: looseQuizzes }]
      : [];

    return [...fromEndTests, ...separateTests, ...extra];
  };

  // Max seconds after show_at_time we still accept, to survive skipped
  // timeupdate ticks (playback-rate changes, frame drops, ~250ms cadence).
  const TRIGGER_WINDOW = 1;

  const handleVideoTimeUpdate = (e) => {
    const time = Math.floor(e.target.currentTime);

    const periodicQuizzes = getPeriodicQuizzes();
    let foundQuiz = null;
    let foundTest = null;
    let questionIndex = 0;

    for (const test of periodicQuizzes) {
      const quizzes = Array.isArray(test.quizzes) ? test.quizzes : [];
      for (let idx = 0; idx < quizzes.length; idx++) {
        const quiz = quizzes[idx];
        // show_at_time may arrive as number, "15" or "15.00"
        const raw = quiz?.show_at_time;
        if (raw === null || raw === undefined || raw === "") continue;
        const quizTime = Math.floor(Number(raw));
        if (!Number.isFinite(quizTime)) continue;

        const delta = time - quizTime;
        if (
          delta >= 0 &&
          delta <= TRIGGER_WINDOW &&
          !triggeredRef.current.has(quiz.id) &&
          !processedQuizzes.has(quiz.id) &&
          !answeredQuizzes.has(quiz.id)
        ) {
          foundQuiz = quiz;
          foundTest = test;
          questionIndex = idx;
          break;
        }
      }
      if (foundQuiz) break;
    }

    if (foundQuiz) {
      triggeredRef.current.add(foundQuiz.id);
      e.target.pause();
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch((err) => console.warn(err));
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
      setProcessedQuizzes((prev) => new Set([...prev, foundQuiz.id]));
      setProcessedTimes((prev) => new Set([...prev, time]));
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
      handleLessonComplete(currentLesson.id);
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
    processedTimes,
    setProcessedTimes,
    handleVideoTimeUpdate,
    handleVideoEnd,
  };
}
