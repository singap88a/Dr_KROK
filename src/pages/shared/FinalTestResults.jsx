import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { FaArrowLeft, FaTrophy, FaRedo, FaCheckCircle, FaClipboardList, FaCertificate, FaSync } from "react-icons/fa";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
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
  const userName = userData?.name || t("courses.student", "Student");

  // دالة لتهيئة التاريخ بشكل احترافي (YYYY/MM/DD)
  const formatProfessionalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Very Good";
    if (percentage >= 70) return "Good";
    if (percentage >= 65) return "Pass";
    return "Fail";
  };

  const extractColorFromImage = () => {
    return "#c2a10d";
  };

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
  }, [id, isLiveCourse, getLiveCourseById, getVideoCourseById, t]);

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
  const generateProfessionalCertificatePDF = useCallback(() => {
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
            canvas.width = 297 * 2;
            canvas.height = 210 * 2;
            
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // استخدام خطوط مشابهة للصورة المرفقة
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // اسم الطالب - حجم أصغر مع تقليل المسافة
            ctx.fillStyle = studentNameColor;
            ctx.font = "bold 32px 'Times New Roman', serif";
            ctx.fillText(userName.toUpperCase(), canvas.width / 2, 220);

            // عنوان الكورس - حجم أصغر مع تقليل المسافة
            ctx.fillStyle = "#333333";
            ctx.font = "bold 16px 'Times New Roman', serif";
            
            const courseTitle = course?.title || t("courses.courseTitle", "Course Title");
            const maxWidth = 400;
            
            if (ctx.measureText(courseTitle).width > maxWidth) {
              const words = courseTitle.split(' ');
              let line1 = '';
              let line2 = '';
              
              for (let word of words) {
                if (ctx.measureText(line1 + ' ' + word).width <= maxWidth) {
                  line1 += (line1 ? ' ' : '') + word;
                } else {
                  line2 += (line2 ? ' ' : '') + word;
                }
              }
              
              ctx.fillText(line1, canvas.width / 2, 260);
              if (line2) {
                ctx.fillText(line2, canvas.width / 2, 275);
              }
            } else {
              ctx.fillText(courseTitle, canvas.width / 2, 265);
            }

            // التقدير - إضافة التقدير مرة أخرى
            if (grade) {
              ctx.fillStyle = "#2c5aa0";
              ctx.font = "italic 18px 'Times New Roman', serif";
              ctx.fillText(`Grade: ${grade}`, canvas.width / 2, 295);
            }

            // النسبة المئوية فقط بدون كلمة Score - بنفس لون اسم الطالب
            ctx.fillStyle = studentNameColor;
            ctx.font = "bold 18px 'Times New Roman', serif";
            ctx.fillText(`${Math.round(calculatedPercentage)}%`, canvas.width / 2, 315);

            // القسم السفلي - التاريخ والتوقيع بنفس تصميم الصورة
            const professionalDate = formatProfessionalDate();
            
            // التاريخ في اليسار - تصميم مطابق للصورة مع مسافات محسنة
            ctx.textAlign = "center";
            ctx.fillStyle = "#000000";
            ctx.font = "bold 14px 'Arial', 'Helvetica', sans-serif";
            
            // التاريخ فوق الخط مع مسافة
            ctx.fillText(professionalDate, 120, 360);
            // خط تحت التاريخ
            ctx.beginPath();
            ctx.moveTo(80, 370);
            ctx.lineTo(160, 370);
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.stroke();
            // كلمة DATE تحت الخط مع مسافة
            ctx.font = "12px 'Arial', 'Helvetica', sans-serif";
            ctx.fillText("DATE", 120, 385);

            // التوقيع في اليمين - تصميم مطابق للصورة مع مسافات محسنة
            ctx.textAlign = "center";
            ctx.font = "bold 14px 'Arial', 'Helvetica', sans-serif";
            
            // اسم الدكتور فوق الخط مع مسافة
            ctx.fillText("Dr. KROK", canvas.width - 120, 360);
            // خط تحت التوقيع
            ctx.beginPath();
            ctx.moveTo(canvas.width - 160, 370);
            ctx.lineTo(canvas.width - 80, 370);
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.stroke();
            // كلمة SIGNATURE تحت الخط مع مسافة
            ctx.font = "12px 'Arial', 'Helvetica', sans-serif";
            ctx.fillText("SIGNATURE", canvas.width - 120, 385);

            const highResImage = canvas.toDataURL("image/jpeg", 1.0);
            
            pdf.addImage(
              highResImage,
              "JPEG",
              0,
              0,
              297,
              210
            );

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

        const pdfBlob = await generateProfessionalCertificatePDF();

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
  }, [course, actualScope, calculatedPercentage, id, uploadCertificate, getAuthToken, userName, t, generateProfessionalCertificatePDF, isLiveCourse, userData, grade, studentNameColor]);

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

            <div className="flex flex-col gap-4 md:flex-row md:justify-center">
              {passed ? (
                <div className="text-center">
                  {actualScope === 'final' ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <FaCheckCircle className="text-2xl" />
                        <span className="text-xl font-bold">
                          {t("courses.finalTestPassed", "Congratulations! You have passed the final test.")}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(backPath)}
                        className="flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white transition-all rounded-lg shadow-lg bg-primary hover:bg-primary/90 hover:shadow-xl"
                      >
                        <FaClipboardList />
                        {t("courses.backToLessons", "Back to Lessons")}
                      </button>
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