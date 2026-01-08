import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MCQQuestion from './MCQQuestion';
import ConnectQuestion from './ConnectQuestion';

const TestInterface = ({ selectedTest, selectedCourse, onTestComplete, onBack }) => {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const shuffledQuestionsRef = useRef({}); // استخدام useRef بدل useState

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

  // دالة لاستخراج جميع أزواج النصوص والصور المتاحة من السؤال
  const extractAnswerPairs = (question) => {
    const pairs = [];
    let index = 1;
    
    while (question[`answer_${index}`] || question[`answer_${index}_image`]) {
      const text = question[`answer_${index}`];
      const image = question[`answer_${index}_image`];
      
      if (text && image) {
        pairs.push({
          key: `answer_${index}`,
          text: text,
          image: image
        });
      }
      index++;
    }
    
    return pairs;
  };

  // دالة لتحضير أسئلة التوصل بشكل عشوائي (مرة واحدة فقط)
  const prepareConnectQuestion = (question) => {
    if (question.type !== 'connect') return question;

    const pairs = extractAnswerPairs(question);
    
    if (pairs.length === 0) return question;

    // خلط الأزواج عشوائياً
    const shuffledPairs = shuffleArray(pairs);

    // إنشاء shuffledTexts و shuffledImages بشكل منفصل ومستقل
    const shuffledTexts = shuffleArray(shuffledPairs.map(pair => ({ 
      key: pair.key, 
      text: pair.text 
    })));
    
    const shuffledImages = shuffleArray(shuffledPairs.map(pair => ({ 
      key: pair.key, 
      image: pair.image 
    })));

    return {
      ...question,
      shuffledTexts,
      shuffledImages,
      totalPairs: pairs.length
    };
  };

  // دالة لتحضير إجابات MCQ بشكل عشوائي
  const prepareMCQAnswers = (question) => {
    if (question.type !== 'mcq') return null;
    
    // جمع جميع الإجابات المتاحة
    const availableAnswers = [];
    for (let i = 1; i <= 4; i++) {
      const answerKey = `answer_${i}`;
      if (question[answerKey] || question[`${answerKey}_image`]) {
        availableAnswers.push(answerKey);
      }
    }
    
    // خلط الإجابات عشوائياً
    return shuffleArray(availableAnswers);
  };

  // تحضير جميع الأسئلة (Connect و MCQ) عند بداية الاختبار
  useEffect(() => {
    if (selectedTest) {
      const shuffled = {};
      selectedTest.quizzes.forEach((question) => {
        if (question.type === 'connect') {
          shuffled[question.id] = prepareConnectQuestion(question);
        } else if (question.type === 'mcq') {
          // تخزين ترتيب الإجابات المخلوط لأسئلة MCQ
          shuffled[question.id] = {
            ...question,
            shuffledAnswers: prepareMCQAnswers(question)
          };
        }
      });
      shuffledQuestionsRef.current = shuffled; // حفظ في useRef
    }
  }, [selectedTest]);

  const currentQuestion = selectedTest.quizzes[currentQuestionIndex];

  // Timer effect for placement tests
  useEffect(() => {
    if (selectedTest && timeLeft !== null) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            nextQuestion();
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
  }, [selectedTest, timeLeft]);

  // Set timer for current question
  useEffect(() => {
    if (selectedTest && currentQuestionIndex >= 0) {
      const question = selectedTest.quizzes[currentQuestionIndex];
      if (question && question.answer_duration) {
        setTimeLeft(parseInt(question.answer_duration));
      } else {
        setTimeLeft(null);
      }
    }
  }, [currentQuestionIndex, selectedTest]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (currentQuestionIndex < selectedTest.quizzes.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
    } else {
      finishTest();
    }
  };

  const prevQuestion = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
    }
  };

  const finishTest = () => {
    let totalScore = 0;
    let earnedScore = 0;
    let correctAnswersCount = 0;
    let totalQuestionsCount = 0;
    let answeredQuestions = 0;

    let connectQuestionsCount = 0;
    let connectCorrect = 0;
    let connectWrong = 0;
    let connectAnswered = 0;
    let mcqQuestionsCount = 0;
    let mcqCorrect = 0;
    let mcqWrong = 0;
    let mcqAnswered = 0;

    selectedTest.quizzes.forEach(question => {
      totalScore += parseInt(question.question_score) || 0;
      totalQuestionsCount += 1;

      if (question.type === 'connect') {
        connectQuestionsCount += 1;
        
        const userAnswer = userAnswers[question.id];
        const isAnswered = userAnswer && Object.keys(userAnswer).length > 0;

        if (isAnswered) {
          connectAnswered += 1;
          answeredQuestions += 1;

          const questionEarnedScore = calculateConnectScore(question, userAnswer);
          earnedScore += questionEarnedScore;

          const totalPairs = extractAnswerPairs(question).length;
          let correctConnections = 0;
          
          if (userAnswer) {
            Object.keys(userAnswer).forEach(textKey => {
              if (userAnswer[textKey] === textKey) {
                correctConnections++;
              }
            });
          }

          if (correctConnections === totalPairs && totalPairs > 0) {
            correctAnswersCount += 1;
            connectCorrect += 1;
          } else {
            connectWrong += 1;
          }

        } else {
          connectWrong += 1;
        }
      } else {
        mcqQuestionsCount += 1;
        const correctAnswerKey = `answer_${parseInt(question.correct_answer_index) + 1}`;
        if (userAnswers[question.id]) {
          mcqAnswered += 1;
          answeredQuestions += 1;
          if (userAnswers[question.id] === correctAnswerKey) {
            earnedScore += parseInt(question.question_score) || 0;
            correctAnswersCount += 1;
            mcqCorrect += 1;
          } else {
            mcqWrong += 1;
          }
        } else {
          mcqWrong += 1;
        }
      }
    });

    const percentage = totalScore > 0 ? (earnedScore / totalScore) * 100 : 0;

    onTestComplete({
      totalScore,
      earnedScore,
      percentage,
      totalQuestions: totalQuestionsCount,
      correctAnswers: correctAnswersCount,
      answeredQuestions,
      notAnsweredQuestions: totalQuestionsCount - answeredQuestions,
      connectQuestions: connectQuestionsCount,
      connectCorrect,
      connectWrong,
      connectAnswered,
      connectNotAnswered: connectQuestionsCount - connectAnswered,
      mcqQuestions: mcqQuestionsCount,
      mcqCorrect,
      mcqWrong,
      mcqAnswered,
      mcqNotAnswered: mcqQuestionsCount - mcqAnswered
    });
  };

  const calculateConnectScore = (question, userAnswer) => {
    if (!userAnswer || Object.keys(userAnswer).length === 0) {
      return 0;
    }

    const totalPairs = extractAnswerPairs(question).length;
    if (totalPairs === 0) return 0;

    let correctConnections = 0;

    Object.keys(userAnswer).forEach(textKey => {
      if (userAnswer[textKey] === textKey) {
        correctConnections++;
      }
    });

    const questionScore = parseInt(question.question_score) || 0;
    const earnedScore = (correctConnections / totalPairs) * questionScore;

    return earnedScore;
  };

  const getMinimumAnswersRequired = () => {
    if (currentQuestion.type !== 'connect') return 1;
    
    const pairs = extractAnswerPairs(currentQuestion);
    return Math.min(2, pairs.length);
  };

  const minimumAnswersRequired = getMinimumAnswersRequired();
  const hasTimer = currentQuestion.answer_duration;

  return (
    <div className="min-h-screen px-4 py-8 transition-colors duration-300 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="overflow-hidden border shadow-xl bg-surface rounded-2xl border-border">
          <div className="p-6 text-white bg-primary">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <h1 className="mb-4 text-2xl font-bold text-center md:mb-0 md:text-left">{selectedTest.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="text-blue-100">
                  {t('testYourself.test.question', 'Question')} {currentQuestionIndex + 1} {t('testYourself.test.of', 'of')} {selectedTest.quizzes.length}
                </div>
                
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
            {currentQuestion.type === 'mcq' ? (
              <MCQQuestion 
                question={currentQuestion}
                userAnswer={userAnswers[currentQuestion.id]}
                onAnswerSelect={handleAnswerSelect}
                shuffledAnswers={shuffledQuestionsRef.current[currentQuestion.id]?.shuffledAnswers}
              />
            ) : (
              <ConnectQuestion 
                question={currentQuestion}
                userAnswer={userAnswers[currentQuestion.id]}
                onAnswerSelect={handleAnswerSelect}
                shuffledQuestions={shuffledQuestionsRef.current} // تمرير useRef.current
              />
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
                disabled={
                  currentQuestion.type === 'connect'
                    ? Object.keys(userAnswers[currentQuestion.id] || {}).length < minimumAnswersRequired
                    : !userAnswers[currentQuestion.id]
                }
                className={`flex items-center px-8 py-3 font-medium text-white transition-all duration-300 transform shadow-lg bg-primary hover:bg-blue-700 rounded-xl hover:scale-105 ${
                  (currentQuestion.type === 'connect'
                    ? Object.keys(userAnswers[currentQuestion.id] || {}).length < minimumAnswersRequired
                    : !userAnswers[currentQuestion.id]
                  ) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
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
};

export default TestInterface;