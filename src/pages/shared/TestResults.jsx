import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { FaArrowLeft, FaTrophy, FaRedo, FaCheckCircle, FaClipboardList, FaCertificate, FaSync, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { 
  formatProfessionalDate, 
  calculateGrade, 
  extractColorFromImage, 
  generateProfessionalCertificatePDF 
} from "../../utils/certificateUtils";

export default function TestResults() {
  const { id, scope } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById, getLiveCourseById, saveFinalTestResult, uploadCertificate, getAuthToken } = useApi();
  const { userData } = useUser();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingResult, setSavingResult] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [certificateUploaded, setCertificateUploaded] = useState(false);
  const [studentNameColor, setStudentNameColor] = useState("#c2a10d");
  const [grade, setGrade] = useState("");
  
  const certificateImage = "/certificate_1.jpg";
  const hasUploadedRef = useRef(false);

  const isLiveCourse = location.pathname.includes('/live-courses');
  const basePath = isLiveCourse ? '/live-courses' : '/courses';
  const backPath = `${basePath}/${id}/lessons`;

  const passedState = location.state || {};
  const results = passedState.results || null;
  const test = passedState.test || null;
  const lessonId = passedState.lessonId || null;
  const sectionId = passedState.sectionId || null;
  
  const actualScope = scope || (location.pathname.includes('/final-results') ? 'final' : null);
  const [showReview, setShowReview] = useState(false);

  const quizResults = useMemo(() => {
    if (!results) return null;
    return results.questions || results.answers?.questions || null;
  }, [results]);

  const reviewedQuestions = useMemo(() => {
    if (!quizResults || !test?.quizzes) return [];
    return quizResults.map(res => {
      const quiz = test.quizzes.find(q => q.id === res.question_id);
      return {
        ...quiz,
        studentAnswer: res.student_answer,
        correctAnswer: res.correct_answer,
        isCorrect: res.is_correct
      };
    }).filter(q => q.title);
  }, [quizResults, test]);
  const userName = userData?.name || t("courses.student", "Student");

  const calculatedPercentage = useMemo(() => {
    if (!results) return 0;
    
    switch (actualScope) {
      case 'lesson':
        const lessonTotal = results.total_questions || test?.quizzes?.length || 0;
        return lessonTotal > 0 ? (results.student_score / results.total_score) * 100 : 0;
      
      case 'section':
        const sectionTotal = results.total_questions || test?.quizzes?.length || 0;
        return sectionTotal > 0 ? (results.student_score / results.total_score) * 100 : 0;
      
      case 'final':
      default:
        return results.percentage || 0;
    }
  }, [results, test, actualScope]);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const courseData = isLiveCourse 
          ? await getLiveCourseById(id, true)
          : await getVideoCourseById(id, true);
        setCourse(courseData);

        const extractedColor = extractColorFromImage();
        setStudentNameColor(extractedColor);

        const mockPercentage = calculatedPercentage;
        setGrade(calculateGrade(mockPercentage));

      } catch (err) {
        setError(err?.message || t("courses.failedToLoadCourse", "Failed to load course"));
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id, isLiveCourse, getLiveCourseById, getVideoCourseById, t, calculatedPercentage]);

  const { totalQuestions, correctAnswers, wrongAnswers, percentage, passed, title, subtitle } = useMemo(() => {
    let total = 0;
    let correct = 0;
    let wrong = 0;
    let percent = calculatedPercentage;
    let isPassed = percent >= 65;
    let resultTitle = "";
    let resultSubtitle = "";

    if (!results) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        percentage: 0,
        passed: false,
        title: "",
        subtitle: ""
      };
    }

    switch (actualScope) {
      case 'lesson':
        total = results?.total_questions || test?.quizzes?.length || 0;
        correct = results?.questions?.filter(q => q.is_correct).length || 0;
        wrong = total - correct;
        percent = total > 0 ? (results?.student_score / results?.total_score) * 100 : 0;
        isPassed = percent >= 65;
        resultTitle = t("courses.lessonTestResults", "Lesson Test Results");
        resultSubtitle = t("courses.lessonTest", "Lesson Test");
        break;

      case 'section':
        total = results?.total_questions || test?.quizzes?.length || 0;
        correct = results?.questions?.filter(q => q.is_correct).length || 0;
        wrong = total - correct;
        percent = total > 0 ? (results?.student_score / results?.total_score) * 100 : 0;
        isPassed = percent >= 65;
        resultTitle = t("courses.sectionTestResults", "Section Test Results");
        resultSubtitle = t("courses.sectionTest", "Section Test");
        break;

      case 'final': {
        total = test?.quizzes?.length || 0;
        percent = results?.percentage || 0;
        correct = Math.round((percent / 100) * total);
        wrong = total - correct;
        isPassed = percent >= 65;
        resultTitle = t("courses.finalTestResults", "Final Test Results");
        resultSubtitle = t("courses.finalTest", "Final Test");
        break;
      }

      default:
        total = test?.quizzes?.length || 0;
        percent = results?.percentage || 0;
        correct = Math.round((percent / 100) * total);
        wrong = total - correct;
        isPassed = percent >= 65;
        resultTitle = t("courses.finalTestResults", "Final Test Results");
        resultSubtitle = t("courses.finalTest", "Final Test");
        break;
    }

    return {
      totalQuestions: total,
      correctAnswers: correct,
      wrongAnswers: wrong,
      percentage: percent,
      passed: isPassed,
      title: resultTitle,
      subtitle: resultSubtitle
    };
  }, [actualScope, results, test, calculatedPercentage, t]);

  const saveResultToServer = async (percentage, passed) => {
    if (!saveFinalTestResult) return;
    
    try {
      setSavingResult(true);
      const testData = {
        score: percentage,
        percentage: percentage,
        passed: passed,
        grade: grade,
        student_name_color: studentNameColor
      };
      
      await saveFinalTestResult(id, testData);
      console.log('✅ Final test result saved to server');
    } catch (error) {
      console.error('❌ Failed to save final test result:', error);
    } finally {
      setSavingResult(false);
    }
  };

  // دالة محسنة لإنشاء PDF الشهادة المحترف
  const generateCertificate = useCallback(() => {
    return generateProfessionalCertificatePDF({
      course,
      userName,
      percentage: calculatedPercentage,
      grade,
      studentNameColor,
      certificateImage,
      t
    });
  }, [course, calculatedPercentage, userName, t, grade, studentNameColor]);

  useEffect(() => {
    const autoUploadCertificate = async () => {
      if (
        !course ||
        actualScope !== 'final' ||
        calculatedPercentage < 65 ||
        hasUploadedRef.current ||
        uploadingCertificate
      ) {
        return;
      }

      const token = getAuthToken();
      if (!token) {
        console.warn("No token available for certificate upload");
        return;
      }

      try {
        setUploadingCertificate(true);
        hasUploadedRef.current = true;

        await saveResultToServer(calculatedPercentage, true);

        const pdfBlob = await generateCertificate();

        const formData = new FormData();
        formData.append("course_id", id.toString());
        formData.append("type", isLiveCourse ? "live" : "video");
        formData.append("certificate", pdfBlob, "certificate.pdf");
        formData.append("student_name_color", studentNameColor);
        formData.append("grade", grade);
        formData.append("percentage", calculatedPercentage.toString());

        await uploadCertificate(token, formData);
        setCertificateUploaded(true);
        console.log("✅ Professional certificate uploaded successfully to server");
        
      } catch (error) {
        console.error("❌ Failed to upload certificate:", error);
        hasUploadedRef.current = false;
      } finally {
        setUploadingCertificate(false);
      }
    };

    autoUploadCertificate();
  }, [course, actualScope, calculatedPercentage, id, uploadCertificate, getAuthToken, userName, t, generateCertificate, isLiveCourse, userData, grade, studentNameColor]);

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

  let itemName = "";
  if (actualScope === 'lesson' && lessonId) {
    const lesson = course.lessons?.find(l => l.id === parseInt(lessonId)) ||
                   course.sections?.flatMap(s => s.lessons || []).find(l => l.id === parseInt(lessonId));
    itemName = lesson?.title || "";
  } else if (actualScope === 'section' && sectionId) {
    const section = course.sections?.find(s => s.id === parseInt(sectionId));
    itemName = section?.title || "";
  }



  return (
    <section className="min-h-screen py-10 bg-gradient-to-br from-primary/5 to-secondary/5 text-text">
      <div className="max-w-4xl px-4 mx-auto">
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

            <div className="mb-8">
              <div className="mb-2 text-6xl font-bold text-secondary">{Math.round(percentage)}%</div>
              <div className="text-xl text-text-muted">
                {actualScope === 'final' 
                  ? (passed ? t("courses.passed", "Passed") : t("courses.failed", "Failed"))
                  : `${t("courses.score", "Score")}: ${results.student_score || 0}/${results.total_score || 0}`
                }
              </div>
              
              {actualScope === 'final' && (
                <div className="mt-2 text-lg font-semibold" style={{ color: studentNameColor }}>
                  Grade: {grade}
                </div>
              )}

              {actualScope !== 'final' && (
                <div className="text-xl text-text-muted">
                  {passed ? t("courses.passed", "Passed") : t("courses.failed", "Failed")}
                </div>
              )}
              
              {actualScope === 'final' && passed && (
                <div className="mt-4">
                  {uploadingCertificate && (
                    <div className="flex items-center justify-center gap-2 p-3 text-blue-600 bg-blue-100 rounded-lg">
                      <FaSync className="animate-spin" />
                      <span>{t("courses.uploadingCertificate", "Uploading professional certificate to server...")}</span>
                    </div>
                  )}
                  {certificateUploaded && !uploadingCertificate && (
                    <div className="flex items-center justify-center gap-2 p-3 text-green-600 bg-green-100 rounded-lg">
                      <FaCheckCircle />
                      <span>{t("courses.certificateUploaded", "Professional certificate uploaded successfully!")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
              <div className="p-4 border rounded-lg bg-accent border-border">
                <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
                <div className="text-sm text-text-muted">{t("courses.totalQuestions", "Total Questions")}</div>
              </div>
              <div className="p-4 border rounded-lg bg-accent border-border">
                <div className="text-2xl font-bold text-green-600">
                  {correctAnswers}
                </div>
                <div className="text-sm text-text-muted">
                  {t("courses.correctAnswers", "Correct Answers")}
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-accent border-border">
                <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
                <div className="text-sm text-text-muted">
                  {t("courses.wrongAnswers", "Wrong Answers")}
                </div>
              </div>
            </div>

            {/* {actualScope === 'final' && (
              <div className="p-4 mb-6 text-center bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Certificate Preview:</strong> 
                  <span style={{ color: studentNameColor, marginLeft: '8px' }}>
                    Student Name Color: {studentNameColor}
                  </span>
                  <span style={{ marginLeft: '16px', color: '#2c5aa0' }}>
                    Grade: {grade}
                  </span>
                  <span style={{ marginLeft: '16px', color: '#444' }}>
                    Date Format: {formatProfessionalDate()}
                  </span>
                </p>
              </div>
            )} */}

            <div className="mb-6">
              {passed ? (
                <div className="text-center">
                  {actualScope === 'final' ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <FaCheckCircle className="text-2xl" />
                      <span className="text-xl font-bold">
                        {t("courses.finalTestPassed", "Congratulations! You have passed the final test.")}
                      </span>
                    </div>
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
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-lg text-red-600">
                    {actualScope === 'final'
                      ? t("courses.finalTestNotPassed", "You did not pass the final test.")
                      : t("courses.retakeRequired", "You need to retake the test to pass.")}
                  </p>
                </div>
              )}
            </div>

            {/* Buttons Row */}
            <div className="flex flex-wrap gap-4 justify-center items-center">
              {/* Back to Lessons / Action Button */}
              <button
                onClick={() => navigate(backPath)}
                className={`flex items-center justify-center gap-2 px-8 py-3.5 font-semibold text-white transition-all rounded-lg shadow-lg hover:shadow-xl ${
                  !passed ? "bg-primary hover:bg-secondary" : "bg-primary hover:bg-primary/90"
                }`}
              >
                {actualScope === 'final' ? <FaClipboardList /> : (passed ? <FaClipboardList /> : <FaRedo />)}
                {actualScope !== 'final' && passed
                  ? t("courses.continueToNext", "Continue")
                  : t("courses.backToLessons", "Back to Lessons")}
              </button>

              {/* Review Questions Button */}
              {reviewedQuestions && reviewedQuestions.length > 0 && (
                <button
                  onClick={() => setShowReview(true)}
                  className="flex items-center gap-2 px-8 py-3.5 font-semibold text-white bg-secondary hover:bg-secondary/90 transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl"
                >
                  <FaClipboardList />
                  {t("courses.reviewQuestions", "Review Questions")}
                </button>
              )}
            </div>

            {showReview && reviewedQuestions.length > 0 && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden text-left animate-slideUp">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border bg-accent">
                    <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                      <FaClipboardList />
                      {t("courses.detailedReview", "Detailed Question Review")}
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
                      const isMcq = q.type === "mcq" || !q.type;
                      
                      if (isMcq) {
                        const answerKeys = [];
                        let i = 1;
                        while (q[`answer_${i}`] || q[`answer_${i}_image`]) {
                          answerKeys.push(`answer_${i}`);
                          i++;
                        }
                        const correctAnswerKey = `answer_${parseInt(q.correct_answer_index) + 1}`;
                        const studentAnswerKey = q.studentAnswer;

                        return (
                          <div key={q.id} className="p-6 border rounded-xl bg-accent border-border shadow-sm">
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
                                  badge = <span className="ml-auto text-green-600 font-semibold text-sm flex items-center gap-1"><FaCheckCircle /> {t("courses.correct", "Correct")}</span>;
                                } else if (isStudentSelected) {
                                  optionStyle = "border-red-500 bg-red-50 dark:bg-red-950/20";
                                  badge = <span className="ml-auto text-red-600 font-semibold text-sm flex items-center gap-1"><FaExclamationTriangle /> {t("courses.yourAnswer", "Your Answer")}</span>;
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
                        // For match or connect questions
                        const isCorrect = q.isCorrect;
                        return (
                          <div key={q.id} className="p-6 border rounded-xl bg-accent border-border shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                              <span className="font-bold text-lg text-primary">{qIdx + 1}.</span>
                              <div
                                className="font-semibold text-text"
                                dangerouslySetInnerHTML={{ __html: q.title || "" }}
                              />
                            </div>
                            <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-text-muted">{t("courses.yourAnswer", "Your Answer")}:</span>
                                <span className={isCorrect ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                  {q.studentAnswer || t("courses.noAnswer", "No Answer")}
                                </span>
                              </div>
                              {!isCorrect && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-text-muted">{t("courses.correctAnswer", "Correct Answer")}:</span>
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
                      {t("common.close", "Close")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}