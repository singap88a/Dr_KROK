import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { FaArrowLeft, FaTrophy, FaRedo, FaCheckCircle, FaClipboardList, FaCertificate } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function FinalTestResults() {
  const { id, scope } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById, getLiveCourseById, saveFinalTestResult } = useApi();
  const { userData } = useUser();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingResult, setSavingResult] = useState(false);

  // تحديد نوع الكورس من المسار
  const isLiveCourse = location.pathname.includes('/live-courses');
  const courseType = isLiveCourse ? 'live' : 'video';
  const basePath = isLiveCourse ? '/live-courses' : '/courses';
  const backPath = `${basePath}/${id}/lessons`;

  const passedState = location.state || {};
  const results = passedState.results || null;
  const test = passedState.test || null;
  const lessonId = passedState.lessonId || null;
  const sectionId = passedState.sectionId || null;
  
  // إذا كان المسار final-results بدون scope، افترض أنه final
  const actualScope = scope || (location.pathname.includes('/final-results') ? 'final' : null);

  const userName = userData?.name || t("courses.student", "Student");

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const courseData = isLiveCourse 
          ? await getLiveCourseById(id, true)
          : await getVideoCourseById(id, true);
        setCourse(courseData);
      } catch (err) {
        setError(err?.message || t("courses.failedToLoadCourse", "Failed to load course"));
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id, isLiveCourse, getLiveCourseById, getVideoCourseById, t]);

  // دالة لحفظ نتيجة الاختبار في السيرفر (للفيديو كورس فقط)
  const saveResultToServer = async (percentage, passed) => {
    if (isLiveCourse || !saveFinalTestResult) return; // لا نحتاج لحفظ في السيرفر للايف كورس
    
    try {
      setSavingResult(true);
      const testData = {
        score: percentage,
        percentage: percentage,
        passed: passed
      };
      
      await saveFinalTestResult(id, testData);
      console.log('✅ Final test result saved to server');
    } catch (error) {
      console.error('❌ Failed to save final test result:', error);
      // لو فشل الحفظ في السيرفر، نرجع للطريقة القديمة كـ fallback
      const userSpecificKey = `course_${id}_certificate_${userData?.id || 'anonymous'}`;
      const certificateData = {
        score: percentage,
        date: new Date().toISOString(),
        passed: passed
      };
      localStorage.setItem(userSpecificKey, JSON.stringify(certificateData));
    } finally {
      setSavingResult(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !course || !results) {
    return (
      <section className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-center">
          <div className="mb-4 text-red-600">{error || t("common.missingData", "Missing data")}</div>
          <button
            onClick={() => navigate(backPath)}
            className="px-4 py-2 text-white rounded bg-primary"
          >
            {t("common.back", "Back")}
          </button>
        </div>
      </section>
    );
  }

  // Calculate results based on scope
  let totalQuestions = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let percentage = 0;
  let passed = false;
  let title = "";
  let subtitle = "";

  switch (actualScope) {
    case 'lesson':
      totalQuestions = results.total_questions || test?.quizzes?.length || 0;
      correctAnswers = results.questions?.filter(q => q.is_correct).length || 0;
      wrongAnswers = totalQuestions - correctAnswers;
      percentage = totalQuestions > 0 ? (results.student_score / results.total_score) * 100 : 0;
      passed = percentage >= 65;
      title = t("courses.lessonTestResults", "Lesson Test Results");
      subtitle = t("courses.lessonTest", "Lesson Test");
      break;

    case 'section':
      totalQuestions = results.total_questions || test?.quizzes?.length || 0;
      correctAnswers = results.questions?.filter(q => q.is_correct).length || 0;
      wrongAnswers = totalQuestions - correctAnswers;
      percentage = totalQuestions > 0 ? (results.student_score / results.total_score) * 100 : 0;
      passed = percentage >= 65;
      title = t("courses.sectionTestResults", "Section Test Results");
      subtitle = t("courses.sectionTest", "Section Test");
      break;

    case 'final': {
      totalQuestions = test?.quizzes?.length || 0;
      const answered = Object.keys(results.answers || {}).length;
      correctAnswers = answered;
      wrongAnswers = totalQuestions - answered;
      percentage = results.percentage || 0;
      passed = percentage >= 65;
      title = t("courses.finalTestResults", "Final Test Results");
      subtitle = t("courses.finalTest", "Final Test");
      break;
    }

    default:
      // Default to final if no scope specified
      totalQuestions = test?.quizzes?.length || 0;
      const answered = Object.keys(results.answers || {}).length;
      correctAnswers = answered;
      wrongAnswers = totalQuestions - answered;
      percentage = results.percentage || 0;
      passed = percentage >= 65;
      title = t("courses.finalTestResults", "Final Test Results");
      subtitle = t("courses.finalTest", "Final Test");
      break;
  }

  // Find the relevant item (lesson/section)
  let itemName = "";
  if (actualScope === 'lesson' && lessonId) {
    const lesson = course.lessons?.find(l => l.id === parseInt(lessonId)) ||
                   course.sections?.flatMap(s => s.lessons || []).find(l => l.id === parseInt(lessonId));
    itemName = lesson?.title || "";
  } else if (actualScope === 'section' && sectionId) {
    const section = course.sections?.find(s => s.id === parseInt(sectionId));
    itemName = section?.title || "";
  }

  const handleViewCertificate = async () => {
    if (actualScope === 'final' && passed) {
      if (isLiveCourse) {
        // Store certificate data for live courses
        const certificateData = {
          score: percentage,
          date: new Date().toISOString(),
          passed: true
        };
        localStorage.setItem(`live_course_${id}_certificate`, JSON.stringify(certificateData));
        localStorage.setItem(`live_course_${id}_certificate_score`, percentage.toString());
        navigate(`${basePath}/${id}/certificate`, {
          state: { finalTestPercentage: percentage }
        });
      } else {
        // Save to server for video courses
        await saveResultToServer(percentage, true);
        navigate(`${basePath}/${id}/certificate`, {
          state: {
            finalTestPercentage: percentage,
            userName,
            fromServer: true
          }
        });
      }
    }
  };

  return (
    <section className="min-h-screen py-10 bg-gradient-to-br from-primary/5 to-secondary/5 text-text">
      <div className="max-w-4xl px-4 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-2 text-primary hover:text-secondary"
          >
            <FaArrowLeft />
            <span>{t("courses.backToLessons", "Back to Lessons")}</span>
          </button>
          <h1 className="flex-1 text-2xl font-bold text-center">
            {title}
          </h1>
          <div className="w-10" />
        </div>

        {/* Results Card */}
        <div className="overflow-hidden border shadow-2xl rounded-2xl bg-surface border-border">
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-full dark:bg-green-800">
                  <FaClipboardList className="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <FaTrophy className="w-16 h-16 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold text-primary">{course.title}</h2>
              <p className="text-lg text-text-muted">
                {itemName || subtitle}
              </p>
              {test && (
                <p className="text-sm text-text-muted">
                  {test.name || subtitle}
                </p>
              )}
            </div>

            {/* Score */}
            <div className="mb-8">
              <div className="mb-2 text-6xl font-bold text-secondary">{Math.round(percentage)}%</div>
              <div className="text-xl text-text-muted">
                {actualScope === 'final' 
                  ? (passed ? t("courses.passed", "Passed") : t("courses.failed", "Failed"))
                  : `${t("courses.score", "Score")}: ${results.student_score || 0}/${results.total_score || 0}`
                }
              </div>
              {actualScope !== 'final' && (
                <div className="text-xl text-text-muted">
                  {passed ? t("courses.passed", "Passed") : t("courses.failed", "Failed")}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
              <div className="p-4 border rounded-lg bg-accent border-border">
                <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
                <div className="text-sm text-text-muted">{t("courses.totalQuestions", "Total Questions")}</div>
              </div>
              <div className="p-4 border rounded-lg bg-accent border-border">
                <div className="text-2xl font-bold text-green-600">
                  {actualScope === 'final' ? correctAnswers : correctAnswers}
                </div>
                <div className="text-sm text-text-muted">
                  {actualScope === 'final' 
                    ? t("courses.answered", "Answered")
                    : t("courses.correctAnswers", "Correct Answers")
                  }
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-accent border-border">
                <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
                <div className="text-sm text-text-muted">
                  {actualScope === 'final'
                    ? t("courses.unanswered", "Unanswered")
                    : t("courses.wrongAnswers", "Wrong Answers")
                  }
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-center">
              {passed ? (
                <div className="text-center">
                  {actualScope === 'final' ? (
                    <button
                      onClick={handleViewCertificate}
                      disabled={savingResult}
                      className="flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white transition-all rounded-lg shadow-lg bg-secondary hover:bg-primary hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaCertificate />
                      {savingResult ? t("common.saving", "Saving...") : t("courses.viewCertificate", "View Certificate")}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 mb-4 text-green-600">
                      <FaCheckCircle />
                      <span className="text-lg font-semibold">
                        {actualScope === 'lesson'
                          ? t("courses.lessonTestPassed", "Lesson Test Passed!")
                          : t("courses.sectionTestPassed", "Section Test Passed!")
                        }
                      </span>
                    </div>
                  )}
                  {actualScope !== 'final' && (
                    <button
                      onClick={() => navigate(backPath)}
                      className="flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white transition-all rounded-lg shadow-lg bg-primary hover:bg-primary/90 hover:shadow-xl"
                    >
                      <FaClipboardList />
                      {t("courses.continueToNext", "Continue")}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-lg text-red-600">
                    {t("courses.retakeRequired", "You need to retake the test to pass.")}
                  </p>
                  <button
                    onClick={() => navigate(backPath)}
                    className="flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white transition-all rounded-lg shadow-lg bg-primary hover:bg-secondary hover:shadow-xl"
                  >
                    <FaRedo />
                    {t("courses.backToLessons", "Back to Lessons")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
