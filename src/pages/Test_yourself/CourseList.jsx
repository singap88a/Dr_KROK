import React from 'react';
import { useTranslation } from 'react-i18next';

const CourseList = ({ 
  courses, 
  loading, 
  courseType, 
  onCourseTypeChange, 
  onCourseSelect, 
  onClearFilters 
}) => {
  const { t } = useTranslation();

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
              onClick={() => onCourseTypeChange('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                courseType === 'all' ? 'bg-primary text-white' : 'text-text hover:bg-accent'
              }`}
            >
              {t('testYourself.filters.all', 'All')}
            </button>
            <button
              onClick={() => onCourseTypeChange('video')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                courseType === 'video' ? 'bg-primary text-white' : 'text-text hover:bg-accent'
              }`}
            >
              {t('testYourself.filters.video', 'Video')}
            </button>
            <button
              onClick={() => onCourseTypeChange('live')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                courseType === 'live' ? 'bg-primary text-white' : 'text-text hover:bg-accent'
              }`}
            >
              {t('testYourself.filters.live', 'Live')}
            </button>
          </div>
        </div>
        <div className="mb-8 text-sm text-text-muted">
          {t('testYourself.filters.showing', 'Showing')} {courses.length} {t('testYourself.filters.of', 'of')} {courses.length} {t('testYourself.filters.courses', 'courses')}
        </div>
        
        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <div 
                key={course.id}
                className="overflow-hidden transition-all duration-300 transform border shadow-lg cursor-pointer bg-surface rounded-2xl hover:shadow-xl hover:-translate-y-1 group border-border"
                onClick={() => onCourseSelect(course)}
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
                  {/* عرض بيانات المدرب فقط للكورسات الفيديو */}
                  {course.type === 'video' && course.instructor && (
                    <div className="flex items-center mb-4">
                      <img 
                        className="object-cover w-10 h-10 mr-3 rounded-full shadow-sm" 
                        src={course.instructor_image} 
                        alt={course.instructor}
                      />
                      <span className="font-medium text-text-secondary">{course.instructor}</span>
                    </div>
                  )}
                  
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
        
        {courses.length === 0 && !loading && (
          <div className="py-16 text-center">
            <div className="max-w-md p-12 mx-auto border shadow-sm bg-surface rounded-2xl border-border">
              <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mb-2 text-xl font-semibold text-text">{t('testYourself.empty.title', 'No courses found')}</h3>
              <p className="text-text-muted">{t('testYourself.empty.desc', 'No courses match your current filter criteria.')}</p>
              <button 
                onClick={onClearFilters}
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

export default CourseList;