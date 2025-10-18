import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../../context/ApiContext';
import { useTranslation } from 'react-i18next';

const TestYourself = () => {
  const { getPlacementCourses } = useApi();
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [courseType, setCourseType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dragItem, setDragItem] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState({});
  const timerRef = useRef(null);

  // دالة لخلط العناصر عشوائياً
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // دالة لتحضير أسئلة التوصل بشكل عشوائي
  const prepareConnectQuestion = (question) => {
    if (question.type !== 'connect') return question;

    const pairs = [];

    // جمع الأزواج المتاحة (نص وصورة)
    ['answer_1', 'answer_2', 'answer_3', 'answer_4'].forEach(key => {
      if (question[key] && question[`${key}_image`]) {
        pairs.push({
          key,
          text: question[key],
          image: question[`${key}_image`]
        });
      }
    });

    // خلط الأزواج عشوائياً
    const shuffledPairs = shuffleArray(pairs);

    // إنشاء shuffledTexts و shuffledImages
    const shuffledTexts = shuffledPairs.map(pair => ({ key: pair.key, text: pair.text }));
    const shuffledImages = shuffleArray(shuffledPairs.map(pair => ({ key: pair.key, image: pair.image })));

    return {
      ...question,
      shuffledTexts,
      shuffledImages
    };
  };

  // Fetch data from APIs
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        const res = await getPlacementCourses({ type: 'all' });
        const allCourses = Array.isArray(res?.data) ? res.data : [];
        setCourses(allCourses);
        setFilteredCourses(allCourses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [getPlacementCourses]);

  // Apply filters (type only)
  useEffect(() => {
    let filtered = courses;

    if (courseType !== 'all') {
      filtered = filtered.filter(course => course.type === courseType);
    }

    setFilteredCourses(filtered);
  }, [courseType, courses]);

  // Timer effect for placement tests
  useEffect(() => {
    if (testStarted && selectedTest && timeLeft !== null) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, selectedTest, timeLeft]);

  const handleTimeUp = () => {
    nextQuestion();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedTest(null);
    setTestStarted(false);
    setTestCompleted(false);
    setShuffledQuestions({});
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setShuffledQuestions({});
  };

  const startTest = () => {
    setTestStarted(true);
    setTestCompleted(false);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setShuffledQuestions({});
    
    // تحضير جميع أسئلة التوصل بشكل عشوائي
    const shuffled = {};
    selectedTest.quizzes.forEach((question) => {
      if (question.type === 'connect') {
        shuffled[question.id] = prepareConnectQuestion(question);
      }
    });
    setShuffledQuestions(shuffled);
    
    // Set timer for first question if it has answer_duration
    const firstQuestion = selectedTest.quizzes[0];
    if (firstQuestion && firstQuestion.answer_duration) {
      setTimeLeft(parseInt(firstQuestion.answer_duration));
    } else {
      setTimeLeft(null);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleDragStart = (e, questionId, answerKey) => {
    setDragItem({ questionId, answerKey });
    e.dataTransfer.setData('text/plain', `${questionId}-${answerKey}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, questionId, textKey) => {
    e.preventDefault();
    if (dragItem && dragItem.questionId === questionId) {
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [textKey]: dragItem.answerKey
        }
      }));
    }
    setDragItem(null);
  };

  const nextQuestion = () => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (currentQuestionIndex < selectedTest.quizzes.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      // Set timer for next question if it has answer_duration
      const nextQuestion = selectedTest.quizzes[nextIndex];
      if (nextQuestion && nextQuestion.answer_duration) {
        setTimeLeft(parseInt(nextQuestion.answer_duration));
      } else {
        setTimeLeft(null);
      }
    } else {
      finishTest();
    }
  };

  const prevQuestion = () => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      
      // Set timer for previous question if it has answer_duration
      const prevQuestion = selectedTest.quizzes[prevIndex];
      if (prevQuestion && prevQuestion.answer_duration) {
        setTimeLeft(parseInt(prevQuestion.answer_duration));
      } else {
        setTimeLeft(null);
      }
    }
  };

  const finishTest = () => {
    let totalScore = 0;
    let earnedScore = 0;
    let correctAnswersCount = 0;

    selectedTest.quizzes.forEach(question => {
      totalScore += parseInt(question.question_score);
      
      if (question.type === 'connect') {
        // For connect type questions, calculate score based on correct matches
        const userAnswer = userAnswers[question.id];
        if (userAnswer) {
          // Count number of answers available for this question
          const answerCount = ['answer_1', 'answer_2', 'answer_3', 'answer_4'].filter(
            key => question[key] && question[`${key}_image`]
          ).length;

          // Calculate score per correct connection
          const scorePerConnection = parseInt(question.question_score) / answerCount;

          // Count correct connections (assuming correct is text key matches image key)
          let correctConnections = 0;
          Object.keys(userAnswer).forEach(textKey => {
            if (userAnswer[textKey] === textKey) {
              correctConnections++;
            }
          });

          // Add score for each correct connection
          earnedScore += correctConnections * scorePerConnection;
          correctAnswersCount += correctConnections;
        }
      } else {
        // For MCQ questions
        if (userAnswers[question.id] === question.correct_answer) {
          earnedScore += parseInt(question.question_score);
          correctAnswersCount += 1;
        }
      }
    });

    const percentage = totalScore > 0 ? (earnedScore / totalScore) * 100 : 0;

    setResults({
      totalScore,
      earnedScore,
      percentage,
      totalQuestions: selectedTest.quizzes.length,
      correctAnswers: correctAnswersCount
    });

    setTestCompleted(true);
    setTestStarted(false);
    setTimeLeft(null);
  };

  const resetTest = () => {
    setSelectedCourse(null);
    setSelectedTest(null);
    setTestStarted(false);
    setTestCompleted(false);
    setResults(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(null);
    setShuffledQuestions({});
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const clearFilters = () => {
    setCourseType('all');
  };

  // Results Page
  if (testCompleted && results) {
    return (
      <div className="min-h-screen px-4 py-8 transition-colors duration-300 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="overflow-hidden border shadow-xl bg-surface rounded-2xl border-border">
            <div className="p-8 text-white bg-primary">
              <h1 className="mb-2 text-3xl font-bold text-center">{t('testYourself.results.title', 'Test Results')}</h1>
              <p className="text-center text-blue-100">{t('testYourself.results.completed', 'You have completed')} {selectedTest.name}</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
                <div className="p-6 border bg-surface border-border rounded-xl">
                  <h3 className="mb-4 text-xl font-semibold text-center text-text">{t('testYourself.results.overallScore', 'Overall Score')}</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          className="text-accent"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          className="text-primary"
                          strokeWidth="3"
                          strokeDasharray={`${results.percentage}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-text">{results.percentage.toFixed(1)}%</span>
                        <span className="mt-1 text-sm text-text-secondary">{t('testYourself.results.score', 'Score')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border bg-surface border-border rounded-xl">
                  <h3 className="mb-4 text-xl font-semibold text-text">{t('testYourself.results.details', 'Test Details')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-text-secondary">{t('testYourself.results.totalScore', 'Total Score')}:</span>
                      <span className="font-semibold text-text">{results.totalScore}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-text-secondary">{t('testYourself.results.scoreAchieved', 'Score Achieved')}:</span>
                      <span className="font-semibold text-secondary">{results.earnedScore}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-text-secondary">{t('testYourself.results.totalQuestions', 'Total Questions')}:</span>
                      <span className="font-semibold text-text">{results.totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-text-secondary">{t('testYourself.results.correctAnswers', 'Correct Answers')}:</span>
                      <span className="font-semibold text-secondary">{results.correctAnswers}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-text-secondary">{t('testYourself.results.wrongAnswers', 'Wrong Answers')}:</span>
                      <span className="font-semibold text-red-500">{results.totalQuestions - results.correctAnswers}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetTest}
                  className="px-8 py-3 font-medium text-white transition-all duration-300 transform shadow-lg bg-primary hover:bg-blue-700 rounded-xl hover:scale-105"
                >
                  {t('testYourself.results.back', 'Back to Courses')}
                </button>
                <button
                  onClick={() => {
                    // Navigate to course lessons page
                    window.location.href = `/courses/${selectedCourse.id}/lessons`;
                  }}
                  className="flex items-center px-8 py-3 font-medium text-white transition-all duration-300 transform shadow-lg bg-primary hover:bg-blue-700 rounded-xl hover:scale-105"
                >
                  {t('testYourself.results.enrollInCourse', 'Enroll in Course')}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test Page
  if (testStarted && selectedTest) {
    const currentQuestion = selectedTest.quizzes[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestion.id];
    const hasTimer = currentQuestion.answer_duration;
    
    // الحصول على السؤال المعدل إذا كان من نوع توصل
    const displayQuestion = currentQuestion.type === 'connect' 
      ? shuffledQuestions[currentQuestion.id] || currentQuestion
      : currentQuestion;

    return (
      <div className="min-h-screen px-4 py-8 transition-colors duration-300 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="overflow-hidden border shadow-xl bg-surface rounded-2xl border-border">
            <div className="p-6 text-white bg-primary">
              <div className="flex flex-col items-center justify-between md:flex-row">
                <h1 className="mb-4 text-2xl font-bold text-center md:mb-0 md:text-left">{selectedTest.name}</h1>
                <div className="flex items-center space-x-4">
                  <div className="text-blue-100">
                    {t('testYourself.test.question', 'Question')} {currentQuestionIndex + 1} {t('testYourself.test.of', 'of')} {selectedTest.quizzes.length}
                  </div>
                  
                  {/* Timer for questions with answer_duration */}
                  {hasTimer && timeLeft !== null && (
                    <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                      timeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-blue-600'
                    }`}>
                      ⏱️ {formatTime(timeLeft)}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full h-2 mt-4 bg-blue-500 rounded-full">
                <div 
                  className="h-2 transition-all duration-300 bg-white rounded-full" 
                  style={{ width: `${((currentQuestionIndex + 1) / selectedTest.quizzes.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-8">
              <div 
                className="p-6 mb-8 text-xl font-semibold border text-text bg-accent rounded-xl border-border"
                dangerouslySetInnerHTML={{ __html: currentQuestion.title }}
              />
              
              {currentQuestion.type === 'mcq' ? (
                <div className="space-y-4">
                  {['answer_1', 'answer_2', 'answer_3', 'answer_4'].map((answerKey) => {
                    const answerText = currentQuestion[answerKey];
                    const answerImage = currentQuestion[`${answerKey}_image`];
                    
                    if (!answerText && !answerImage) return null;
                    
                    return (
                      <div 
                        key={answerKey}
                        className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          userAnswer === answerKey 
                            ? 'border-primary bg-blue-50 dark:bg-blue-900/20 shadow-md transform scale-105' 
                            : 'border-border hover:border-primary hover:bg-accent hover:shadow-sm'
                        }`}
                        onClick={() => handleAnswerSelect(currentQuestion.id, answerKey)}
                      >
                        <div className="flex items-start">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-1 flex-shrink-0 ${
                            userAnswer === answerKey ? 'border-primary bg-primary' : 'border-text-muted'
                          }`}>
                            {userAnswer === answerKey && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            {answerText && <div className="font-medium text-text">{answerText}</div>}
                            {answerImage && (
                              <img 
                                src={answerImage} 
                                alt="Answer" 
                                className="mx-auto mt-3 rounded-lg shadow-sm max-h-48"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Connect Questions: Drag images to matching texts (مع التوزيع العشوائي)
                <div className="space-y-6">
                  <div className="max-w-5xl p-4 mx-auto border shadow-md bg-gradient-to-br from-surface to-accent border-border rounded-2xl">
                    <h3 className="mb-4 text-lg font-bold text-center text-text">
                      {t('testYourself.test.connectInstruction', 'Match each image with its correct text by dragging.')}
                    </h3>

                    {/* Layout: Texts (Left) + Images (Right) */}
                    <div className="grid items-start justify-center grid-cols-1 gap-4 lg:grid-cols-2">
                      {/* Left Column — Text Cards (مخلوطة عشوائياً) */}
                      <div className="space-y-3">
                        <h4 className="pb-1 text-sm font-semibold border-b text-primary border-primary/40">
                          {t('testYourself.test.texts', 'Texts')}
                        </h4>

                        {displayQuestion.shuffledTexts ? (
                          displayQuestion.shuffledTexts.map(({ key, text }) => {
                            const isDropped = userAnswers[currentQuestion.id] && userAnswers[currentQuestion.id][key];
                            
                            return (
                              <div
                                key={key}
                                className="relative flex flex-col justify-between w-full max-w-[220px] mx-auto bg-white dark:bg-gray-900 border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]"
                              >
                                {/* Text Content */}
                                <div className="flex flex-col items-center justify-center p-3 text-center">
                                  <p className="text-text text-[15px] leading-snug font-bold">{text}</p>
                                </div>

                                {/* Drop Zone */}
                                <div
                                  className={`p-2 border-t rounded-b-lg transition-all duration-300 flex items-center justify-center min-h-[60px]
                                    ${
                                      isDropped
                                        ? 'border-green-400 bg-green-50 dark:bg-green-900/30 shadow-inner'
                                        : 'border-dashed border-border bg-surface hover:border-primary hover:bg-accent'
                                    }`}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, currentQuestion.id, key)}
                                >
                                  {isDropped ? (
                                    <div className="relative flex items-center justify-center w-full h-full group">
                                      <img
                                        src={currentQuestion[`${isDropped}_image`]}
                                        alt="Dropped image"
                                        className="object-cover w-full h-20 transition-transform duration-300 rounded-md cursor-pointer group-hover:scale-105"
                                        onClick={() => {
                                          setUserAnswers((prev) => {
                                            const newAnswers = { ...prev };
                                            if (newAnswers[currentQuestion.id]) {
                                              delete newAnswers[currentQuestion.id][key];
                                              if (Object.keys(newAnswers[currentQuestion.id]).length === 0) {
                                                delete newAnswers[currentQuestion.id];
                                              }
                                            }
                                            return newAnswers;
                                          });
                                        }}
                                      />
                                      <button
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-md hover:bg-red-600"
                                        onClick={() => {
                                          setUserAnswers((prev) => {
                                            const newAnswers = { ...prev };
                                            if (newAnswers[currentQuestion.id]) {
                                              delete newAnswers[currentQuestion.id][key];
                                              if (Object.keys(newAnswers[currentQuestion.id]).length === 0) {
                                                delete newAnswers[currentQuestion.id];
                                              }
                                            }
                                            return newAnswers;
                                          });
                                        }}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-center text-text-muted">
                                      <svg
                                        className="w-4 h-4 mx-auto mb-1 opacity-40"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                      </svg>
                                      <p className="text-[11px] font-medium">{t('testYourself.test.dropHere', 'Drop image here')}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          // Fallback if not shuffled
                          ['answer_1', 'answer_2', 'answer_3', 'answer_4'].map((answerKey) => {
                            const answerText = currentQuestion[answerKey];
                            const isDropped = userAnswers[currentQuestion.id] && userAnswers[currentQuestion.id][answerKey];
                            if (!answerText) return null;

                            return (
                              <div
                                key={answerKey}
                                className="relative flex flex-col justify-between w-full max-w-[220px] mx-auto bg-white dark:bg-gray-900 border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]"
                              >
                                {/* Text Content */}
                                <div className="flex flex-col items-center justify-center p-3 text-center">
                                  <p className="text-text text-[15px] leading-snug font-bold">{answerText}</p>
                                </div>

                                {/* Drop Zone */}
                                <div
                                  className={`p-2 border-t rounded-b-lg transition-all duration-300 flex items-center justify-center min-h-[60px]
                                    ${
                                      isDropped
                                        ? 'border-green-400 bg-green-50 dark:bg-green-900/30 shadow-inner'
                                        : 'border-dashed border-border bg-surface hover:border-primary hover:bg-accent'
                                    }`}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, currentQuestion.id, answerKey)}
                                >
                                  {isDropped ? (
                                    <div className="relative flex items-center justify-center w-full h-full group">
                                      <img
                                        src={currentQuestion[`${isDropped}_image`]}
                                        alt="Dropped image"
                                        className="object-cover w-full h-20 transition-transform duration-300 rounded-md cursor-pointer group-hover:scale-105"
                                        onClick={() => {
                                          setUserAnswers((prev) => {
                                            const newAnswers = { ...prev };
                                            if (newAnswers[currentQuestion.id]) {
                                              delete newAnswers[currentQuestion.id][answerKey];
                                              if (Object.keys(newAnswers[currentQuestion.id]).length === 0) {
                                                delete newAnswers[currentQuestion.id];
                                              }
                                            }
                                            return newAnswers;
                                          });
                                        }}
                                      />
                                      <button
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-md hover:bg-red-600"
                                        onClick={() => {
                                          setUserAnswers((prev) => {
                                            const newAnswers = { ...prev };
                                            if (newAnswers[currentQuestion.id]) {
                                              delete newAnswers[currentQuestion.id][answerKey];
                                              if (Object.keys(newAnswers[currentQuestion.id]).length === 0) {
                                                delete newAnswers[currentQuestion.id];
                                              }
                                            }
                                            return newAnswers;
                                          });
                                        }}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-center text-text-muted">
                                      <svg
                                        className="w-4 h-4 mx-auto mb-1 opacity-40"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                      </svg>
                                      <p className="text-[11px] font-medium">{t('testYourself.test.dropHere', 'Drop image here')}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Right Column — Image Cards (مخلوطة عشوائياً) */}
                      <div className="space-y-3">
                        <h4 className="pb-1 text-sm font-semibold border-b text-primary border-primary/40">
                          {t('testYourself.test.images', 'Images')}
                        </h4>

                        {displayQuestion.shuffledImages ? (
                          displayQuestion.shuffledImages.map(({ key, image }) => {
                            const isUsed =
                              userAnswers[currentQuestion.id] &&
                              Object.values(userAnswers[currentQuestion.id]).includes(key);

                            return (
                              <div
                                key={key}
                                draggable={!isUsed}
                                onDragStart={(e) => handleDragStart(e, currentQuestion.id, key)}
                                className={`w-full max-w-[220px] mx-auto bg-white dark:bg-gray-900 border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]
                                  ${
                                    isUsed
                                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                                      : 'border-dashed border-border cursor-grab hover:border-primary active:cursor-grabbing'
                                  }`}
                              >
                                <div className="w-full h-[100px] rounded-lg overflow-hidden">
                                  <img
                                    src={image}
                                    alt="Draggable image"
                                    className="object-cover w-full h-full rounded-lg"
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          // Fallback if not shuffled
                          ['answer_1', 'answer_2', 'answer_3', 'answer_4'].map((answerKey) => {
                            const answerImage = currentQuestion[`${answerKey}_image`];
                            const isUsed =
                              userAnswers[currentQuestion.id] &&
                              Object.values(userAnswers[currentQuestion.id]).includes(answerKey);
                            if (!answerImage) return null;

                            return (
                              <div
                                key={answerKey}
                                draggable={!isUsed}
                                onDragStart={(e) => handleDragStart(e, currentQuestion.id, answerKey)}
                                className={`w-full max-w-[220px] mx-auto bg-white dark:bg-gray-900 border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]
                                  ${
                                    isUsed
                                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                                      : 'border-dashed border-border cursor-grab hover:border-primary active:cursor-grabbing'
                                  }`}
                              >
                                <div className="w-full h-[100px] rounded-lg overflow-hidden">
                                  <img
                                    src={answerImage}
                                    alt="Draggable image"
                                    className="object-cover w-full h-full rounded-lg"
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col items-center justify-between mt-12 space-y-4 sm:flex-row sm:space-y-0">
                <button 
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
                    currentQuestionIndex === 0 
                      ? 'bg-accent text-text-muted cursor-not-allowed' 
                      : 'bg-accent text-text hover:bg-border hover:shadow-md transform hover:scale-105'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t('testYourself.test.previous', 'Previous')}
                </button>
                
                <button 
                  onClick={nextQuestion}
                  className="flex items-center px-8 py-3 font-medium text-white transition-all duration-300 transform shadow-lg bg-primary hover:bg-blue-700 rounded-xl hover:scale-105"
                >
                  {currentQuestionIndex === selectedTest.quizzes.length - 1 ? (
                    <>
                      {t('testYourself.test.finish', 'Finish Test')}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      {t('testYourself.test.next', 'Next Question')}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course Details Page
  if (selectedCourse && !testStarted) {
    return (
      <div className="min-h-screen px-4 py-8 transition-colors duration-300 bg-background">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => setSelectedCourse(null)}
            className="flex items-center mb-8 font-medium transition-colors duration-200 text-primary hover:text-blue-700 group"
          >
            <svg className="w-5 h-5 mr-2 transition-transform duration-200 transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('testYourself.course.back', 'Back to Courses')}
          </button>
          
          <div className="mb-8 overflow-hidden border shadow-xl bg-surface rounded-2xl border-border">
            <div className="md:flex">
              <div className="md:flex-shrink-0 md:w-2/5">
                <img 
                  className="object-cover w-full h-64 md:h-full" 
                  src={selectedCourse.image} 
                  alt={selectedCourse.title}
                />
              </div>
              <div className="p-8">
                <div className="inline-block px-3 py-1 mb-4 text-sm font-semibold rounded-full bg-primary/10 text-primary">
                  {selectedCourse.type === 'video' ? 'Video Course' : 'Live Course'}
                </div>
                <h1 className="mb-4 text-3xl font-bold text-text">
                  {selectedCourse.title}
                </h1>
                <p className="mb-6 text-lg leading-relaxed text-text-secondary">
                  {selectedCourse.description}
                </p>
                <div className="flex items-center mb-6">
                  <img 
                    className="object-cover w-12 h-12 rounded-full shadow-sm" 
                    src={selectedCourse.instructor_image} 
                    alt={selectedCourse.instructor}
                  />
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-text">{selectedCourse.instructor}</p>
                    <p className="text-text-muted">Instructor</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 text-sm font-medium border rounded-full bg-primary/10 text-primary border-primary/20">
                    Level: {selectedCourse.level}
                  </span>
                  <span className="px-4 py-2 text-sm font-medium border rounded-full bg-secondary/10 text-secondary border-secondary/20">
                    {selectedCourse.category}
                  </span>
                  <span className="px-4 py-2 text-sm font-medium text-purple-500 border rounded-full bg-purple-500/10 border-purple-500/20">
                    Year: {selectedCourse.college_year}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden border shadow-xl bg-surface rounded-2xl border-border">
            <div className="p-6 border-b bg-accent border-border">
              <h2 className="text-2xl font-bold text-text">{t('testYourself.course.testsTitle', 'Placement Tests')}</h2>
              <p className="mt-2 text-text-secondary">{t('testYourself.course.testsSubtitle', 'Assess your current level with these placement tests')}</p>
            </div>
            
            <div className="divide-y divide-border">
              {selectedCourse.placement_tests.map(test => (
                <div key={test.id} className="p-6 transition-colors duration-200 hover:bg-accent">
                  <div className="flex flex-col items-start justify-between lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-semibold text-text">{test.name}</h3>
                      <p className="mb-3 text-text-secondary">{test.description}</p>
                      <div className="flex flex-wrap gap-4">
                        <span className="flex items-center text-sm text-text-muted">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {t('testYourself.course.questions', 'Questions')}: {test.number_student_questions}
                        </span>
                        <span className="flex items-center text-sm text-text-muted">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('testYourself.course.created', 'Created')}: {test.created_at}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        handleTestSelect(test);
                        startTest();
                      }}
                      className="px-6 py-3 mt-4 font-medium text-white transition-all duration-300 transform shadow-lg lg:mt-0 bg-primary hover:bg-blue-700 rounded-xl hover:scale-105"
                    >
                      {t('testYourself.course.startTest', 'Start Test')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Courses Page
  return (
    <div className="min-h-screen px-4 py-8 transition-colors duration-300 bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-start justify-between mb-8 lg:flex-row lg:items-center">
          <div className="mb-6 text-center lg:text-left lg:mb-0">
            <h1 className="mb-4 text-4xl font-bold text-text">{t('testYourself.main.title', 'Placement Tests')}</h1>
            <p className="max-w-2xl text-lg text-text-secondary">{t('testYourself.main.subtitle', 'Choose the right course and start your placement test to assess your current knowledge level')}</p>
          </div>
        </div>
        
        {/* Compact Filters */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-xl font-semibold text-text">{t('testYourself.filters.title', 'Filter Courses')}</h2>
          <div className="flex items-center gap-2 p-1 border rounded-xl border-border bg-surface">
            <button
              onClick={() => setCourseType('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                courseType === 'all' ? 'bg-primary text-white' : 'text-text hover:bg-accent'
              }`}
            >
              {t('testYourself.filters.all', 'All')}
            </button>
            <button
              onClick={() => setCourseType('video')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                courseType === 'video' ? 'bg-primary text-white' : 'text-text hover:bg-accent'
              }`}
            >
              {t('testYourself.filters.video', 'Video')}
            </button>
            <button
              onClick={() => setCourseType('live')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                courseType === 'live' ? 'bg-primary text-white' : 'text-text hover:bg-accent'
              }`}
            >
              {t('testYourself.filters.live', 'Live')}
            </button>
          </div>
        </div>
        <div className="mb-8 text-sm text-text-muted">
          {t('testYourself.filters.showing', 'Showing')} {filteredCourses.length} {t('testYourself.filters.of', 'of')} {courses.length} {t('testYourself.filters.courses', 'courses')}
        </div>
        
        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map(course => (
              <div 
                key={course.id}
                className="overflow-hidden transition-all duration-300 transform border shadow-lg cursor-pointer bg-surface rounded-2xl hover:shadow-xl hover:-translate-y-1 group border-border"
                onClick={() => handleCourseSelect(course)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105" 
                    src={course.image} 
                    alt={course.title}
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      course.type === 'video' 
                        ? 'bg-primary/20 text-white bg-[#000000a2]' 
                        : 'bg-primary/20 text-white bg-[#000000a2]'
                    }`}>
                      {course.type === 'video' ? 'Video' : 'Live'}
                    </span>
                  </div>
                  <div className="absolute inset-0 transition-all duration-300 bg-black bg-opacity-0 group-hover:bg-opacity-10"></div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      className="object-cover w-10 h-10 mr-3 rounded-full shadow-sm" 
                      src={course.instructor_image} 
                      alt={course.instructor}
                    />
                    <span className="font-medium text-text-secondary">{course.instructor}</span>
                  </div>
                  
                  <h3 className="mb-3 text-xl font-bold transition-colors duration-200 text-text line-clamp-2 group-hover:text-primary">
                    {course.title}
                  </h3>
                  
                  <p className="mb-4 text-sm text-text-secondary line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-text">
                      {course.level}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-text">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-text">
                      Year {course.college_year}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm text-text-muted">
                      {course.placement_tests?.length || 0} test(s)
                    </span>
                    <button className="flex items-center text-sm font-semibold transition-transform duration-200 text-primary hover:text-blue-700 group-hover:translate-x-1">
                      {t('testYourself.main.viewDetails', 'View Details')}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredCourses.length === 0 && !loading && (
          <div className="py-16 text-center">
            <div className="max-w-md p-12 mx-auto border shadow-sm bg-surface rounded-2xl border-border">
              <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mb-2 text-xl font-semibold text-text">{t('testYourself.empty.title', 'No courses found')}</h3>
              <p className="text-text-muted">{t('testYourself.empty.desc', 'No courses match your current filter criteria.')}</p>
              <button 
                onClick={clearFilters}
                className="mt-4 font-medium text-primary hover:text-blue-700"
              >
                {t('testYourself.filters.clear', 'Clear Filters')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestYourself;