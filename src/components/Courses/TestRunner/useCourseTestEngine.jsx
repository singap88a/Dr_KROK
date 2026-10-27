import { useState, useEffect, useMemo, useRef } from "react";
import { useApi } from "../../../context/ApiContext";
import {
  getAttemptQuizzes,
  extractAnswerPairs,
  prepareConnectQuestion,
} from "./testRunnerUtils";

export function useCourseTestEngine({ id, scope, testId, location, navigate }) {
  const {
    getVideoCourseById,
    getLiveCourseById,
    completeLessonProgress,
    completeLiveLessonProgress,
    addStudentTest,
    checkStudentTest,
    invalidateCache,
  } = useApi();

  const passedState = location.state || {};
  const [test, setTest] = useState(passedState.test || null);
  const [lessonId, setLessonId] = useState(passedState.lessonId || null);
  const [sectionId, setSectionId] = useState(passedState.sectionId || null);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [previousTestResult, setPreviousTestResult] = useState(null);
  const [checkingPreviousTest, setCheckingPreviousTest] = useState(true);
  const [activeQuizzes, setActiveQuizzes] = useState([]);
  const [isRetaking, setIsRetaking] = useState(false);
  const [hasLoadedFresh, setHasLoadedFresh] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pointsPopupData, setPointsPopupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const checkedTestIdRef = useRef(null);

  // Check for previous test
  useEffect(() => {
    const checkPrevious = async () => {
      if (!test || isRetaking || checkedTestIdRef.current === testId) return;

      try {
        checkedTestIdRef.current = testId;
        setCheckingPreviousTest(true);

        const isLiveCourse = location.pathname.includes("live-courses");
        const checkData = {
          test_id: parseInt(testId),
          course_id: parseInt(id),
          type: isLiveCourse ? "live" : "video",
        };

        const response = await checkStudentTest(checkData);
        if (response.has_previous_test) {
          setPreviousTestResult(response);
        }
      } catch (err) {
        console.error("❌ Error checking previous test:", err);
      } finally {
        setCheckingPreviousTest(false);
      }
    };

    if (test) {
      checkPrevious();
    }
  }, [test, id, scope, lessonId, checkStudentTest, location.pathname, isRetaking]);

  // Initialize random quizzes for current attempt
  useEffect(() => {
    if (hasLoadedFresh && test && test.quizzes) {
      const selected = getAttemptQuizzes(test.quizzes, test.number_student_questions);
      setActiveQuizzes(selected);
    }
  }, [test, hasLoadedFresh]);

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

  // Load course and discover test if not provided
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (hasLoadedFresh) return;
      try {
        setLoading(true);
        const isLiveCourse = location.pathname.includes("live-courses");
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

  // Current question memo
  const currentQuestion = useMemo(() => {
    const question = (activeQuizzes || [])[idx];
    if (!question) return null;

    if (question.type === "connect") {
      return prepareConnectQuestion(question);
    }

    return question;
  }, [activeQuizzes, idx]);

  // Finish and submit test
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
          Object.keys(userAnswer).forEach((textKey) => {
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

        correctAnswer = pairs.map((pair) => `${pair.key}:${pair.key}`).join(", ");
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
    const isLiveCourse = location.pathname.includes("live-courses");
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
      questions: questions,
    };

    let popupData = null;

    try {
      const apiResponse = await addStudentTest(testData);
      const responseData = apiResponse?.data || apiResponse;
      if (responseData?.earned_points > 0) {
        popupData = {
          points: responseData.earned_points,
          percentage: responseData.course_percentage || percentage.toFixed(2),
        };
      }
    } catch (error) {
      console.error("❌ Failed to submit test results:", error);
    }

    const resultsData = {
      total_score: total,
      student_score: earned,
      total_questions: quizzes.length,
      questions: questions,
      percentage: percentage,
    };

    if (scope === "lesson" && lessonId) {
      try {
        if (isLiveCourse) {
          await completeLiveLessonProgress(id, lessonId, "quiz");
        } else {
          await completeLessonProgress(id, lessonId, "quiz");
        }
      } catch (error) {
        console.error("❌ Failed to complete lesson progress:", error);
      }
    }

    const basePath = isLiveCourse ? "/live-courses" : "/courses";
    const doNavigation = () => {
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

    if (popupData) {
      setPointsPopupData({ ...popupData, onContinue: doNavigation });
    } else {
      doNavigation();
    }
  };

  const markDoneAndBack = async () => {
    if (scope === "lesson" && lessonId) {
      try {
        const isLiveCourse = location.pathname.includes("live-courses");
        if (isLiveCourse) {
          await completeLiveLessonProgress(id, lessonId, "quiz");
        } else {
          await completeLessonProgress(id, lessonId, "quiz");
        }
      } catch (e) {
        console.warn("Failed to complete lesson progress:", e);
      }
    }

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

  const getMinimumAnswersRequired = () => {
    if (currentQuestion?.type !== "connect") return 1;
    const pairs = extractAnswerPairs(currentQuestion);
    return Math.min(2, pairs.length);
  };

  return {
    test,
    loading,
    error,
    idx,
    setIdx,
    answers,
    setAnswers,
    results,
    activeQuizzes,
    previousTestResult,
    checkingPreviousTest,
    isSubmitting,
    pointsPopupData,
    setPointsPopupData,
    startNewAttempt,
    currentQuestion,
    finish,
    markDoneAndBack,
    minimumAnswersRequired: getMinimumAnswersRequired(),
  };
}
