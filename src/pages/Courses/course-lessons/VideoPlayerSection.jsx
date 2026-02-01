import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaVideo,
  FaImage,
  FaFileAlt,
  FaCheck,
  FaPlay,
  FaWhatsapp,
  FaStar as FaStarSolid,
  FaGraduationCap,
  FaList,
  FaLock,
  FaTimes,
  FaExclamationTriangle,
  FaChartLine,
  FaClock,
  FaUnlock,
  FaTrophy,
  FaAward
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import InlinePDFViewer from "../Popups/InlinePDFViewer";

const VideoPlayerSection = ({
  currentLesson,
  currentSection,
  course,
  courseProgress,
  isLoggedIn,
  lessonStatuses,
  onLessonComplete,
  onFileClick,
  onVideoClick,
  onImageClick,
  updateLessonStatus,
  navigate,
  onLessonClick
}) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  const [testModal, setTestModal] = useState({
    isOpen: false,
    message: "",
    progress: 0,
    required: 80,
    testName: ""
  });
  
  const [quizModal, setQuizModal] = useState({
    isOpen: false,
    currentQuiz: null,
    currentTest: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    showResult: false,
    selectedAnswer: null,
    showFeedback: false
  });

  const [resultsModal, setResultsModal] = useState({
    isOpen: false,
    test: null,
    totalQuestions: 0,
    correctAnswers: 0,
    score: 0
  });

  // State for expandable descriptions
  const [isLessonDescExpanded, setIsLessonDescExpanded] = useState(false);
  const [isSectionDescExpanded, setIsSectionDescExpanded] = useState(false);

  // Track video time for periodic quizzes
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [answeredQuizzes, setAnsweredQuizzes] = useState(new Set());
  const [quizResults, setQuizResults] = useState({});
  const [processedQuizzes, setProcessedQuizzes] = useState(new Set());

  // Get all periodic quizzes from current lesson
  const getPeriodicQuizzes = () => {
    if (!currentLesson || !currentLesson.lesson_end_tests) return [];
    
    return currentLesson.lesson_end_tests.filter(test => 
      test.test_type === "Periodic Quiz (Video Session)"
    );
  };

  // Handle video time update
  const handleTimeUpdate = (e) => {
    const time = Math.floor(e.target.currentTime);
    setCurrentVideoTime(time);
    
    // Check if there's a quiz at this time that hasn't been processed yet
    const periodicQuizzes = getPeriodicQuizzes();
    let foundQuiz = null;
    let foundTest = null;
    let questionIndex = 0;

    periodicQuizzes.forEach(test => {
      test.quizzes.forEach((quiz, idx) => {
        if (quiz.show_at_time === time && 
            !processedQuizzes.has(quiz.id) && 
            !answeredQuizzes.has(quiz.id)) {
          foundQuiz = quiz;
          foundTest = test;
          questionIndex = idx;
        }
      });
    });

    if (foundQuiz && !quizModal.isOpen) {
      // Pause video and show quiz
      e.target.pause();
      setProcessedQuizzes(prev => new Set([...prev, foundQuiz.id]));
      setQuizModal({
        isOpen: true,
        currentQuiz: foundQuiz,
        currentTest: foundTest,
        currentQuestionIndex: questionIndex,
        userAnswers: [],
        showResult: false,
        selectedAnswer: null,
        showFeedback: false
      });
    }
  };

  // Handle answer selection (first step)
  const handleAnswerSelect = (answerIndex) => {
    setQuizModal(prev => ({
      ...prev,
      selectedAnswer: answerIndex
    }));
  };

  // Handle answer confirmation and show feedback (second step)
  const handleAnswerConfirm = () => {
    const { currentQuiz, selectedAnswer, userAnswers, currentQuestionIndex } = quizModal;
    
    if (selectedAnswer === null) return;
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = selectedAnswer;
    
    // Store result
    const isCorrect = selectedAnswer === currentQuiz.correct_answer_index;
    
    // Update quiz results
    setQuizResults(prev => ({
      ...prev,
      [currentQuiz.id]: {
        question: currentQuiz.title,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuiz.correct_answer_index,
        isCorrect: isCorrect,
        score: isCorrect ? parseInt(currentQuiz.question_score) : 0,
        showAtTime: currentQuiz.show_at_time
      }
    }));

    // Mark this quiz as answered
    setAnsweredQuizzes(prev => new Set([...prev, currentQuiz.id]));
    
    // Show feedback
    setQuizModal(prev => ({
      ...prev,
      showFeedback: true,
      userAnswers: newUserAnswers
    }));
  };

  // Handle continue after viewing feedback
  const handleContinueAfterQuiz = () => {
    // Close modal and resume video
    setQuizModal({
      isOpen: false,
      currentQuiz: null,
      currentTest: null,
      currentQuestionIndex: 0,
      userAnswers: [],
      showResult: false,
      selectedAnswer: null,
      showFeedback: false
    });
    
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // Show final results when video ends
  const handleVideoEnd = async () => {
    // Calculate final results
    const periodicQuizzes = getPeriodicQuizzes();
    
    if (periodicQuizzes.length > 0) {
      let totalQuestions = 0;
      let correctAnswers = 0;
      let totalScore = 0;
      let maxScore = 0;

      periodicQuizzes.forEach(test => {
        test.quizzes.forEach(quiz => {
          totalQuestions++;
          maxScore += parseInt(quiz.question_score) || 50;
          
          const result = quizResults[quiz.id];
          if (result) {
            if (result.isCorrect) {
              correctAnswers++;
              totalScore += result.score;
            }
          }
        });
      });

      if (totalQuestions > 0) {
        // Wait a moment before showing results
        setTimeout(() => {
          setResultsModal({
            isOpen: true,
            test: periodicQuizzes[0],
            totalQuestions,
            correctAnswers,
            score: Math.round((totalScore / maxScore) * 100)
          });
        }, 1000);
      }
    }

    // Mark lesson as completed
    if (isLoggedIn && currentLesson) {
      try {
        await updateLessonStatus(currentLesson.id);
      } catch (error) {
        console.error("Error on video end:", error);
      }
    }
  };

  // Reset processed quizzes when lesson changes
  useEffect(() => {
    setProcessedQuizzes(new Set());
    setAnsweredQuizzes(new Set());
    setQuizResults({});
  }, [currentLesson?.id]);

  const getVideoRelatedArray = (videoRelated) => {
    if (!videoRelated) return [];
    if (Array.isArray(videoRelated)) return videoRelated;
    return [videoRelated];
  };

  // Handle test attempts
  const handleTestClick = (test, content, testType = 'lesson') => {
    // Don't handle periodic quizzes here - they're handled automatically
    if (test.test_type === "Periodic Quiz (Video Session)") {
      return;
    }

    const lessonProgress = lessonStatuses[content.id] || {};
    const progressPercentage = lessonProgress.percentage || lessonProgress.lesson_percentage || 0;
    const canTakeTest = progressPercentage >= 50;

    if (!canTakeTest) {
      setTestModal({
        isOpen: true,
        message: t("courses.watchVideoToUnlockTest", "You need to watch at least 50% of the video to unlock this test"),
        progress: progressPercentage,
        required: 50,
        testName: test.name || `${t("courses.test", "Test")}`
      });
      return;
    }

    // Navigate to test if allowed
    if (testType === 'lesson') {
      navigate(`/courses/${course.id}/test/lesson/${test.id}`, {
        state: {
          course,
          test,
          lessonId: content.id,
        },
      });
    } else {
      navigate(`/courses/${course.id}/test/final/${test.id}`, {
        state: { course, test },
      });
    }
  };

  // Professional modal popup for locked tests
  const TestLockModal = () => {
    if (!testModal.isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 overflow-hidden transition-all transform shadow-xl bg-surface dark:bg-surface-dark rounded-2xl">
          {/* Header */}
          <div className="p-6 text-white bg-primary dark:bg-primary-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full bg-opacity-20">
                  <FaLock className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {t("courses.testLocked", "Test Locked")}
                  </h3>
                  <p className="text-sm text-white text-opacity-90">
                    {testModal.testName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestModal({ ...testModal, isOpen: false })}
                className="p-2 transition-colors rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-surface dark:bg-surface-dark">
            <div className="flex items-center gap-4 p-4 mb-4 border rounded-lg bg-background dark:bg-background-dark border-border dark:border-border-dark">
              <div className="flex-shrink-0">
                <div className="p-3 bg-orange-100 rounded-full dark:bg-orange-900">
                  <FaExclamationTriangle className="text-2xl text-primary dark:text-primary-dark" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-text dark:text-text-dark">
                  {testModal.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setTestModal({ ...testModal, isOpen: false })}
                className="flex-1 px-4 py-3 font-medium transition-colors rounded-lg text-text dark:text-text-dark bg-accent dark:bg-accent-dark hover:bg-accent/80 dark:hover:bg-accent-dark/80"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                onClick={() => {
                  setTestModal({ ...testModal, isOpen: false });
                }}
                className="flex-1 px-4 py-3 font-medium text-white transition-all transform rounded-lg bg-primary dark:bg-primary-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90 hover:scale-105"
              >
                {t("courses.continueWatching", "Continue Watching")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Quiz Modal for periodic quizzes - positioned over entire screen
  const QuizModal = () => {
    if (!quizModal.isOpen || !quizModal.currentQuiz) return null;

    const { currentQuiz, currentQuestionIndex, selectedAnswer, showFeedback } = quizModal;
    const correctAnswerIndex = currentQuiz.correct_answer_index;
    const isCorrect = showFeedback && selectedAnswer === correctAnswerIndex;

    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg h-full max-h-[95%] overflow-hidden flex flex-col transition-all transform shadow-2xl bg-surface dark:bg-surface-dark rounded-xl border border-white/10"
        >
          {/* Header - Fixed at top */}
          <div className="p-3 text-white bg-gradient-to-r from-primary to-primary/80 dark:from-primary-dark dark:to-primary-dark/80 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-lg bg-opacity-20 backdrop-blur-sm">
                  <FaChartLine className="text-sm" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    Quick Quiz
                  </h3>
                  <p className="text-[10px] text-white text-opacity-80">
                    Question {currentQuestionIndex + 1} • {currentQuiz.show_at_time}s
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content - Scrollable if too long */}
          <div className="p-4 flex-1 overflow-y-auto bg-surface dark:bg-surface-dark scrollbar-hide">
            {/* Question */}
            <div className="mb-4">
              <div 
                className="text-sm font-semibold leading-relaxed text-text dark:text-text-dark"
                dangerouslySetInnerHTML={{ 
                  __html: currentQuiz.title || "Question" 
                }} 
              />
              
              {/* Answers */}
              <div className="mt-4 space-y-2">
                {[1, 2, 3, 4].map((index) => {
                  const answer = currentQuiz[`answer_${index}`];
                  if (!answer) return null;

                  const answerIndex = index - 1;
                  const isSelected = selectedAnswer === answerIndex;
                  const isCorrectAnswer = answerIndex === correctAnswerIndex;
                  
                  // Determine button styling
                  let buttonClass = "w-full p-3 text-left transition-all duration-200 border-2 rounded-xl flex items-center gap-3 ";
                  
                  if (showFeedback) {
                    if (isCorrectAnswer) {
                      buttonClass += "border-green-500 bg-green-500/10 dark:bg-green-500/20";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "border-red-500 bg-red-500/10 dark:bg-red-500/20";
                    } else {
                      buttonClass += "border-border bg-surface dark:border-border-dark opacity-40";
                    }
                  } else {
                    if (isSelected) {
                      buttonClass += "border-primary bg-primary/5 dark:border-primary-dark cursor-pointer shadow-sm";
                    } else {
                      buttonClass += "border-border bg-surface dark:border-border-dark dark:bg-surface-dark hover:border-primary/50 dark:hover:border-primary-dark/50 hover:bg-primary/5 cursor-pointer";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !showFeedback && handleAnswerSelect(answerIndex)}
                      disabled={showFeedback}
                      className={buttonClass}
                    >
                      <div className={`flex items-center justify-center flex-shrink-0 w-7 h-7 text-xs font-bold rounded-lg border-2 transition-colors ${
                        showFeedback && isCorrectAnswer
                          ? "bg-green-500 text-white border-green-500"
                          : showFeedback && isSelected && !isCorrect
                          ? "bg-red-500 text-white border-red-500"
                          : isSelected
                          ? "bg-primary text-white border-primary dark:bg-primary-dark"
                          : "text-gray-400 border-gray-200 dark:border-gray-700"
                      }`}>
                        {showFeedback && isCorrectAnswer ? <FaCheck size={12} /> : String.fromCharCode(64 + index)}
                      </div>
                      <span className={`text-sm font-medium ${
                        showFeedback && isCorrectAnswer
                          ? "text-green-600 dark:text-green-400"
                          : showFeedback && isSelected && !isCorrect
                          ? "text-red-600 dark:text-red-400"
                          : "text-text dark:text-text-dark"
                      }`}>{answer}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Message */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mb-4 p-3 rounded-xl border-2 flex items-center gap-3 ${
                    isCorrect
                      ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                      : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                    {isCorrect ? <FaCheck className="text-white text-[10px]" /> : <FaTimes className="text-white text-[10px]" />}
                  </div>
                  <span className="text-xs font-bold">
                    {isCorrect ? "Correct! Well done." : "Incorrect. See the correct answer above."}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="p-4 border-t border-border dark:border-border-dark bg-surface/50 dark:bg-surface-dark/50 shrink-0">
            <div className="flex gap-2">
              {!showFeedback ? (
                <>
                  <button
                    onClick={handleContinueAfterQuiz}
                    className="flex-1 px-4 py-2.5 text-xs font-bold transition-all rounded-xl text-text-muted hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleAnswerConfirm}
                    disabled={selectedAnswer === null}
                    className={`flex-1 px-4 py-2.5 text-xs font-bold text-white transition-all rounded-xl shadow-lg shadow-primary/20 ${
                      selectedAnswer === null
                        ? "bg-gray-300 cursor-not-allowed dark:bg-gray-700"
                        : "bg-primary dark:bg-primary-dark hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    Submit Answer
                  </button>
                </>
              ) : (
                <button
                  onClick={handleContinueAfterQuiz}
                  className="w-full px-4 py-2.5 text-xs font-bold text-white transition-all rounded-xl bg-primary dark:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Results Modal for showing final quiz results - positioned over entire screen
  const ResultsModal = () => {
    if (!resultsModal.isOpen) return null;

    const { totalQuestions, correctAnswers, score } = resultsModal;
    const isExcellent = score >= 90;
    const isGood = score >= 70;
    const isAverage = score >= 50;

    const getPerformanceMessage = () => {
      if (isExcellent) return { 
        message: "Outstanding! You've mastered this lesson completely.",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
        icon: "🏆"
      };
      if (isGood) return { 
        message: "Great job! You have a solid understanding of the material.",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        icon: "⭐"
      };
      if (isAverage) return { 
        message: "Good effort! You understand the main concepts.",
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/20",
        icon: "📚"
      };
      return { 
        message: "Keep practicing! Review the material and try again.",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        icon: "💪"
      };
    };

    const performance = getPerformanceMessage();

    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm h-full max-h-[90%] overflow-hidden flex flex-col transition-all transform shadow-2xl bg-surface dark:bg-surface-dark rounded-xl border border-white/10"
        >
          {/* Header - Fixed at top */}
          <div className="p-5 text-white text-center bg-gradient-to-br from-primary to-primary/80 dark:from-primary-dark dark:to-primary-dark/80 shrink-0">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FaTrophy className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">
              Quiz Completed!
            </h3>
            <p className="mt-0.5 text-[10px] text-white/70">
              Video Session Finished
            </p>
          </div>

          {/* Content - Scrollable if too long */}
          <div className="p-5 flex-1 overflow-y-auto bg-surface dark:bg-surface-dark scrollbar-hide">
            {/* Score Circle/Stats */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <div className="text-2xl font-black text-text dark:text-text-dark">{score}%</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-text-muted mt-0.5">Total Score</div>
              </div>
              <div className="h-8 w-px bg-border mx-3"></div>
              <div className="text-center flex-1">
                <div className="text-2xl font-black text-green-500">{correctAnswers}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-text-muted mt-0.5">Correct</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className={`p-3 mb-5 rounded-xl border-2 ${performance.bgColor} ${performance.borderColor}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{performance.icon}</span>
                <p className={`text-xs font-bold leading-snug ${performance.color}`}>
                  {performance.message}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-text-muted">Mastery Progress</span>
                <span className="text-[10px] font-black text-text">{correctAnswers}/{totalQuestions}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-accent dark:bg-accent-dark overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    isExcellent ? "bg-green-500" :
                    isGood ? "bg-blue-500" :
                    isAverage ? "bg-yellow-500" : "bg-orange-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Button - Fixed at bottom */}
          <div className="p-4 border-t border-border dark:border-border-dark bg-surface/50 dark:bg-surface-dark/50 shrink-0">
            <button
              onClick={() => setResultsModal({ ...resultsModal, isOpen: false })}
              className="w-full py-3 text-sm font-bold text-white transition-all transform rounded-xl bg-primary dark:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              Continue to Lesson
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderContentAttachments = (content, type) => {
    const isLesson = type === 'lesson';
    
    // Filter tests by type
    const lessonEndTests = content.lesson_end_tests?.filter(test => 
      test.test_type === "Lesson-End Test (Video Session)"
    ) || [];
    
    const periodicQuizzes = content.lesson_end_tests?.filter(test => 
      test.test_type === "Periodic Quiz (Video Session)"
    ) || [];

    return (
      <div className="mt-6">
        <h4 className="pb-2 mb-4 text-lg font-bold border-b text-text dark:text-text-dark border-border dark:border-border-dark">
          {t(isLesson ? "courses.lessonAttachments" : "courses.sectionAttachments", 
             isLesson ? "📚 Lesson Materials" : "📁 Section Materials")}
        </h4>

        {content.images && content.images.length > 0 && (
          <div className="mb-6">
            <h5 className="flex items-center gap-2 mb-3 text-lg font-semibold text-text dark:text-text-dark">
              <FaImage className="text-primary dark:text-primary-dark" />
              {t("courses.images", "Gallery")}
            </h5>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {content.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden transition-transform duration-200 transform rounded-lg cursor-pointer group hover:scale-105"
                  onClick={() => onImageClick(img)}
                >
                  <img
                    src={img}
                    alt={`${type} image ${idx + 1}`}
                    className="object-cover w-full rounded-lg h-28"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 group-hover:bg-opacity-30">
                    <div className="transition-all duration-200 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0">
                      <FaImage className="text-xl text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.files && content.files.length > 0 && (
          <div className="mb-6">
            <h5 className="flex items-center gap-2 mb-3 text-lg font-semibold text-text dark:text-text-dark">
              <FaFileAlt className="text-primary dark:text-primary-dark" />
              {t("courses.files", "Study Materials")}
            </h5>
            <div className="grid grid-cols-1 gap-6">
              {content.files.map((file, idx) => {
                const fileUrl = file.url || file;
                const fileName = file.name || `${t("courses.file", "File")} ${idx + 1}`;
                
                // Check if file is PDF (you can expand this logic as needed)
                const isPDF = typeof fileUrl === 'string' && fileUrl.toLowerCase().endsWith('.pdf');
                
                return (
                  <div key={idx}>
                    {isPDF ? (
                      // Display PDF inline
                      <div>
                        <h6 className="mb-3 text-base font-semibold text-text dark:text-text-dark">
                          {fileName}
                        </h6>
                        <InlinePDFViewer url={fileUrl} fileName={fileName} />
                      </div>
                    ) : (
                      // Display other file types as download button
                      <button
                        onClick={() => onFileClick(fileUrl)}
                        className="flex items-center gap-4 p-4 transition-all border-2 border-gray-200 rounded-xl hover:border-primary dark:hover:border-primary-dark hover:bg-primary/5 dark:hover:bg-primary-dark/5 hover:shadow-md group dark:border-gray-600"
                      >
                        <div className="flex-shrink-0 p-3 transition-colors rounded-lg bg-primary/10 group-hover:bg-primary/20 dark:bg-primary-dark/10">
                          <FaFileAlt className="text-xl text-primary dark:text-primary-dark" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="block text-sm font-medium text-text dark:text-text-dark">
                            {fileName}
                          </span>
                          <span className="block mt-1 text-xs text-text-muted dark:text-text-muted-dark">
                            {t("courses.clickToDownload", "Click to download")}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {content.video_related && (
          <div className="mb-6">
            <h5 className="flex items-center gap-2 mb-3 text-lg font-semibold text-text dark:text-text-dark">
              <FaVideo className="text-primary dark:text-primary-dark" />
              {t("courses.additionalVideos", "Additional Videos")}
            </h5>
            <div className="grid grid-cols-1 gap-4">
              {getVideoRelatedArray(content.video_related).map((video, idx) => {
                const isObj = typeof video === "object" && video !== null;
                const videoUrl = isObj
                  ? video.url || video.src || video.video || ""
                  : video;
                const thumbnail = isObj
                  ? video.thumbnail || video.poster || video.image || ""
                  : "";
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 transition-all border-2 border-gray-200 cursor-pointer rounded-xl hover:border-primary dark:hover:border-primary-dark hover:bg-primary/5 dark:hover:bg-primary-dark/5 hover:shadow-md group dark:border-gray-600"
                    onClick={() => onVideoClick(video)}
                  >
                    <div className="relative flex-shrink-0 w-24 h-16 overflow-hidden rounded-lg">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={`Additional video ${idx + 1}`}
                          className="object-cover w-full h-full transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <video
                          src={videoUrl}
                          className="object-cover w-full h-full"
                          muted
                          playsInline
                          preload="metadata"
                          controlsList="nodownload"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center transition-all bg-black/0 group-hover:bg-black/20">
                        <div className="flex items-center justify-center w-8 h-8 transition-transform transform bg-white rounded-full bg-opacity-90 group-hover:scale-110">
                          <FaPlay className="text-gray-700 text-xs ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-text dark:text-text-dark">
                          {t("courses.additionalVideo", "Additional Video")} {idx + 1}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted dark:text-text-muted-dark">
                        {t("courses.clickToWatch", "Click to watch this video")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lesson End Tests */}
        {isLesson && lessonEndTests.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary dark:bg-primary-dark">
                <FaChartLine className="text-lg text-white" />
              </div>
              <div>
                <h5 className="text-lg font-bold text-text dark:text-text-dark">
                  {t("courses.lessonTests", "Lesson Assessment")}
                </h5>
                <p className="text-sm text-text-muted dark:text-text-muted-dark">
                  {t("courses.testYourKnowledge", "Test your understanding of this lesson")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {lessonEndTests.map((test, idx) => {
                const lessonProgress = lessonStatuses[content.id] || {};
                const progressPercentage = lessonProgress.percentage || lessonProgress.lesson_percentage || 0;
                const canTakeTest = progressPercentage >= 50;

                return (
                  <div
                    key={test.id || idx}
                    className={`p-5 border-2 rounded-xl transition-all transform hover:scale-105 cursor-pointer ${
                      canTakeTest
                        ? "border-primary/20 bg-primary/5 hover:border-primary dark:hover:border-primary-dark hover:shadow-lg dark:border-primary-dark/20 dark:bg-primary-dark/5"
                        : "border-border bg-accent hover:border-border/80 dark:border-border-dark dark:bg-accent-dark"
                    }`}
                    onClick={() => handleTestClick(test, content, 'lesson')}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          canTakeTest
                            ? "bg-primary text-white dark:bg-primary-dark"
                            : "bg-text-muted text-background dark:bg-text-muted-dark dark:text-background-dark"
                        }`}>
                          {canTakeTest ? <FaUnlock /> : <FaLock />}
                        </div>
                        <div>
                          <h6 className="font-semibold text-text dark:text-text-dark">
                            {test.name || `${t("courses.test", "Test")} ${idx + 1}`}
                          </h6>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        canTakeTest
                          ? "bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark"
                          : "bg-accent text-text-muted dark:bg-accent-dark dark:text-text-muted-dark"
                      }`}>
                        {canTakeTest ? t("courses.available", "Available") : t("courses.locked", "Locked")}
                      </div>
                    </div>

                    {/* Progress indicator for the test - only show when available */}
                    {canTakeTest && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-muted dark:text-text-muted-dark">
                            {t("courses.lessonProgress", "Lesson Progress")}
                          </span>
                          <span className="text-xs font-bold text-text dark:text-text-dark">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-accent dark:bg-accent-dark">
                          <div
                            className="h-2 transition-all duration-500 rounded-full bg-primary dark:bg-primary-dark"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {!canTakeTest && (
                      <p className="flex items-center gap-1 mt-2 text-xs text-red-500 dark:text-red-400">
                        <FaLock className="text-xs" />
                        {t("courses.watchVideoToUnlockTest", "Watch 50% of the lesson to unlock")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInstructorCard = () => {
    if (!course.instructor) return null;

    return (
      <div className="p-6 border rounded-lg bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
        <h3 className="mb-4 text-lg font-semibold text-text dark:text-text-dark">
          {t("courses.instructor", "Instructor")}
        </h3>

        <div className="flex items-start gap-4">
          <img
            src={course.instructor.image || "/placeholder-instructor.jpg"}
            alt={course.instructor.name}
            className="object-cover w-16 h-16 border-2 rounded-full border-primary dark:border-primary-dark"
          />

          <div className="flex-1">
            <h4 className="text-lg font-semibold text-text dark:text-text-dark">
              {course.instructor.name}
            </h4>
            <p className="mb-2 font-medium text-primary dark:text-primary-dark">
              {course.instructor.job_title}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-text-muted dark:text-text-muted-dark">
              <div className="flex items-center gap-1">
                <FaGraduationCap />
                <span>
                  {course.instructor.years_of_experience}{" "}
                  {t("courses.yearsExp", "years experience")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FaStarSolid className="text-yellow-400" />
                <span>
                  {(course.instructor.average_rating || 0).toFixed(1)}
                </span>
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-text dark:text-text-dark line-clamp-3">
              {course.instructor.bio}
            </p>

            <Link
              to={`/instructors/${course.instructor.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary dark:bg-primary-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90"
            >
              {t("instructors.viewDetails", "View Details")}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderFinalTests = () => {
    if (!course.final_tests || course.final_tests.length === 0) return null;

    return (
      <div className=""></div>
    );
  };

  const renderVideoPlayer = () => {
    if (currentLesson) {
      return (
        <div className="relative" ref={videoContainerRef}>
          <div className="relative aspect-video">
            {currentLesson.video ? (
              <video
                ref={videoRef}
                src={currentLesson.video}
                controls
                className="w-full h-full"
                poster={currentLesson.image}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-accent dark:bg-accent-dark">
                <div className="text-center">
                  <FaVideo className="mx-auto mb-2 text-4xl text-text-muted dark:text-text-muted-dark" />
                  <p className="text-text-muted dark:text-text-muted-dark">
                    {t("courses.videoNotAvailable", "Video not available")}
                  </p>
                </div>
              </div>
            )}
            
            {/* Quiz Modal positioned exactly over video */}
            {quizModal.isOpen && <QuizModal />}
            
            {/* Results Modal positioned exactly over video */}
            {resultsModal.isOpen && <ResultsModal />}
          </div>
          
          <div className="p-4 border-t border-border dark:border-border-dark">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark">
              {currentLesson.title}
            </h3>
            {isLoggedIn && currentLesson.video && (
              <div className="mt-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLessonComplete(currentLesson.id);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white rounded bg-primary dark:bg-primary-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90"
                >
                  {t("courses.markCompleted", "Mark as Completed")}
                </button>
              </div>
            )}
            {currentLesson.description && (
              <div className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
                <div 
                  className={`leading-relaxed ${!isLessonDescExpanded ? 'line-clamp-4' : ''}`}
                  dangerouslySetInnerHTML={{ __html: currentLesson.description }} 
                />
                {currentLesson.description.length > 150 && (
                  <button
                    onClick={() => setIsLessonDescExpanded(!isLessonDescExpanded)}
                    className="mt-1 text-sm font-medium underline text-primary dark:text-primary-dark hover:text-primary/80 dark:hover:text-primary-dark/80 cursor-pointer"
                  >
                    {isLessonDescExpanded ? t("common.showLess", "Show Less") : t("common.showMore", "Show More")}
                  </button>
                )}
              </div>
            )}

            {renderContentAttachments(currentLesson, 'lesson')}

            {course.instructor && course.instructor.whatsapp && (
              <div className="p-3 mt-4 border rounded-lg bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900">
                    <FaWhatsapp className="text-lg text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-text dark:text-text-dark">
                      {t("courses.askInstructor", "Ask the Instructor")}
                    </h4>
                    <a
                      href={`https://wa.me/${course.instructor.whatsapp.replace(
                        /[^0-9]/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      {t("courses.contactInstructor", "Contact Instructor")}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else if (currentSection) {
      return (
        <div className="relative" ref={videoContainerRef}>
          <div className="relative aspect-video">
            {currentSection.video ? (
              <video
                src={currentSection.video}
                controls
                className="w-full h-full"
                poster={currentSection.images?.[0]}
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-accent dark:bg-accent-dark">
                <div className="text-center">
                  <FaVideo className="mx-auto mb-2 text-4xl text-text-muted dark:text-text-muted-dark" />
                  <p className="text-text-muted dark:text-text-muted-dark">
                    {t("courses.videoNotAvailable", "Video not available")}
                  </p>
                </div>
              </div>
            )}
            
            {/* Quiz Modal positioned exactly over video */}
            {quizModal.isOpen && <QuizModal />}
            
            {/* Results Modal positioned exactly over video */}
            {resultsModal.isOpen && <ResultsModal />}
          </div>
          
          <div className="p-4 border-t border-border dark:border-border-dark">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark">
              {currentSection.title}
            </h3>
            {currentSection.description && (
              <div className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
                <div 
                  className={`leading-relaxed ${!isSectionDescExpanded ? 'line-clamp-4' : ''}`}
                  dangerouslySetInnerHTML={{ __html: currentSection.description }} 
                />
                {currentSection.description.length > 150 && (
                  <button
                    onClick={() => setIsSectionDescExpanded(!isSectionDescExpanded)}
                    className="mt-1 text-sm font-medium underline text-primary dark:text-primary-dark hover:text-primary/80 dark:hover:text-primary-dark/80 cursor-pointer"
                  >
                    {isSectionDescExpanded ? t("common.showLess", "Show Less") : t("common.showMore", "Show More")}
                  </button>
                )}
              </div>
            )}

            {renderContentAttachments(currentSection, 'section')}
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative flex items-center justify-center bg-accent dark:bg-accent-dark aspect-video" ref={videoContainerRef}>
          <div className="text-center">
            <FaList className="mx-auto mb-4 text-6xl text-text-muted dark:text-text-muted-dark" />
            <p className="text-text-muted dark:text-text-muted-dark">
              {t("courses.selectContent", "Select a lesson or section to start")}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="space-y-6 lg:col-span-2">
        <div className="overflow-hidden border rounded-lg bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
          {renderVideoPlayer()}
        </div>
        
        {renderInstructorCard()}
        {renderFinalTests()}
      </div>

      {/* Test Lock Modal - This one stays full screen */}
      <TestLockModal />
    </>
  );
};

export default VideoPlayerSection;