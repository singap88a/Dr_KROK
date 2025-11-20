import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { FaArrowLeft, FaTrophy, FaRedo, FaCheckCircle, FaClipboardList, FaCertificate, FaSync } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";
import jsPDF from "jspdf";

export default function FinalTestResults() {
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
  const certificateImage = "/certificate.jpeg";
  const hasUploadedRef = useRef(false);

  // تحديد نوع الكورس من المسار
  const isLiveCourse = location.pathname.includes('/live-courses');
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

  // Calculate percentage early using useMemo
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

  // Calculate results based on scope - MUST be before early returns
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
    } finally {
      setSavingResult(false);
    }
  };

  // دالة لإنشاء PDF الشهادة
  const generateCertificatePDF = useCallback(() => {
    return new Promise((resolve, reject) => {
      try {
        const pdf = new jsPDF("landscape", "mm", "a4");
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = certificateImage;

        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL("image/jpeg");

            const pdfWidth = 297;
            const pdfHeight = 210;
            const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
            const scaledWidth = img.width * ratio;
            const scaledHeight = img.height * ratio;

            pdf.addImage(
              imgData,
              "JPEG",
              (pdfWidth - scaledWidth) / 2,
              (pdfHeight - scaledHeight) / 2,
              scaledWidth,
              scaledHeight
            );

            const certDate = new Date().toLocaleDateString();
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(26);
            pdf.text(userName, 148, 115, { align: "center" });

            pdf.setFontSize(18);
            pdf.text(course?.title || t("courses.courseTitle", "Course Title"), 148, 130, { align: "center" });

            pdf.setFontSize(16);
            pdf.text(`${t("courses.scoreLabel", "Score")}: ${Math.round(calculatedPercentage)}%`, 148, 142, { align: "center" });

            pdf.setFontSize(14);
            pdf.text(`${t("courses.dateLabel", "Date")}: ${certDate}`, 40, 190);
            pdf.text(t("courses.signatureLabel", "Signature: Dr. KROK Academy"), 240, 190, { align: "right" });

            const pdfBlob = pdf.output("blob");
            resolve(pdfBlob);
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load certificate image"));
        };
      } catch (err) {
        reject(err);
      }
    });
  }, [course, calculatedPercentage, userName, t]);

  // رفع الشهادة تلقائياً عند score >= 65
  useEffect(() => {
    const autoUploadCertificate = async () => {
      // التحقق من الشروط
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

        // إنشاء PDF الشهادة
        const pdfBlob = await generateCertificatePDF();

        // إنشاء FormData
        const formData = new FormData();
        formData.append("course_id", id.toString());
        formData.append("type", isLiveCourse ? "live" : "video");
        formData.append("certificate", pdfBlob, "certificate.pdf");

        // رفع الشهادة للسيرفر
        await uploadCertificate(token, formData);
        setCertificateUploaded(true);
        console.log("✅ Certificate uploaded successfully to server");
        
      } catch (error) {
        console.error("❌ Failed to upload certificate:", error);
        hasUploadedRef.current = false; // إعادة المحاولة في المرة القادمة
      } finally {
        setUploadingCertificate(false);
      }
    };

    autoUploadCertificate();
  }, [course, actualScope, calculatedPercentage, id, uploadCertificate, getAuthToken, userName, t, generateCertificatePDF, isLiveCourse, userData]);

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

  // تعديل دالة عرض الشهادة
  const handleViewCertificate = async () => {
    if (actualScope === 'final' && passed) {
      // الانتقال لصفحة الشهادة
      navigate(`${basePath}/${id}/certificate`);
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
              {/* Certificate Upload Status */}
              {actualScope === 'final' && passed && (
                <div className="mt-4">
                  {uploadingCertificate && (
                    <div className="flex items-center justify-center gap-2 p-3 text-blue-600 bg-blue-100 rounded-lg">
                      <FaSync className="animate-spin" />
                      <span>{t("courses.uploadingCertificate", "Uploading certificate to server...")}</span>
                    </div>
                  )}
                  {certificateUploaded && !uploadingCertificate && (
                    <div className="flex items-center justify-center gap-2 p-3 text-green-600 bg-green-100 rounded-lg">
                      <FaCheckCircle />
                      <span>{t("courses.certificateUploaded", "Certificate uploaded successfully!")}</span>
                    </div>
                  )}
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