import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaChartBar } from "react-icons/fa";

export default function CourseTestRunner() {
  const { id, scope, testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById, getLiveCourseById, completeLessonProgress, completeLiveLessonProgress, addStudentTest, checkStudentTest } =
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
      if (!test) return;
      
      try {
        setCheckingPreviousTest(true);
        console.log('🔍 Checking for previous test...');
        
        const checkData = {
          test_id: parseInt(testId)
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
  }, [test, id, scope, lessonId, checkStudentTest, location.pathname]);

  const handleDragStart = (e, questionId, answerKey) => {
    setDragItem({ questionId, answerKey });
    e.dataTransfer.setData("text/plain", `${questionId}-${answerKey}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, questionId, textKey) => {
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

  const [loading, setLoading] = useState(!test);
  const [error, setError] = useState("");

  // Load course and discover test if not provided
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (test) return;
      try {
        setLoading(true);
        const isLiveCourse = location.pathname.includes('live-courses');
        const data = await (isLiveCourse ? getLiveCourseById(id, true) : getVideoCourseById(id, true));
        if (!mounted) return;
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
          // find inside lessons
          let foundLessonId = null;
          let foundTest = null;
          for (const l of data.lessons || []) {
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
    const question = (test?.quizzes || [])[idx];
    if (!question) return null;
    
    if (question.type === 'connect') {
      return prepareConnectQuestion(question);
    }
    
    return question;
  }, [test, idx]);

  // ✅ تعديل finish علشان ينادي الدالة الجديدة
  const finish = async () => {
    const quizzes = test?.quizzes || [];
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
        for (let n = 1; n <= 4; n++) {
          if (
            answers[`${q.id}_${n}`] &&
            answers[`${q.id}_${n}`] === q[`match_${n}`]
          )
            correct++;
        }
        isCorrect = correct === 4;
        studentAnswer = Object.keys(answers)
          .filter((k) => k.startsWith(`${q.id}_`))
          .map((k) => answers[k])
          .join(", ");
        correctAnswer = [1, 2, 3, 4].map(n => q[`match_${n}`]).join(", ");
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
        const correctAnswerKey = ["answer_1", "answer_2", "answer_3", "answer_4"][q.correct_answer_index];
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

    setResults({ total, earned, percentage, questions });

    setTimeout(() => {
      const basePath = isLiveCourse ? '/live-courses' : '/courses';
      if (scope === "final") {
        navigate(`/courses/${id}/final-results`, {
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
    }, 1000);
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

  // دالة لإزالة التوصيل في أسئلة التوصيل
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
    const result = previousTestResult.test_result;
    const percentage = result.total_score > 0 ? (parseFloat(result.score) / parseFloat(result.total_score)) * 100 : 0;
    const passed = result.passed === 1;
    
    return (
      <section className="min-h-screen px-4 py-8 bg-background text-text">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-primary hover:text-secondary"
            >
              <FaArrowLeft /> {t("common.back", "Back")}
            </button>
          </div>

          <div className="overflow-hidden border shadow rounded-2xl bg-surface border-border">
            <div className="p-6 text-white bg-primary">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <h1 className="text-2xl font-bold">
                  {test?.name || t("courses.test", "Test")}
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-white/20">
                  <FaExclamationTriangle className="text-yellow-300" />
                  <span>{t("courses.previouslyTaken", "Previously Taken")}</span>
                </div>
              </div>
            </div>

            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className={`p-4 rounded-full ${passed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {passed ? <FaCheckCircle size={48} /> : <FaExclamationTriangle size={48} />}
                </div>
              </div>

              <h2 className="mb-4 text-2xl font-bold text-text">
                {passed 
                  ? t("courses.testPassedBefore", "You have passed this test before") 
                  : t("courses.testTakenBefore", "You have taken this test before")}
              </h2>

              <p className="mb-8 text-text-muted">
                {previousTestResult.message || t("courses.cannotRetakeTest", "You cannot retake this test.")}
              </p>

              {/* Results Card */}
              <div className="max-w-md mx-auto mb-8 overflow-hidden border rounded-lg shadow-sm bg-gradient-to-br from-surface to-accent border-border">
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <FaChartBar className="mr-2 text-primary" />
                    <h3 className="text-lg font-semibold text-text">
                      {t("courses.yourPreviousScore", "Your Previous Score")}
                    </h3>
                  </div>

                  {/* Percentage Circle */}
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={passed ? "#10B981" : "#F59E0B"}
                          strokeWidth="3"
                          strokeDasharray={`${percentage}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-yellow-600'}`}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Details */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-3 bg-white rounded-lg dark:bg-gray-800">
                      <div className="text-sm text-text-muted">{t("courses.yourScore", "Your Score")}</div>
                      <div className="text-lg font-bold text-text">{result.score}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg dark:bg-gray-800">
                      <div className="text-sm text-text-muted">{t("courses.totalScore", "Total Score")}</div>
                      <div className="text-lg font-bold text-text">{result.total_score}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg dark:bg-gray-800">
                      <div className="text-sm text-text-muted">{t("courses.totalQuestions", "Total Questions")}</div>
                      <div className="text-lg font-bold text-text">{result.total_questions}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg dark:bg-gray-800">
                      <div className="text-sm text-text-muted">{t("courses.status", "Status")}</div>
                      <div className={`text-lg font-bold ${passed ? 'text-green-600' : 'text-yellow-600'}`}>
                        {passed ? t("courses.passed", "Passed") : t("courses.failed", "Failed")}
                      </div>
                    </div>
                  </div>

                  {/* Test Date */}
                  <div className="p-3 mt-4 bg-white rounded-lg dark:bg-gray-800">
                    <div className="text-sm text-text-muted">{t("courses.testDate", "Test Date")}</div>
                    <div className="font-medium text-text">
                      {new Date(result.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
                >
                  {t("common.goBack", "Go Back")}
                </button>
                <button
                  onClick={() => navigate(`/courses/${id}/lessons`)}
                  className="px-6 py-3 transition-colors border rounded-lg border-primary text-primary hover:bg-primary hover:text-white"
                >
                  {t("courses.returnToLessons", "Return to Lessons")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
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
          <div className="p-6 text-white bg-primary">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <h1 className="text-2xl font-bold">
                {test.name || t("courses.test", "Test")}
              </h1>
              <div className="flex items-center gap-3 text-sm">
                <span>
                  {t("courses.question", "Question")} {idx + 1}{" "}
                  {t("courses.of", "of")} {test.quizzes?.length || 0}
                </span>
              </div>
            </div>
            <div className="w-full h-2 mt-4 rounded-full bg-white/30">
              <div
                className="h-2 bg-white rounded-full"
                style={{
                  width: `${((idx + 1) / (test.quizzes?.length || 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="p-6">
            <div
              className="p-4 mb-4 border rounded bg-accent border-border"
              dangerouslySetInnerHTML={{ __html: currentQuestion?.title || "" }}
            />

            {/* Body */}
            {currentQuestion?.type === "match" ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  {["answer_1", "answer_2", "answer_3", "answer_4"].map(
                    (key, index) => {
                      const text = currentQuestion[key];
                      const img = currentQuestion[`${key}_image`];
                      if (!text && !img) return null;
                      const selected = answers[currentQuestion.id] === key;
                      return (
                        <div
                          key={key}
                          className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            selected
                              ? "border-primary bg-blue-50 dark:bg-blue-900/20 shadow-md transform scale-105"
                              : "border-border hover:border-primary hover:bg-accent hover:shadow-sm"
                          }`}
                          onClick={() =>
                            setAnswers((s) => ({
                              ...s,
                              [currentQuestion.id]: key,
                            }))
                          }
                        >
                          <div className="flex items-start">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-1 flex-shrink-0 ${
                                selected
                                  ? "border-primary bg-primary"
                                  : "border-text-muted"
                              }`}
                            >
                              {selected && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              {/* رقم الإجابة */}
                              <div className="mb-1 font-semibold text-primary">
                                {index + 1}.
                              </div>
                              {/* نص أو صورة الإجابة */}
                              {text && (
                                <div className="font-medium text-text">
                                  {text}
                                </div>
                              )}
                              {img && (
                                <img
                                  src={img}
                                  alt={`Answer ${index + 1}`}
                                  className="mx-auto mt-3 rounded-lg shadow-sm max-h-48"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((n) => {
                    const targetKey = `target_${n}`;
                    const current = answers[`${currentQuestion.id}_${n}`];
                    return (
                      <div
                        key={targetKey}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragItem) {
                            setAnswers((s) => ({
                              ...s,
                              [`${currentQuestion.id}_${n}`]: dragItem,
                            }));
                            setDragItem(null);
                          }
                        }}
                        className={`p-3 border-2 rounded min-h-[64px] flex items-center justify-between ${
                          current
                            ? "border-secondary bg-secondary/10"
                            : "border-dashed border-border bg-surface"
                        }`}
                      >
                        <span className="text-sm text-text-muted">
                          {currentQuestion[targetKey] ||
                            t("courses.dropHere", "Drop here")}
                        </span>
                        {current && (
                          <span className="px-2 py-1 text-xs text-white rounded bg-secondary">
                            {current.replace("answer_", "A")}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : currentQuestion?.type === "connect" ? (
              // Connect Questions: Drag images to matching texts (مع الخلط العشوائي)
              <div className="space-y-6">
                <div className="max-w-5xl p-4 mx-auto border shadow-md bg-gradient-to-br from-surface to-accent border-border rounded-2xl">
                  <h3 className="mb-4 text-lg font-bold text-center text-text">
                    {t(
                      "testYourself.test.connectInstruction",
                      "Match each image with its correct text by dragging."
                    )}
                  </h3>

                  {/* Layout: Texts (Left) + Images (Right) */}
                  <div className="grid items-start justify-center grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Left Column — Text Cards */}
                    <div className="space-y-3">
                      <h4 className="pb-1 text-sm font-semibold border-b text-primary border-primary/40">
                        {t("testYourself.test.texts", "Texts")}
                      </h4>

                      {currentQuestion.shuffledTexts ? (
                        currentQuestion.shuffledTexts.map(({ key, text }) => {
                          const isDropped =
                            answers[currentQuestion.id] &&
                            answers[currentQuestion.id][key];
                          
                          return (
                            <div
                              key={key}
                              className="relative flex flex-col justify-between w-full max-w-[220px] mx-auto bg-white dark:bg-gray-900 border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]"
                            >
                              {/* Text Content */}
                              <div className="flex flex-col items-center justify-center p-3 text-center">
                                <p className="text-text text-[15px] leading-snug font-bold">
                                  {text}
                                </p>
                              </div>

                              {/* Drop Zone */}
                              <div
                                className={`p-2 border-t rounded-b-lg transition-all duration-300 flex items-center justify-center min-h-[60px]
                                ${
                                  isDropped
                                    ? "border-green-400 bg-green-50 dark:bg-green-900/30 shadow-inner"
                                    : "border-dashed border-border bg-surface hover:border-primary hover:bg-accent"
                                }`}
                                onDragOver={handleDragOver}
                                onDrop={(e) =>
                                  handleDrop(e, currentQuestion.id, key)
                                }
                              >
                                {isDropped ? (
                                  <div className="relative flex items-center justify-center w-full h-full group">
                                    <img
                                      src={
                                        currentQuestion[`${isDropped}_image`]
                                      }
                                      alt="Dropped image"
                                      className="object-cover w-full h-20 transition-transform duration-300 rounded-md cursor-pointer group-hover:scale-105"
                                      onClick={() => removeConnection(currentQuestion.id, key)}
                                    />
                                    <button
                                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-md hover:bg-red-600"
                                      onClick={() => removeConnection(currentQuestion.id, key)}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center text-text-muted">
                                    <svg
                                      className="w-4 h-4 mx-auto mb-1 opacity-40"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                      />
                                    </svg>
                                    <p className="text-[11px] font-medium">
                                      {t(
                                        "testYourself.test.dropHere",
                                        "Drop image here"
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-text-muted">No texts available</p>
                      )}
                    </div>

                    {/* Right Column — Image Cards */}
                    <div className="space-y-3">
                      <h4 className="pb-1 text-sm font-semibold border-b text-primary border-primary/40">
                        {t("testYourself.test.images", "Images")}
                      </h4>

                      {currentQuestion.shuffledImages ? (
                        currentQuestion.shuffledImages.map(({ key, image }) => {
                          const isUsed =
                            answers[currentQuestion.id] &&
                            Object.values(answers[currentQuestion.id]).includes(
                              key
                            );

                          return (
                            <div
                              key={key}
                              draggable={!isUsed}
                              onDragStart={(e) =>
                                handleDragStart(
                                  e,
                                  currentQuestion.id,
                                  key
                                )
                              }
                              className={`w-full max-w-[220px] mx-auto bg-white dark:bg-gray-900 border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]
                              ${
                                isUsed
                                  ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                                  : "border-dashed border-border cursor-grab hover:border-primary active:cursor-grabbing"
                              }`}
                            >
                              <div className="w-full h-[100px] rounded-lg overflow-hidden">
                                <img
                                  src={image}
                                  alt="Draggable image"
                                  className="object-cover w-full h-full rounded-lg"
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-text-muted">No images available</p>
                      )}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-text">
                      <span className="text-sm font-medium">
                        {t('testYourself.test.connectedPairs', 'Connected pairs:')} {Object.keys(answers[currentQuestion.id] || {}).length} / {currentQuestion.totalPairs || 0}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-text-muted">
                      {t('testYourself.test.minimumPairs', 'Minimum pairs to connect:')} {minimumAnswersRequired}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {["answer_1", "answer_2", "answer_3", "answer_4"].map((key) => {
                  const text = currentQuestion[key];
                  const img = currentQuestion[`${key}_image`];
                  if (!text && !img) return null;
                  const selected = answers[currentQuestion.id] === key;
                  return (
                    <div
                      key={key}
                      className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selected
                          ? "border-primary bg-blue-50 dark:bg-blue-900/20 shadow-md transform scale-105"
                          : "border-border hover:border-primary hover:bg-accent hover:shadow-sm"
                      }`}
                      onClick={() =>
                        setAnswers((s) => ({ ...s, [currentQuestion.id]: key }))
                      }
                    >
                      <div className="flex items-start">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-1 flex-shrink-0 ${
                            selected
                              ? "border-primary bg-primary"
                              : "border-text-muted"
                          }`}
                        >
                          {selected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          {text && (
                            <div className="font-medium text-text">{text}</div>
                          )}
                          {img && (
                            <img
                              src={img}
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
              {idx === (test.quizzes?.length || 1) - 1 ? (
                <button
                  onClick={finish}
                  disabled={currentQuestion?.type === "connect" && 
                    Object.keys(answers[currentQuestion.id] || {}).length < minimumAnswersRequired}
                  className={`px-4 py-2 text-white rounded ${
                    currentQuestion?.type === "connect" && 
                    Object.keys(answers[currentQuestion.id] || {}).length < minimumAnswersRequired
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-secondary"
                  }`}
                >
                  {t("courses.finishTest", "Finish Test")}
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
    </section>
  );
}