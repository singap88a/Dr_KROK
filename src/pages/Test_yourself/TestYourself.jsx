import React, { useEffect, useReducer, createContext, useContext } from 'react';
import sampleQuestions from './data/sampleQuestions.json';

// Context for exam state management
const ExamContext = createContext();

// Initial state
const initialState = {
  phase: 'instructions', // 'instructions' | 'exam' | 'results'
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  markedForReview: new Set(),
  timeRemaining: null,
  startTime: null,
  submitted: false,
  results: null
};

// Action types
const actions = {
  LOAD_QUESTIONS: 'LOAD_QUESTIONS',
  START_EXAM: 'START_EXAM',
  ANSWER_QUESTION: 'ANSWER_QUESTION',
  MARK_FOR_REVIEW: 'MARK_FOR_REVIEW',
  NEXT_QUESTION: 'NEXT_QUESTION',
  PREVIOUS_QUESTION: 'PREVIOUS_QUESTION',
  JUMP_TO_QUESTION: 'JUMP_TO_QUESTION',
  SUBMIT_EXAM: 'SUBMIT_EXAM',
  RESET_EXAM: 'RESET_EXAM',
  TICK_TIMER: 'TICK_TIMER'
};

// Reducer function
function examReducer(state, action) {
  switch (action.type) {
    case actions.LOAD_QUESTIONS: {
      return { ...state, questions: action.payload };
    }

    case actions.START_EXAM: {
      const totalTime = state.questions.reduce((sum, q) => sum + (q.timeLimit || 0), 0);
      return {
        ...state,
        phase: 'exam',
        timeRemaining: totalTime || 3600, // Default 1 hour if no time specified
        startTime: Date.now()
      };
    }

    case actions.ANSWER_QUESTION: {
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.answer
        }
      };
    }

    case actions.MARK_FOR_REVIEW: {
      const newMarked = new Set(state.markedForReview);
      if (action.payload.marked) {
        newMarked.add(action.payload.questionId);
      } else {
        newMarked.delete(action.payload.questionId);
      }
      return { ...state, markedForReview: newMarked };
    }

    case actions.NEXT_QUESTION: {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
      }
      return state;
    }

    case actions.PREVIOUS_QUESTION: {
      if (state.currentQuestionIndex > 0) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex - 1 };
      }
      return state;
    }

    case actions.JUMP_TO_QUESTION: {
      return { ...state, currentQuestionIndex: action.payload };
    }

    case actions.SUBMIT_EXAM: {
      return { ...state, phase: 'results', submitted: true, results: action.payload };
    }

    case actions.RESET_EXAM: {
      return { ...initialState };
    }

    case actions.TICK_TIMER: {
      return { ...state, timeRemaining: state.timeRemaining - 1 };
    }

    default:
      return state;
  }
}

// Provider component
function ExamProvider({ children }) {
  const [state, dispatch] = useReducer(examReducer, initialState);

  const value = { state, dispatch, actions };
  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

// Hook to use exam context
function useExam() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
}

// Scoring utility
function calculateResults(state) {
  const { questions, answers } = state;
  let totalScore = 0;
  let maxPossibleScore = 0;
  const gradedQuestions = [];

  questions.forEach(question => {
    maxPossibleScore += question.maxScore;
    const userAnswer = answers[question.id];

    if (question.type === 'essay') {
      // Essays are manually graded, so score is 0 until reviewed
      gradedQuestions.push({
        id: question.id,
        isCorrect: false,
        score: 0,
        userAnswer: userAnswer || '',
        correctAnswer: question.correctAnswer
      });
    } else {
      let isCorrect = false;
      let score = 0;

      if (question.type === 'mcq') {
        isCorrect = userAnswer === question.correctAnswer;
        score = isCorrect ? question.maxScore : 0;
      } else if (question.type === 'multi') {
        const correctAnswers = new Set(question.correctAnswer);
        const userAnswers = new Set(userAnswer || []);
        isCorrect = correctAnswers.size === userAnswers.size &&
                   [...correctAnswers].every(ans => userAnswers.has(ans));
        score = isCorrect ? question.maxScore : 0;
      }

      totalScore += score;
      gradedQuestions.push({
        id: question.id,
        isCorrect,
        score,
        userAnswer,
        correctAnswer: question.correctAnswer
      });
    }
  });

  const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  return {
    totalScore,
    maxPossibleScore,
    gradedQuestions,
    percentage
  };
}

// Component for displaying images
function ImageViewer({ src, alt, caption }) {
  return (
    <div className="my-4">
      <img src={src} alt={alt} className="h-auto max-w-full rounded-lg shadow-md" />
      {caption && <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">{caption}</p>}
    </div>
  );
}

// Component for essay input
function EssayInput({ value, onChange, minWords = 0, maxWords = 1000, placeholder }) {
  const wordCount = value ? value.trim().split(/\s+/).length : 0;
  const isValid = wordCount >= minWords && wordCount <= maxWords;

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        rows={6}
      />
      <div className="flex justify-between text-sm">
        <span className={isValid ? 'text-green-600' : 'text-red-600'}>
          Words: {wordCount} (Min: {minWords}, Max: {maxWords})
        </span>
      </div>
    </div>
  );
}

// Component for choice lists (MCQ and Multi-select)
function ChoiceList({ options, selected, onChange, type = 'mcq', disabled = false }) {
  const handleChange = (optionIndex) => {
    if (disabled) return;

    if (type === 'mcq') {
      onChange(optionIndex);
    } else if (type === 'multi') {
      const currentSelected = Array.isArray(selected) ? selected : [];
      const isSelected = currentSelected.includes(optionIndex);
      const newSelected = isSelected
        ? currentSelected.filter(idx => idx !== optionIndex)
        : [...currentSelected, optionIndex];
      onChange(newSelected);
    }
  };

  return (
    <div className="space-y-2 ">
      {options.map((option, index) => {
        const isSelected = type === 'mcq'
          ? selected === index
          : Array.isArray(selected) && selected.includes(index);

        return (
          <label
            key={index}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input
              type={type === 'mcq' ? 'radio' : 'checkbox'}
              name="question-option"
              checked={isSelected}
              onChange={() => handleChange(index)}
              disabled={disabled}
              className="mr-3"
            />
            <span className="text-gray-900 dark:text-white">{option}</span>
          </label>
        );
      })}
    </div>
  );
}

// Component for question cards
function QuestionCard({ question, answer, onAnswerChange, disabled = false, showScore = true }) {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'mcq':
      case 'image':
        return (
          <ChoiceList
            options={question.options}
            selected={answer}
            onChange={onAnswerChange}
            type="mcq"
            disabled={disabled}
          />
        );
      case 'multi':
        return (
          <ChoiceList
            options={question.options}
            selected={answer}
            onChange={onAnswerChange}
            type="multi"
            disabled={disabled}
          />
        );
      case 'essay':
        return (
          <EssayInput
            value={answer || ''}
            onChange={onAnswerChange}
            minWords={question.minWords || 0}
            maxWords={question.maxWords || 1000}
            placeholder="Write your detailed answer here..."
          />
        );
      default:
        return <p className="text-red-600 dark:text-red-400">Unsupported question type</p>;
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <h3 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white">
          {question.prompt}
        </h3>
        {showScore && (
          <span className="px-3 py-1 ml-4 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
            {question.maxScore} points
          </span>
        )}
      </div>

      {question.image && (
        <ImageViewer
          src={question.image}
          alt={`Question ${question.id} image`}
          caption={question.imageCaption}
        />
      )}

      <div className="mt-4">
        {renderQuestionInput()}
      </div>

      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Component for question navigator
function QuestionNavigator({ questions = [], answers = {}, markedForReview = new Set(), currentIndex = 0, onQuestionClick, compact = false }) {
  const getQuestionStatus = (question, index) => {
    const questionId = question.id;
    const hasAnswer = answers[questionId] !== undefined && answers[questionId] !== null && answers[questionId] !== '';
    const isMarked = markedForReview.has(questionId);
    const isCurrent = index === currentIndex;

    if (isCurrent) return 'current';
    if (isMarked) return 'marked';
    if (hasAnswer) return 'answered';
    return 'unanswered';
  };

  const getStatusClasses = (status) => {
    const baseClasses = 'w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer hover:shadow-md';
    switch (status) {
      case 'current': return `${baseClasses} bg-blue-500 border-blue-500 text-white`;
      case 'answered': return `${baseClasses} bg-green-500 border-green-500 text-white`;
      case 'marked': return `${baseClasses} bg-yellow-500 border-yellow-500 text-white`;
      case 'unanswered': return `${baseClasses} bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300`;
      default: return baseClasses;
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, index);
          return (
            <button
              key={question.id}
              onClick={() => onQuestionClick(index)}
              className={getStatusClasses(status)}
              aria-label={`Question ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Question Navigator</h3>
      <div className="grid grid-cols-5 gap-3">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, index);
          return (
            <button
              key={question.id}
              onClick={() => onQuestionClick(index)}
              className={getStatusClasses(status)}
              aria-label={`Question ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <div>Total Questions: {questions.length}</div>
          <div>Answered: {Object.keys(answers).length}</div>
          <div>Marked: {markedForReview.size}</div>
        </div>
      </div>
    </div>
  );
}

// Component for top bar
function TopBar({ currentQuestion = 0, totalQuestions = 0, timeRemaining = null, totalScore = 0, maxScore = 0, onSubmit, onMarkForReview, isMarked = false, canSubmit = false }) {
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  const timeColor = timeRemaining !== null && timeRemaining < 300 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white';

  return (
    <div className="px-6 py-10 bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Question <span className="font-semibold text-gray-900 dark:text-white">{currentQuestion + 1}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalQuestions}</span>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
              <div className="h-2 transition-all duration-300 bg-blue-500 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center lg:justify-start">
          <div className={`text-2xl font-mono font-bold ${timeColor}`}>
            {formatTime(timeRemaining)}
          </div>
          {timeRemaining !== null && timeRemaining < 300 && (
            <span className="ml-2 text-sm text-red-600 dark:text-red-400 animate-pulse">Time running out!</span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Score: <span className="font-semibold text-gray-900 dark:text-white">{totalScore}/{maxScore}</span>
          </div>
          <button onClick={onMarkForReview} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isMarked ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
            {isMarked ? 'Marked' : 'Mark for Review'}
          </button>
          <button onClick={onSubmit} disabled={!canSubmit} className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${canSubmit ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2' : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'}`}>
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}

// Main TestYourself component
export default function TestYourself() {
  return (
    <ExamProvider>
      <TestYourselfContent />
    </ExamProvider>
  );
}

// Inner component that uses the context
function TestYourselfContent() {
  const { state, dispatch, actions } = useExam();
  const { phase, questions, currentQuestionIndex, answers, markedForReview, timeRemaining, results, submitted, startTime } = state;

  // Load questions on mount
  useEffect(() => {
    if (questions.length === 0) {
      dispatch({ type: actions.LOAD_QUESTIONS, payload: sampleQuestions });
    }
  }, [questions.length, dispatch, actions]);

  // Timer countdown
  useEffect(() => {
    if (phase === 'exam' && timeRemaining > 0) {
      const timer = setInterval(() => {
        dispatch({ type: actions.TICK_TIMER });
      }, 1000);
      return () => clearInterval(timer);
    } else if (phase === 'exam' && timeRemaining === 0) {
      handleSubmit();
    }
  }, [phase, timeRemaining, dispatch, actions]);

  const handleStartExam = () => {
    dispatch({ type: actions.START_EXAM });
  };

  const handleAnswerChange = (answer) => {
    dispatch({ type: actions.ANSWER_QUESTION, payload: { questionId: questions[currentQuestionIndex].id, answer } });
  };

  const handleMarkForReview = () => {
    const isMarked = markedForReview.has(questions[currentQuestionIndex].id);
    dispatch({ type: actions.MARK_FOR_REVIEW, payload: { questionId: questions[currentQuestionIndex].id, marked: !isMarked } });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      dispatch({ type: actions.NEXT_QUESTION });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      dispatch({ type: actions.PREVIOUS_QUESTION });
    }
  };

  const handleJumpToQuestion = (index) => {
    dispatch({ type: actions.JUMP_TO_QUESTION, payload: index });
  };

  const handleSubmit = () => {
    const results = calculateResults(state);
    dispatch({ type: actions.SUBMIT_EXAM, payload: results });
  };

  const handleRetakeExam = () => {
    dispatch({ type: actions.RESET_EXAM });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrevious();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, questions.length]);

  // Render different phases
  if (phase === 'instructions') {
    return <ExamInstructions questions={questions} onStartExam={handleStartExam} />;
  }

  if (phase === 'exam') {
    return <ExamPage
      questions={questions}
      currentQuestionIndex={currentQuestionIndex}
      answers={answers}
      markedForReview={markedForReview}
      timeRemaining={timeRemaining}
      results={results}
      submitted={submitted}
      onAnswerChange={handleAnswerChange}
      onMarkForReview={handleMarkForReview}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onJumpToQuestion={handleJumpToQuestion}
      onSubmit={handleSubmit}
    />;
  }

  if (phase === 'results') {
    return <ExamResults
      questions={questions}
      answers={answers}
      results={results}
      startTime={startTime}
      onRetakeExam={handleRetakeExam}
    />;
  }

  return <div className="flex items-center justify-center min-h-screen text-gray-700 dark:text-gray-300">Loading...</div>;
}

// Exam Instructions Component
function ExamInstructions({ questions, onStartExam }) {
  const totalQuestions = questions.length;
  const totalMarks = questions.reduce((sum, q) => sum + q.maxScore, 0);
  const mcqCount = questions.filter(q => q.type === 'mcq').length;
  const multiCount = questions.filter(q => q.type === 'multi').length;
  const essayCount = questions.filter(q => q.type === 'essay').length;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-10 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Medical Self-Assessment Exam</h1>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">Test your knowledge and skills</p>
        </div>
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">Exam Details</h3>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <div>Total Questions: <span className="font-medium">{totalQuestions}</span></div>
                <div>Total Marks: <span className="font-medium">{totalMarks}</span></div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <h3 className="mb-2 font-semibold text-green-900 dark:text-green-100">Question Types</h3>
              <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                {mcqCount > 0 && <div>Multiple Choice: <span className="font-medium">{mcqCount}</span></div>}
                {multiCount > 0 && <div>Multi-Select: <span className="font-medium">{multiCount}</span></div>}
                {essayCount > 0 && <div>Essay: <span className="font-medium">{essayCount}</span></div>}
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Instructions</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-medium text-white bg-blue-500 rounded-full">1</span>
                <p>Read each question carefully and select the best answer for multiple choice questions.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-medium text-white bg-blue-500 rounded-full">2</span>
                <p>For multi-select questions, select all correct options.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-medium text-white bg-blue-500 rounded-full">3</span>
                <p>Essay questions will be manually graded after submission.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-medium text-white bg-blue-500 rounded-full">4</span>
                <p>Use the question navigator to jump between questions.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 border-t border-gray-200 rounded-b-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <button onClick={onStartExam} className="px-8 py-3 font-semibold text-white transition-colors duration-200 bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              I Understand - Start Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Exam Page Component
function ExamPage({ questions, currentQuestionIndex, answers, markedForReview, timeRemaining, results, submitted, onAnswerChange, onMarkForReview, onNext, onPrevious, onJumpToQuestion, onSubmit }) {
  const currentQuestion = questions[currentQuestionIndex];
  const totalScore = results ? results.totalScore : 0;
  const maxScore = results ? results.maxPossibleScore : questions.reduce((sum, q) => sum + q.maxScore, 0);

  if (!currentQuestion) {
    return <div className="flex items-center justify-center min-h-screen text-gray-700 dark:text-gray-300">Loading questions...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopBar
        currentQuestion={currentQuestionIndex}
        totalQuestions={questions.length}
        timeRemaining={timeRemaining}
        totalScore={totalScore}
        maxScore={maxScore}
        onSubmit={onSubmit}
        onMarkForReview={onMarkForReview}
        isMarked={markedForReview.has(currentQuestion.id)}
        canSubmit={questions.length > 0 && !submitted}
      />
      <main className="flex flex-col flex-1 w-full gap-4 p-4 mx-auto lg:flex-row max-w-7xl">
        <aside className="hidden lg:block lg:w-64">
          <QuestionNavigator
            questions={questions}
            answers={answers}
            markedForReview={markedForReview}
            currentIndex={currentQuestionIndex}
            onQuestionClick={onJumpToQuestion}
          />
        </aside>
        <section className="flex-1">
          <QuestionCard
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={onAnswerChange}
            disabled={submitted}
            showScore={!submitted}
          />
          <div className="flex justify-between mt-6">
            <button onClick={onPrevious} disabled={currentQuestionIndex === 0} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${currentQuestionIndex === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}>
              Previous
            </button>
            <button onClick={onNext} disabled={currentQuestionIndex === questions.length - 1} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${currentQuestionIndex === questions.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}>
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

// Exam Results Component
function ExamResults({ questions, results, startTime, onRetakeExam }) {
  if (!results) {
    return <div className="flex items-center justify-center min-h-screen text-gray-700 dark:text-gray-300">Loading results...</div>;
  }

  const { totalScore, maxPossibleScore, gradedQuestions, percentage } = results;
  const endTime = Date.now();
  const timeTaken = Math.floor((endTime - startTime) / 1000);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPerformanceCategory = (percentage) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' };
    if (percentage >= 80) return { label: 'Very Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' };
    if (percentage >= 70) return { label: 'Good', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    if (percentage >= 60) return { label: 'Satisfactory', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20' };
    return { label: 'Needs Improvement', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' };
  };

  const performance = getPerformanceCategory(percentage);

  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl px-4 mx-auto">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Exam Results</h1>
          <p className="text-gray-600 dark:text-gray-400">Your performance summary and detailed breakdown</p>
        </div>
        <div className="p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">{totalScore}/{maxPossibleScore}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">{percentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Percentage</div>
            </div>
            <div className="text-center">
              <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${performance.bg} ${performance.color} mb-2`}>{performance.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Performance</div>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">Time Taken: {formatTime(timeTaken)}</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Completed on {new Date(endTime).toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Question Breakdown</h2>
          <div className="space-y-4">
            {gradedQuestions.map((gradedQuestion, index) => {
              const question = questions.find(q => q.id === gradedQuestion.id);
              if (!question) return null;
              const isCorrect = gradedQuestion.isCorrect;
              const isEssay = question.type === 'essay';
              return (
                <div key={gradedQuestion.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : isEssay ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="flex-1 font-medium text-gray-900 dark:text-white">Question {index + 1}: {question.prompt}</h3>
                    <div className="flex items-center ml-4 space-x-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${isCorrect ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : isEssay ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>
                        {isCorrect ? 'Correct' : isEssay ? 'Pending Review' : 'Incorrect'}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{gradedQuestion.score}/{question.maxScore}</span>
                    </div>
                  </div>
                  {!isCorrect && !isEssay && (
                    <div className="mt-2 text-sm">
                      <div className="text-gray-700 dark:text-gray-300">
                        <strong>Your answer:</strong> {Array.isArray(gradedQuestion.userAnswer) ? gradedQuestion.userAnswer.map(idx => question.options[idx]).join(', ') : typeof gradedQuestion.userAnswer === 'number' ? question.options[gradedQuestion.userAnswer] : gradedQuestion.userAnswer || 'Not answered'}
                      </div>
                      <div className="mt-1 text-gray-700 dark:text-gray-300">
                        <strong>Correct answer:</strong> {Array.isArray(gradedQuestion.correctAnswer) ? gradedQuestion.correctAnswer.map(idx => question.options[idx]).join(', ') : question.options[gradedQuestion.correctAnswer]}
                      </div>
                    </div>
                  )}
                  {isEssay && gradedQuestion.userAnswer && (
                    <div className="mt-2 text-sm">
                      <div className="text-gray-700 dark:text-gray-300">
                        <strong>Your answer:</strong>
                        <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded dark:bg-gray-700 dark:text-white">
                          {gradedQuestion.userAnswer}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-center">
          <button onClick={onRetakeExam} className="px-6 py-3 font-semibold text-white transition-colors duration-200 bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Retake Exam
          </button>
        </div>
      </div>
    </div>
  );
}
