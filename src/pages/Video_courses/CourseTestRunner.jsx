import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaChartBar, FaHandPointer, FaArrowsAlt, FaTimes, FaAward } from "react-icons/fa";

import PreviousTestResult from "./CourseTestRunner/PreviousTestResult";
import TestHeader from "./CourseTestRunner/TestHeader";
import MatchQuestion from "./CourseTestRunner/MatchQuestion";
import ConnectQuestion from "./CourseTestRunner/ConnectQuestion";
import MultipleChoiceQuestion from "./CourseTestRunner/MultipleChoiceQuestion";

export default function CourseTestRunner() {
  const { id, scope, testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById, getLiveCourseById, completeLessonProgress, completeLiveLessonProgress, addStudentTest, checkStudentTest, invalidateCache } =
    useApi();

  const passedState = location.state || {};
  const [test, setTest] = useState(passedState.test || null);
  const [lessonId, setLessonId] = useState(passedState.lessonId || null);
  const [sectionId, setSectionId] = useState(passedState.sectionId || null);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [previousTestResult, setPreviousTestResult] = useState(null);
  const [checkingPreviousTest, setCheckingPreviousTest] = useState(true);
  const [activeQuizzes, setActiveQuizzes] = useState([]);
  const [isRetaking, setIsRetaking] = useState(false);
  const [hasLoadedFresh, setHasLoadedFresh] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // اكتشاف إذا كان الجهاز موبايل
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // دالة لخلط العناصر عشوائياً
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // دالة للحصول على الأسئلة العشوائية للمحاولة بناءً على الحد الأقصى
  const getAttemptQuizzes = (allQuizzes, limitStr) => {
    console.log("getAttemptQuizzes: total available quizzes =", allQuizzes?.length, "limitStr config =", limitStr);
    if (!allQuizzes || allQuizzes.length === 0) return [];
    const limit = limitStr ? parseInt(limitStr, 10) : null;
    
    // خلط كل الأسئلة
    const shuffled = [...allQuizzes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    if (limit && limit > 0 && limit < shuffled.length) {
      console.log(`getAttemptQuizzes: Slicing quizzes to limit: ${limit}`);
      return shuffled.slice(0, limit);
    }
    console.log("getAttemptQuizzes: Returning all quizzes without slicing");
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

  // دالة لتحضير أسئلة التوصل بشكل عشوائي
  const prepareConnectQuestion = (question) => {
    if (question.type !== 'connect') return question;

    const pairs = extractAnswerPairs(question);
    if (pairs.length === 0) return question;

    // إنشاء shuffledTexts و shuffledImages بشكل منفصل ومستقل
    const shuffledTexts = shuffleArray(pairs.map(pair => ({
      key: pair.key,
      text: pair.text
    })));

    const shuffledImages = shuffleArray(pairs.map(pair => ({
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

  // التحقق من الاختبار السابق
  useEffect(() => {
    const checkPreviousTest = async () => {
      if (!test || isRetaking) return;
      
      try {
        setCheckingPreviousTest(true);
        console.log('🔍 Checking for previous test...');
        
        const isLiveCourse = location.pathname.includes('live-courses');
        const checkData = {
          test_id: parseInt(testId),
          course_id: parseInt(id),
          type: isLiveCourse ? "live" : "video"
        };

        console.log('📤 Sending check data:', checkData);

        const response = await checkStudentTest(checkData);
        console.log('📥 Received check response:', response);

        if (response.has_previous_test) {
          setPreviousTestResult(response);
        }
      } catch (error) {
        console.error('❌ Error checking previous test:', error);
        // في حالة الخطأ، نعتبر أنه لا يوجد اختبار سابق ونسمح بالمتابعة
      } finally {
        setCheckingPreviousTest(false);
      }
    };

    if (test) {
      checkPreviousTest();
    }
  }, [test, id, scope, lessonId, checkStudentTest, location.pathname, isRetaking]);

  // تهيئة الأسئلة العشوائية للمحاولة الحالية بعد تحميل البيانات الجديدة
  useEffect(() => {
    if (hasLoadedFresh && test && test.quizzes) {
      console.log("Initializing activeQuizzes with fresh data. Total quizzes:", test.quizzes.length, "limit:", test.number_student_questions);
      const selected = getAttemptQuizzes(test.quizzes, test.number_student_questions);
      setActiveQuizzes(selected);
    }
  }, [test, hasLoadedFresh]);

  // دالة لبدء محاولة جديدة
  const startNewAttempt = () => {
    setIsRetaking(true);
    setPreviousTestResult(null);
    setIdx(0);
    setAnswers({});
    setResults(null);
    if (test && test.quizzes) {
      const selected = getAttemptQuizzes(test.quizzes, test.number_student_questions);
      setActiveQuizzes(selected);
    }
  };

  // Touch Handlers للموبايل
  const handleTouchStart = (e, questionId, answerKey) => {
    if (!isMobile) return;
    
    e.preventDefault();
    setSelectedImage({
      questionId,
      answerKey,
      image: e.currentTarget.querySelector('img')?.src,
      element: e.currentTarget
    });
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !selectedImage) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e, questionId, textKey) => {
    if (!isMobile || !selectedImage) return;
    
    e.preventDefault();
    
    if (selectedImage.questionId === questionId) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [textKey]: selectedImage.answerKey,
        },
      }));
    }
    
    setSelectedImage(null);
    setActiveDropZone(null);
  };

  const handleTouchEnter = (questionId, textKey) => {
    if (!isMobile || !selectedImage) return;
    setActiveDropZone({ questionId, textKey });
  };

  const handleTouchLeave = () => {
    if (!isMobile || !selectedImage) return;
    setActiveDropZone(null);
  };

  // Drag Handlers للديسكتوب
  const handleDragStart = (e, questionId, answerKey) => {
    if (isMobile) return;
    
    setDragItem({ questionId, answerKey });
    e.dataTransfer.setData("text/plain", `${questionId}-${answerKey}`);
  };

  const handleDragOver = (e) => {
    if (isMobile) return;
    e.preventDefault();
  };

  const handleDrop = (e, questionId, textKey) => {
    if (isMobile) return;
    
    e.preventDefault();
    if (dragItem && dragItem.questionId === questionId) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [textKey]: dragItem.answerKey,
        },
      }));
    }
    setDragItem(null);
  };

  // دالة لإزالة التوصيل
  const removeConnection = (questionId, textKey) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      if (newAnswers[questionId]) {
        delete newAnswers[questionId][textKey];
        if (Object.keys(newAnswers[questionId]).length === 0) {
          delete newAnswers[questionId];
        }
      }
      return newAnswers;
    });
  };

  // دالة لعرض الصورة في مودال
  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowImageModal(true);
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load course and discover test if not provided
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (hasLoadedFresh) return;
      try {
        setLoading(true);
        const isLiveCourse = location.pathname.includes('live-courses');
        // إبطال التخزين المؤقت للحصول على البيانات الجديدة فوراً من الباك إند
        invalidateCache([`video_course/${id}`, `live_course/${id}`]);
        const data = await (isLiveCourse ? getLiveCourseById(id, true) : getVideoCourseById(id, true));
        if (!mounted) return;
        setHasLoadedFresh(true);
        if (scope === "final") {
          const found = (data.final_tests || []).find(
            (t) => String(t.id) === String(testId)
          );
          setTest(found || null);
        } else if (scope === "section") {
          // find inside sections
          let foundSectionId = null;
          let foundTest = null;
          for (const section of data.sections || []) {
            const arr = section.section_tests || [];
            const hit = arr.find((t) => String(t.id) === String(testId));
            if (hit) {
              foundSectionId = section.id;
              foundTest = hit;
              break;
            }
          }
          setSectionId(foundSectionId);
          setTest(foundTest);
        } else {
          // find inside lessons of all sections
          let foundLessonId = null;
          let foundTest = null;
          const allLessons = [...(data.lessons || [])];
          if (data.sections) {
            for (const section of data.sections) {
              if (section.lessons) {
                allLessons.push(...section.lessons);
              }
            }
          }
          for (const l of allLessons) {
            const arr = l.lesson_end_tests || [];
            const hit = arr.find((t) => String(t.id) === String(testId));
            if (hit) {
              foundLessonId = l.id;
              foundTest = hit;
              break;
            }
          }
          setLessonId(foundLessonId);
          setTest(foundTest);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load test");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id, scope, testId, test, getVideoCourseById, getLiveCourseById]);

  // تحضير السؤال الحالي مع الخلط العشوائي لأسئلة التوصيل
  const currentQuestion = useMemo(() => {
    const question = (activeQuizzes || [])[idx];
    if (!question) return null;
    
    if (question.type === 'connect') {
      return prepareConnectQuestion(question);
    }
    
    return question;
  }, [activeQuizzes, idx]);

  // ✅ تعديل finish علشان ينادي الدالة الجديدة
  const finish = async () => {
    setIsSubmitting(true);
    const quizzes = activeQuizzes || [];
    const total = quizzes.reduce(
      (acc, q) => acc + parseInt(q.question_score || 1),
      0
    );
    let earned = 0;
    const questions = [];

    for (const q of quizzes) {
      let isCorrect = false;
      let studentAnswer = "";
      let correctAnswer = "";

      if (q.type === "match") {
        let correct = 0;
        let matchCount = 0;
        let n = 1;
        while (q[`match_${n}`]) {
          matchCount++;
          if (
            answers[`${q.id}_${n}`] &&
            answers[`${q.id}_${n}`] === q[`match_${n}`]
          )
            correct++;
          n++;
        }
        isCorrect = correct === matchCount && matchCount > 0;
        studentAnswer = Object.keys(answers)
          .filter((k) => k.startsWith(`${q.id}_`))
          .map((k) => answers[k])
          .join(", ");
        
        const matchCorrectList = [];
        for (let i = 1; i <= matchCount; i++) {
          matchCorrectList.push(q[`match_${i}`]);
        }
        correctAnswer = matchCorrectList.join(", ");
      } else if (q.type === "connect") {
        const userAnswer = answers[q.id];
        const pairs = extractAnswerPairs(q);
        const totalPairs = pairs.length;

        let correctConnections = 0;
        if (userAnswer) {
          Object.keys(userAnswer).forEach(textKey => {
            if (userAnswer[textKey] === textKey) {
              correctConnections++;
            }
          });
        }

        isCorrect = correctConnections === totalPairs && totalPairs > 0;
        const questionScore = parseInt(q.question_score || 1);
        earned += (correctConnections / totalPairs) * questionScore;

        studentAnswer = userAnswer
          ? Object.entries(userAnswer)
              .map(([k, v]) => `${k}:${v}`)
              .join(", ")
          : "";

        correctAnswer = pairs.map(pair => `${pair.key}:${pair.key}`).join(", ");
      } else {
        studentAnswer = answers[q.id] || "";
        const correctAnswerKey = `answer_${parseInt(q.correct_answer_index) + 1}`;
        isCorrect = answers[q.id] === correctAnswerKey;
        correctAnswer = q[correctAnswerKey] || "";

        if (isCorrect) earned += parseInt(q.question_score || 1);
      }

      questions.push({
        question_id: q.id,
        student_answer: studentAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
      });
    }

    const percentage = total > 0 ? (earned / total) * 100 : 0;
    const isLiveCourse = location.pathname.includes('live-courses');
    const courseType = isLiveCourse ? "live" : "video";

    const testData = {
      test_id: parseInt(test.id),
      course_id: parseInt(id),
      lesson_id: lessonId ? parseInt(lessonId) : null,
      type: courseType,
      student_score: parseFloat(earned.toFixed(2)),
      total_score: parseFloat(total.toFixed(2)),
      result_status: 1,
      total_questions: parseInt(quizzes.length),
      questions: questions
    };

    console.log('📤 Prepared test data for API:', testData);

    try {
      console.log('🚀 Sending test data to API...');
      const apiResponse = await addStudentTest(testData);
      console.log('✅ Test submitted successfully:', apiResponse);
    } catch (error) {
      console.error("❌ Failed to submit test results:", error);
    }

    const resultsData = {
      total_score: total,
      student_score: earned,
      total_questions: quizzes.length,
      questions: questions,
      percentage: percentage
    };

    if (scope === "lesson" && lessonId) {
      try {
        console.log('🎯 Marking lesson as completed...');
        if (isLiveCourse) {
          await completeLiveLessonProgress(id, lessonId, "quiz");
        } else {
          await completeLessonProgress(id, lessonId, "quiz");
        }
        console.log('✅ Lesson marked as completed');
      } catch (error) {
        console.error("❌ Failed to complete lesson progress:", error);
      }
    }

    const basePath = isLiveCourse ? '/live-courses' : '/courses';
    if (scope === "final") {
      navigate(`${basePath}/${id}/final-results`, {
        replace: true,
        state: { results: { total, earned, percentage, answers: resultsData }, test },
      });
    } else if (scope === "lesson") {
      navigate(`${basePath}/${id}/test-results/lesson/${testId}`, {
        replace: true,
        state: { results: resultsData, test, lessonId },
      });
    } else if (scope === "section") {
      navigate(`${basePath}/${id}/test-results/section/${testId}`, {
        replace: true,
        state: { results: resultsData, test, sectionId },
      });
    }
  };

  const markDoneAndBack = async () => {
    if (scope === "lesson" && lessonId) {
      try {
        const isLiveCourse = location.pathname.includes('live-courses');
        if (isLiveCourse) {
          await completeLiveLessonProgress(id, lessonId, "quiz");
        } else {
          await completeLessonProgress(id, lessonId, "quiz");
        }
      } catch (e) {
        console.warn("Failed to complete lesson progress:", e);
      }
    }

    // Navigate back based on test scope
    if (scope === "section") {
      navigate(`/courses/${id}/lessons`, {
        replace: true,
        state: { sectionTestCompleted: true, sectionId },
      });
    } else {
      navigate(`/courses/${id}/lessons`, {
        replace: true,
        state: { lessonCompleted: true, lessonId },
      });
    }
  };

  // الحصول على الحد الأدنى للإجابات المطلوبة لأسئلة التوصيل
  const getMinimumAnswersRequired = () => {
    if (currentQuestion?.type !== 'connect') return 1;
    
    const pairs = extractAnswerPairs(currentQuestion);
    return Math.min(2, pairs.length);
  };

  const minimumAnswersRequired = getMinimumAnswersRequired();

  // إذا كان يتحقق من الاختبار السابق
  if (checkingPreviousTest) {
    return (
      <section className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-t-2 border-b-2 rounded-full animate-spin border-primary" />
          <p className="text-text">{t("courses.checkingPreviousTest", "Checking previous test results...")}</p>
        </div>
      </section>
    );
  }

  // إذا كان هناك اختبار سابق، عرض النتيجة
  if (previousTestResult) {
    return (
      <PreviousTestResult
        test={test}
        previousTestResult={previousTestResult}
        navigate={navigate}
        t={t}
        location={location}
        id={id}
        scope={scope}
        onRetake={startNewAttempt}
      />
    );
  }

  if (loading) {
    return (
      <section className="min-h-[50vh] flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary" />
      </section>
    );
  }
  if (error || !test) {
    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-text">
        <div className="text-red-600">
          {t("common.error", "Error")}:{" "}
          {error || t("courses.testNotFound", "Test not found")}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-white rounded bg-primary"
        >
          {t("common.back", "Back")}
        </button>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-4 py-8 bg-background text-text">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-primary hover:text-secondary"
          >
            <FaArrowLeft /> {t("common.back", "Back")}
          </button>
        </div>

        <div className="overflow-hidden border shadow rounded-2xl bg-surface border-border">
          <TestHeader test={test} idx={idx} t={t} totalQuestions={activeQuizzes?.length} />

          <div className="p-6">
            <div
              className="p-4 mb-4 border rounded bg-accent border-border"
              dangerouslySetInnerHTML={{ __html: currentQuestion?.title || "" }}
            />

            {/* Body */}
            {currentQuestion?.type === "match" ? (
              <MatchQuestion
                currentQuestion={currentQuestion}
                answers={answers}
                setAnswers={setAnswers}
                dragItem={dragItem}
                setDragItem={setDragItem}
                t={t}
              />
            ) : currentQuestion?.type === "connect" ? (
              <ConnectQuestion
                currentQuestion={currentQuestion}
                answers={answers}
                setAnswers={setAnswers}
                isMobile={isMobile}
                t={t}
                activeDropZone={activeDropZone}
                selectedImage={selectedImage}
                handleTouchStart={handleTouchStart}
                handleTouchMove={handleTouchMove}
                handleTouchEnd={handleTouchEnd}
                handleTouchEnter={handleTouchEnter}
                handleTouchLeave={handleTouchLeave}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                removeConnection={removeConnection}
                openImageModal={openImageModal}
                minimumAnswersRequired={minimumAnswersRequired}
              />
            ) : (
              <MultipleChoiceQuestion
                currentQuestion={currentQuestion}
                answers={answers}
                setAnswers={setAnswers}
              />
            )}

            <div className="flex items-center justify-between mt-8">
              <button
                disabled={idx === 0}
                onClick={() => setIdx((v) => Math.max(0, v - 1))}
                className={`px-4 py-2 rounded border ${
                  idx === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "border-border hover:border-primary"
                }`}
              >
                {t("courses.prev", "Previous")}
              </button>
              {idx === (activeQuizzes?.length || 1) - 1 ? (
                <button
                  onClick={finish}
                  disabled={isSubmitting || (currentQuestion?.type === "connect" && 
                    Object.keys(answers[currentQuestion.id] || {}).length < minimumAnswersRequired)}
                  className={`px-4 py-2 text-white rounded ${
                    isSubmitting || (currentQuestion?.type === "connect" && 
                    Object.keys(answers[currentQuestion.id] || {}).length < minimumAnswersRequired)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-secondary"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t("common.loading", "Loading...")}</span>
                    </div>
                  ) : (
                    t("courses.finishTest", "Finish Test")
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setIdx((v) => v + 1)}
                  disabled={currentQuestion?.type === "connect" && 
                    Object.keys(answers[currentQuestion.id] || {}).length < minimumAnswersRequired}
                  className={`px-4 py-2 text-white rounded ${
                    currentQuestion?.type === "connect" && 
                    Object.keys(answers[currentQuestion.id] || {}).length < minimumAnswersRequired
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-secondary"
                  }`}
                >
                  {t("courses.next", "Next")}
                </button>
              )}
            </div>

            {results && (
              <div className="p-4 mt-6 border rounded bg-accent border-border">
                <div className="mb-1 text-text">
                  {t("courses.score", "Score")}:{" "}
                  {Math.round(results.percentage)}%
                </div>
                <div className="flex gap-2 mt-3">
                  {(scope === "lesson" || scope === "section") && (
                    <button
                      onClick={markDoneAndBack}
                      className="px-4 py-2 text-white rounded bg-secondary hover:opacity-90"
                    >
                      {scope === "lesson"
                        ? t("courses.markLessonDone", "Mark lesson as done")
                        : t("courses.markSectionDone", "Mark section as done")}
                    </button>
                  )}
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 border rounded border-border hover:border-primary"
                  >
                    {t("common.close", "Close")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal for Mobile */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-lg mx-4">
            <button
              className="absolute top-0 right-0 z-10 p-2 text-white translate-x-2 -translate-y-2 bg-red-500 rounded-full hover:bg-red-600"
              onClick={() => setShowImageModal(false)}
            >
              <FaTimes />
            </button>
            <img
              src={modalImage}
              alt="Enlarged view"
              className="rounded-lg max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </section>
  );
}