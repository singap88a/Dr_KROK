import React from 'react';
import { useTranslation } from 'react-i18next';

const ResultsPage = ({ results, selectedTest, selectedCourse, onReset }) => {
  const { t } = useTranslation();

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
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={onReset}
                className="px-8 py-3 font-medium text-white transition-all duration-300 transform shadow-lg bg-primary hover:bg-blue-700 rounded-xl hover:scale-105"
              >
                {t('testYourself.results.back', 'Back to Courses')}
              </button>
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
    </div>
  );
};

export default ResultsPage;