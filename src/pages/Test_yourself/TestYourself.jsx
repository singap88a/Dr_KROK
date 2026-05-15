import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import { useTranslation } from 'react-i18next';
import CourseList from './CourseList';
import CourseDetails from './CourseDetails';
import TestInterface from './TestInterface';
import ResultsPage from './ResultsPage';
import SEO from '../../components/SEO/SEO';

const TestYourself = () => {
  const { getPlacementCourses } = useApi();
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [courseType, setCourseType] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch data from APIs
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        const res = await getPlacementCourses({ type: 'all' });
        const allCourses = Array.isArray(res?.data) ? res.data : [];
        
        // تصفية البيانات - إزالة بيانات المدرب من الكورسات اللايف
        const filteredCourses = allCourses.map(course => {
          if (course.type === 'live') {
            return {
              ...course,
              instructor: '', // إزالة اسم المدرب
              instructor_image: '', // إزالة صورة المدرب
              description: course.description ? course.description.replace(/<[^>]*>/g, '') : '' // إزالة التاج من الوصف
            };
          }
          return course;
        });
        
        setCourses(filteredCourses);
        setFilteredCourses(filteredCourses);
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

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedTest(null);
    setTestStarted(false);
    setTestCompleted(false);
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setTestStarted(true);
    setTestCompleted(false);
  };

  const handleTestComplete = (results) => {
    setResults(results);
    setTestCompleted(true);
    setTestStarted(false);
  };

  const handleResetTest = () => {
    setSelectedCourse(null);
    setSelectedTest(null);
    setTestStarted(false);
    setTestCompleted(false);
    setResults(null);
  };

  const clearFilters = () => {
    setCourseType('all');
  };

  // SEO configuration
  const getSEOConfig = () => {
    if (testCompleted) {
      return {
        title: "Test Results | KROK Practice",
        description: "Review your KROK practice test results and performance analysis."
      };
    }
    if (testStarted) {
      return {
        title: `${selectedTest?.name || 'Exam Simulation'} | KROK Practice`,
        description: "Take a realistic KROK exam simulation with timing and scoring."
      };
    }
    if (selectedCourse) {
      return {
        title: `${selectedCourse.title} | KROK Exams`,
        description: `Prepare for ${selectedCourse.title} with our interactive mock exams and question database.`
      };
    }
    return {
      title: "Test Yourself | KROK Exam Simulation",
      description: "Practice with KROK questions, mock exams, and simulations for KROK 1, 2, 3, M, and B. Pass your medical university exams with confidence."
    };
  };

  const seo = getSEOConfig();

  return (
    <>
      <SEO 
        title={seo.title}
        description={seo.description}
        keywords="KROK Test, KROK Questions, KROK Practice Tests, KROK Mock Exam, KROK Simulation, Тест КРОК, Питання КРОК, Відповіді КРОК, Пробний КРОК, Симуляція КРОК, Тренажер КРОК, Тесты КРОК, Вопросы КРОК, Ответы КРОК, Пробный КРОК"
      />
      {testCompleted && results ? (
        <ResultsPage 
          results={results}
          selectedTest={selectedTest}
          selectedCourse={selectedCourse}
          onReset={handleResetTest}
        />
      ) : testStarted && selectedTest ? (
        <TestInterface 
          selectedTest={selectedTest}
          selectedCourse={selectedCourse}
          onTestComplete={handleTestComplete}
          onBack={() => setTestStarted(false)}
        />
      ) : selectedCourse ? (
        <CourseDetails 
          selectedCourse={selectedCourse}
          onBack={() => setSelectedCourse(null)}
          onTestSelect={handleTestSelect}
        />
      ) : (
        <CourseList 
          courses={filteredCourses}
          loading={loading}
          courseType={courseType}
          onCourseTypeChange={setCourseType}
          onCourseSelect={handleCourseSelect}
          onClearFilters={clearFilters}
        />
      )}
    </>
  );
};

export default TestYourself;