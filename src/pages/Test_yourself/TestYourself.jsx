import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestYourself = () => {
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
  const [courseLevel, setCourseLevel] = useState('all');
  const [courseYear, setCourseYear] = useState('all');
  const [courseCategory, setCourseCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dragItem, setDragItem] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch data from APIs
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        const [videoResponse, liveResponse] = await Promise.all([
          axios.get('https://dr-krok.com/api/placementCourses/video'),
          axios.get('https://dr-krok.com/api/placementCourses/live')
        ]);

        const videoCourses = videoResponse.data.data.map(course => ({
          ...course,
          type: 'video'
        }));

        const liveCourses = liveResponse.data.data.map(course => ({
          ...course,
          type: 'live'
        }));

        const allCourses = [...videoCourses, ...liveCourses];
        setCourses(allCourses);
        setFilteredCourses(allCourses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Timer effect
  useEffect(() => {
    let timer;
    if (testStarted && !testCompleted) {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, testCompleted]);

  // Get unique values for filters
  const uniqueLevels = [...new Set(courses.map(course => course.level))];
  const uniqueYears = [...new Set(courses.map(course => course.college_year))];
  const uniqueCategories = [...new Set(courses.map(course => course.category))];

  // Apply filters
  useEffect(() => {
    let filtered = courses;

    if (courseType !== 'all') {
      filtered = filtered.filter(course => course.type === courseType);
    }

    if (courseLevel !== 'all') {
      filtered = filtered.filter(course => course.level === courseLevel);
    }

    if (courseYear !== 'all') {
      filtered = filtered.filter(course => course.college_year === courseYear);
    }

    if (courseCategory !== 'all') {
      filtered = filtered.filter(course => course.category === courseCategory);
    }

    setFilteredCourses(filtered);
  }, [courseType, courseLevel, courseYear, courseCategory, courses]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedTest(null);
    setTestStarted(false);
    setTestCompleted(false);
    setTimeSpent(0);
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
  };

  const startTest = () => {
    setTestStarted(true);
    setTestCompleted(false);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeSpent(0);
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

  const handleDrop = (e, questionId) => {
    e.preventDefault();
    if (dragItem && dragItem.questionId === questionId) {
      handleAnswerSelect(questionId, dragItem.answerKey);
    }
    setDragItem(null);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedTest.quizzes.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishTest = () => {
    let totalScore = 0;
    let earnedScore = 0;
    
    selectedTest.quizzes.forEach(question => {
      totalScore += parseInt(question.question_score);
      if (userAnswers[question.id] === question.correct_answer) {
        earnedScore += parseInt(question.question_score);
      }
    });
    
    const percentage = totalScore > 0 ? (earnedScore / totalScore) * 100 : 0;
    
    setResults({
      totalScore,
      earnedScore,
      percentage,
      totalQuestions: selectedTest.quizzes.length,
      correctAnswers: Object.keys(userAnswers).filter(qId => 
        userAnswers[qId] === selectedTest.quizzes.find(q => q.id == qId)?.correct_answer
      ).length,
      timeSpent: formatTime(timeSpent)
    });
    
    setTestCompleted(true);
    setTestStarted(false);
  };

  const resetTest = () => {
    setSelectedCourse(null);
    setSelectedTest(null);
    setTestStarted(false);
    setTestCompleted(false);
    setResults(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeSpent(0);
  };

  const clearFilters = () => {
    setCourseType('all');
    setCourseLevel('all');
    setCourseYear('all');
    setCourseCategory('all');
  };

  // Results Page
  if (testCompleted && results) {
    return (
      <div className="min-h-screen px-4 py-8 transition-colors duration-300 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="overflow-hidden border shadow-xl bg-surface rounded-2xl border-border">
            <div className="p-8 text-white bg-primary">
              <h1 className="mb-2 text-3xl font-bold text-center">Test Results</h1>
              <p className="text-center text-blue-100">You have completed {selectedTest.name}</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
                <div className="p-6 border bg-surface border-border rounded-xl">
                  <h3 className="mb-4 text-xl font-semibold text-center text-text">Overall Score</h3>
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
                        <span className="mt-1 text-sm text-text-secondary">Score</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border bg-surface border-border rounded-xl">
                  <h3 className="mb-4 text-xl font-semibold text-text">Test Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-text-secondary">Total Score:</span>
                      <span className="font-semibold text-text">{results.totalScore}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-text-secondary">Score Achieved:</span>
                      <span className="font-semibold text-secondary">{results.earnedScore}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-text-secondary">Total Questions:</span>
                      <span className="font-semibold text-text">{results.totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-text-secondary">Correct Answers:</span>
                      <span className="font-semibold text-secondary">{results.correctAnswers}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-text-secondary">Wrong Answers:</span>
                      <span className="font-semibold text-red-500">{results.totalQuestions - results.correctAnswers}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-text-secondary">Time Spent:</span>
                      <span className="font-semibold text-primary">{results.timeSpent}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button 
                  onClick={resetTest}
                  className="px-8 py-3 font-medium text-white transition-all duration-300 transform shadow-lg bg-primary hover:bg-blue-700 rounded-xl hover:scale-105"
                >
                  Back to Courses
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
    
    return (
      <div className="min-h-screen px-4 py-8 transition-colors duration-300 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="overflow-hidden border shadow-xl bg-surface rounded-2xl border-border">
            <div className="p-6 text-white bg-primary">
              <div className="flex flex-col items-center justify-between md:flex-row">
                <h1 className="mb-4 text-2xl font-bold text-center md:mb-0 md:text-left">{selectedTest.name}</h1>
                <div className="flex items-center space-x-4">
                  <div className="text-blue-100">
                    Question {currentQuestionIndex + 1} of {selectedTest.quizzes.length}
                  </div>
                  <div className="px-3 py-1 text-sm bg-blue-500 rounded-full">
                    Time: {formatTime(timeSpent)}
                  </div>
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
                // Drag & Drop Questions
                <div className="space-y-6">
                  <div className="p-6 border bg-accent rounded-xl border-border">
                    <h3 className="mb-4 text-lg font-semibold text-text">Drag the correct answer to the target area</h3>
                    
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="font-medium text-text-secondary">Available Answers:</h4>
                        {['answer_1', 'answer_2', 'answer_3', 'answer_4'].map((answerKey) => {
                          const answerText = currentQuestion[answerKey];
                          const answerImage = currentQuestion[`${answerKey}_image`];
                          
                          if (!answerText && !answerImage) return null;
                          
                          return (
                            <div 
                              key={answerKey}
                              draggable
                              onDragStart={(e) => handleDragStart(e, currentQuestion.id, answerKey)}
                              className="p-4 transition-shadow duration-200 border-2 border-dashed shadow-sm bg-surface border-border rounded-xl cursor-grab hover:shadow-md hover:border-primary"
                            >
                              {answerText && <div className="font-medium text-center text-text">{answerText}</div>}
                              {answerImage && (
                                <img 
                                  src={answerImage} 
                                  alt="Answer" 
                                  className="mx-auto mt-3 rounded-lg max-h-32"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div 
                        className={`border-2 rounded-xl p-6 min-h-64 flex flex-col items-center justify-center transition-all duration-300 ${
                          userAnswer 
                            ? 'border-secondary bg-green-50 dark:bg-green-900/20' 
                            : 'border-dashed border-border bg-surface'
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, currentQuestion.id)}
                      >
                        {userAnswer ? (
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-3 font-semibold text-secondary">
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Answer Selected
                            </div>
                            <div className="p-4 border rounded-lg shadow-sm bg-surface border-secondary">
                              {currentQuestion[userAnswer] && (
                                <div className="font-medium text-text">{currentQuestion[userAnswer]}</div>
                              )}
                              {currentQuestion[`${userAnswer}_image`] && (
                                <img 
                                  src={currentQuestion[`${userAnswer}_image`]} 
                                  alt="Selected answer" 
                                  className="mx-auto mt-3 rounded-lg max-h-32"
                                />
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-text-muted">
                            <svg className="w-12 h-12 mx-auto mb-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            <p className="font-medium">Drag the correct answer here</p>
                            <p className="mt-1 text-sm">Drop your selection in this area</p>
                          </div>
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
                  Previous
                </button>
                
                <button 
                  onClick={nextQuestion}
                  className="flex items-center px-8 py-3 font-medium text-white transition-all duration-300 transform shadow-lg bg-primary hover:bg-blue-700 rounded-xl hover:scale-105"
                >
                  {currentQuestionIndex === selectedTest.quizzes.length - 1 ? (
                    <>
                      Finish Test
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Next Question
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
            Back to Courses
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
              <h2 className="text-2xl font-bold text-text">Placement Tests</h2>
              <p className="mt-2 text-text-secondary">Assess your current level with these placement tests</p>
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
                          Questions: {test.number_student_questions}
                        </span>
                        <span className="flex items-center text-sm text-text-muted">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Created: {test.created_at}
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
                      Start Test
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
            <h1 className="mb-4 text-4xl font-bold text-text">Placement Tests</h1>
            <p className="max-w-2xl text-lg text-text-secondary">
              Choose the right course and start your placement test to assess your current knowledge level
            </p>
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="self-center p-3 transition-all duration-300 border shadow-sm bg-surface border-border hover:bg-accent text-text rounded-xl hover:shadow-md lg:self-auto"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Enhanced Filters */}
        <div className="p-6 mb-8 border shadow-sm bg-surface rounded-2xl border-border">
          <div className="flex flex-col items-start justify-between mb-6 lg:flex-row lg:items-center">
            <h2 className="mb-4 text-xl font-semibold text-text lg:mb-0">Filter Courses</h2>
            <button 
              onClick={clearFilters}
              className="flex items-center text-sm font-medium text-primary hover:text-blue-700"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear All Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Course Type Filter */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-text">Course Type</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCourseType('all')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    courseType === 'all'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-accent text-text hover:bg-border'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCourseType('video')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    courseType === 'video'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-accent text-text hover:bg-border'
                  }`}
                >
                  Video
                </button>
                <button
                  onClick={() => setCourseType('live')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    courseType === 'live'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-accent text-text hover:bg-border'
                  }`}
                >
                  Live
                </button>
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-text">Level</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCourseLevel('all')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    courseLevel === 'all'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-accent text-text hover:bg-border'
                  }`}
                >
                  All
                </button>
                {uniqueLevels.slice(0, 2).map(level => (
                  <button
                    key={level}
                    onClick={() => setCourseLevel(level)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      courseLevel === level
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-accent text-text hover:bg-border'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-text">Year</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCourseYear('all')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    courseYear === 'all'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-accent text-text hover:bg-border'
                  }`}
                >
                  All
                </button>
                {uniqueYears.slice(0, 2).map(year => (
                  <button
                    key={year}
                    onClick={() => setCourseYear(year)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      courseYear === year
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-accent text-text hover:bg-border'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-text">Category</label>
              <select 
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm transition-colors duration-200 border rounded-lg border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-text-muted">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
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
                        ? 'bg-primary/20 text-primary backdrop-blur-sm' 
                        : 'bg-secondary/20 text-secondary backdrop-blur-sm'
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
                      View Details
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
              <h3 className="mb-2 text-xl font-semibold text-text">No courses found</h3>
              <p className="text-text-muted">No courses match your current filter criteria.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 font-medium text-primary hover:text-blue-700"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestYourself;