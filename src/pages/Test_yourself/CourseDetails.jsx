import React from 'react';
import he from 'he';
import { useTranslation } from 'react-i18next';

const CourseDetails = ({ selectedCourse, onBack, onTestSelect }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen px-4 py-8 transition-colors duration-300 bg-background">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={onBack}
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
              
              {/* عرض بيانات المدرب فقط للكورسات الفيديو */}
              {selectedCourse.type === 'video' && selectedCourse.instructor && (
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
              )}
              
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

                    {/* عرض الوصف بنفس طريقة سياسة الخصوصية */}
                    <div
                      className="mb-3 prose-sm prose text-text-secondary max-w-none"
                      dangerouslySetInnerHTML={{ __html: he.decode(test.description || '') }}
                    />

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
                    onClick={() => onTestSelect(test)}
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
};

export default CourseDetails;
