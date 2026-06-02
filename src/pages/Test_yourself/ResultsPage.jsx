import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaClipboardList, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const ResultsPage = ({ results, selectedTest, selectedCourse, onReset }) => {
  const { t } = useTranslation();
  const [showReview, setShowReview] = useState(false);

  const reviewedQuestions = useMemo(() => {
    try {
      const localDataStr = localStorage.getItem(`test_yourself_review_${selectedTest.id}`);
      const reviewData = localDataStr ? JSON.parse(localDataStr) : null;
      if (!reviewData || !reviewData.test || !reviewData.test.quizzes) return [];
      
      return reviewData.test.quizzes.map(q => {
        const isMcq = q.type === 'mcq' || !q.type;
        const studentAnswer = reviewData.answers[q.id];
        
        let isCorrect = false;
        let studentAnswerText = '';
        let correctAnswerText = '';

        if (isMcq) {
          const correctAnswerKey = `answer_${parseInt(q.correct_answer_index) + 1}`;
          isCorrect = studentAnswer === correctAnswerKey;
          studentAnswerText = studentAnswer; // e.g. answer_1
        } else {
          // connect
          const pairs = [];
          let index = 1;
          while (q[`answer_${index}`] || q[`answer_${index}_image`]) {
            const text = q[`answer_${index}`];
            const image = q[`answer_${index}_image`];
            if (text && image) {
              pairs.push({ key: `answer_${index}`, text });
            }
            index++;
          }
          
          const totalPairs = pairs.length;
          let correctConnections = 0;
          if (studentAnswer) {
            Object.keys(studentAnswer).forEach(textKey => {
              if (studentAnswer[textKey] === textKey) {
                correctConnections++;
              }
            });
          }
          isCorrect = correctConnections === totalPairs && totalPairs > 0;
          
          studentAnswerText = studentAnswer
            ? Object.entries(studentAnswer)
                .map(([k, v]) => `${q[k] || k} -> ${q[`${v}_image`] ? t('testYourself.results.image', 'Image') : v}`)
                .join(", ")
            : t("courses.noAnswer", "No Answer");
            
          correctAnswerText = pairs.map(pair => `${pair.text} -> ${t('testYourself.results.correctImage', 'Correct Image')}`).join(", ");
        }

        return {
          ...q,
          studentAnswer: studentAnswerText,
          correctAnswer: correctAnswerText,
          isCorrect,
          rawStudentAnswer: studentAnswer
        };
      });
    } catch (e) {
      console.error("Failed to parse review data:", e);
      return [];
    }
  }, [selectedTest, t]);

  return (
    <div className="min-h-screen px-4 py-8 transition-colors duration-300 bg-background text-text">
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
                    <span className="font-semibold text-secondary">{results.earnedScore.toFixed(1)}</span>
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
            
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                onClick={onReset}
                className="px-8 py-3 font-medium text-white transition-all duration-300 transform shadow-lg bg-primary hover:bg-blue-700 rounded-xl hover:scale-105"
              >
                {t('testYourself.results.back', 'Back to Courses')}
              </button>
              
              {reviewedQuestions.length > 0 && (
                <button
                  onClick={() => setShowReview(true)}
                  className="px-8 py-3 font-medium text-white transition-all duration-300 transform shadow-lg bg-secondary hover:bg-secondary/90 rounded-xl hover:scale-105 flex items-center gap-2"
                >
                  <FaClipboardList />
                  {t('courses.reviewQuestions', 'Review Questions')}
                </button>
              )}

              <button
                onClick={() => {
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

      {/* Review Modal popup */}
      {showReview && reviewedQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden text-left animate-slideUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-accent">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                <FaClipboardList />
                {t('courses.detailedReview', 'Detailed Question Review')}
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
              {reviewedQuestions.map((q, qIdx) => {
                const isMcq = q.type === 'mcq' || !q.type;
                
                if (isMcq) {
                  const answerKeys = [];
                  let i = 1;
                  while (q[`answer_${i}`] || q[`answer_${i}_image`]) {
                    answerKeys.push(`answer_${i}`);
                    i++;
                  }
                  const correctAnswerKey = `answer_${parseInt(q.correct_answer_index) + 1}`;
                  const studentAnswerKey = q.rawStudentAnswer;

                  return (
                    <div key={q.id || qIdx} className="p-6 border rounded-xl bg-accent border-border shadow-sm">
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
                            badge = <span className="ml-auto text-green-600 font-semibold text-sm flex items-center gap-1"><FaCheckCircle /> {t('courses.correct', 'Correct')}</span>;
                          } else if (isStudentSelected) {
                            optionStyle = "border-red-500 bg-red-50 dark:bg-red-950/20";
                            badge = <span className="ml-auto text-red-600 font-semibold text-sm flex items-center gap-1"><FaExclamationTriangle /> {t('courses.yourAnswer', 'Your Answer')}</span>;
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
                  return (
                    <div key={q.id || qIdx} className="p-6 border rounded-xl bg-accent border-border shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="font-bold text-lg text-primary">{qIdx + 1}.</span>
                        <div
                          className="font-semibold text-text"
                          dangerouslySetInnerHTML={{ __html: q.title || "" }}
                        />
                      </div>
                      <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-muted">{t('courses.yourAnswer', 'Your Answer')}:</span>
                          <span className={q.isCorrect ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                            {q.studentAnswer}
                          </span>
                        </div>
                        {!q.isCorrect && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-text-muted">{t('courses.correctAnswer', 'Correct Answer')}:</span>
                            <span className="text-green-600 font-bold">{q.correctAnswer}</span>
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
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;