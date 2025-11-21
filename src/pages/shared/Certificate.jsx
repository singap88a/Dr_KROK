import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import { 
  FaArrowLeft, 
  FaDownload, 
  FaExclamationTriangle, 
  FaSync, 
  FaCheckCircle, 
  FaFilePdf,
  FaAward
} from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Certificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById, getLiveCourseById, getCertificateFile, getAuthToken, checkCertificateExists, getCertificateUrl } = useApi();
  const { userData } = useUser();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certificatePdfUrl, setCertificatePdfUrl] = useState(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState('checking');
  const [grade, setGrade] = useState(""); // التقدير بالانجليزية
  const [studentNameColor, setStudentNameColor] = useState("#c2a10d"); // اللون الأصفر الافتراضي

  const certificateImage = "/certificate_1.jpg";
  const canvasRef = useRef(null);

  // تحديد نوع الكورس من المسار
  const isLiveCourse = location.pathname.includes('/live-courses');
  const basePath = isLiveCourse ? '/live-courses' : '/courses';
  const backPath = `${basePath}/${id}/lessons`;
    
  const userName = userData?.name || t("courses.student", "Student");
  const certDate = new Date().toLocaleDateString();

  // دالة لتحديد التقدير بناءً على النسبة
  const calculateGrade = (percentage) => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Very Good";
    if (percentage >= 70) return "Good";
    if (percentage >= 65) return "Pass";
    return "Fail";
  };

  // استخراج اللون من الصورة (محاكاة - في الواقع سيأتي من السيرفر)
  const extractColorFromImage = () => {
    // في التطبيق الحقيقي، هذا سيكون من قاعدة البيانات
    // هنا نستخدم اللون الأصفر كما طلبت
    return "#c2a10d";
  };

  useEffect(() => {
    const loadCourseAndCheckCertificate = async () => {
      try {
        setLoading(true);
        setCertificateStatus('checking');
        
        // جلب بيانات الكورس
        const courseData = isLiveCourse
          ? await getLiveCourseById(id, true)
          : await getVideoCourseById(id, true);
        setCourse(courseData);

        // استخراج اللون من الصورة (محاكاة)
        const extractedColor = extractColorFromImage();
        setStudentNameColor(extractedColor);

        // حساب التقدير (محاكاة - في الواقع سيأتي من السيرفر)
        const mockPercentage = 85; // هذا سيأتي من بيانات الطالب
        setGrade(calculateGrade(mockPercentage));

        // التحقق من وجود الشهادة في السيرفر
        const token = getAuthToken();
        if (token) {
          try {
            const courseType = isLiveCourse ? 'live' : 'video';
            const exists = await checkCertificateExists(token, id, courseType);
            
            if (exists) {
              setCertificateEligible(true);
              setCertificateStatus('exists');
              console.log("✅ Certificate exists on server");
              
              // محاولة جلب رابط الشهادة مباشرة إذا كانت موجودة
              try {
                const certificateUrl = await getCertificateUrl(token, id, courseType);
                if (certificateUrl) {
                  setCertificatePdfUrl(certificateUrl);
                  console.log("📄 Certificate URL loaded successfully:", certificateUrl);
                }
              } catch (loadError) {
                console.warn("⚠️ Certificate exists but couldn't get URL:", loadError.message);
              }
            } else {
              setCertificateEligible(false);
              setCertificateStatus('not_found');
              console.log("❌ Certificate not found on server");
            }
          } catch (error) {
            console.log("⚠️ Error checking certificate:", error.message);
            setCertificateEligible(false);
            setCertificateStatus('error');
            
            if (error.message.includes('NETWORK_ERROR')) {
              setCertificateError(t("courses.networkError", "Network error. Please check your connection."));
            } else if (error.message.includes('CERTIFICATE_NOT_FOUND')) {
              setCertificateError(t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate."));
            } else {
              setCertificateError(t("courses.certificateCheckError", "Error checking certificate availability."));
            }
          }
        } else {
          setCertificateEligible(false);
          setCertificateStatus('not_found');
        }

      } catch (err) {
        setError(err?.message || t("courses.failedToLoadCourse", "Failed to load course"));
        setCertificateStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    loadCourseAndCheckCertificate();
  }, [id, isLiveCourse, getVideoCourseById, getLiveCourseById, checkCertificateExists, getCertificateUrl, getAuthToken, t]);

  // دالة لإنشاء PDF مع التصميم المحترف
  const generateProfessionalPDF = async () => {
    return new Promise((resolve, reject) => {
      try {
        const pdf = new jsPDF("landscape", "mm", "a4");
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = certificateImage;

        img.onload = async () => {
          try {
            // استخدام canvas لرسم الصورة والنصوص بدقة عالية
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = 297 * 2; // دقة مضاعفة للوضوح
            canvas.height = 210 * 2;
            
            // رسم خلفية بيضاء أولاً
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // رسم صورة الشهادة
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // إضافة النصوص بخطوط وألوان مختلفة
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // اسم الطالب - باللون الأصفر المميز
            ctx.fillStyle = studentNameColor;
            ctx.font = "bold 48px 'Times New Roman', serif";
            ctx.fillText(userName.toUpperCase(), canvas.width / 2, 230);

            // عنوان الكورس
            ctx.fillStyle = "#333333";
            ctx.font = "bold 28px 'Times New Roman', serif";
            ctx.fillText(course?.title || t("courses.courseTitle", "Course Title"), canvas.width / 2, 280);

            // التقدير
            if (grade) {
              ctx.fillStyle = "#2c5aa0";
              ctx.font = "italic 24px 'Times New Roman', serif";
              ctx.fillText(`Grade: ${grade}`, canvas.width / 2, 320);
            }

            // التاريخ والتوقيع
            ctx.textAlign = "left";
            ctx.fillStyle = "#000000";
            ctx.font = "18px 'Times New Roman', serif";
            ctx.fillText(`Date ${certDate}`, 80, 380);

            ctx.textAlign = "right";
            ctx.fillText("Signature _________________", canvas.width - 80, 380);
            ctx.font = "16px 'Times New Roman', serif";
            ctx.fillText("Dr. KROK  ", canvas.width - 80, 400);

            // تحويل Canvas إلى صورة وإضافتها للـ PDF
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
  };

  const downloadPDF = async () => {
    if (!certificateEligible) {
      alert(t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate."));
      return;
    }

    // إذا كانت الشهادة موجودة في السيرفر، نستخدمها مباشرة
    if (certificatePdfUrl) {
      try {
        const link = document.createElement('a');
        link.href = certificatePdfUrl;
        link.download = `${course?.title || t("courses.certificateFileName", "certificate")}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (error) {
        console.error("Error downloading PDF:", error);
      }
    }

    // Fallback: إنشاء PDF محلي محترف
    try {
      const pdfBlob = await generateProfessionalPDF();
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${course?.title || t("courses.certificateFileName", "certificate")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // تنظيف الـ URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (err) {
      console.error("PDF generation error:", err);
      alert(t("common.error", "Error") + ": " + t("courses.downloadFailed", "Failed to download certificate"));
    }
  };

  const handleShowCertificate = async () => {
    if (!id) {
      setCertificateError(t("courses.courseIdRequired", "Course ID is required"));
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setCertificateError(t("courses.tokenRequired", "Authentication token is required"));
      return;
    }

    try {
      setLoadingCertificate(true);
      setCertificateError("");
      
      const courseType = isLiveCourse ? 'live' : 'video';
      const certificateUrl = await getCertificateUrl(token, id, courseType);
      
      if (!certificateUrl) {
        throw new Error("CERTIFICATE_URL_NOT_FOUND");
      }
      
      setCertificatePdfUrl(certificateUrl);
      setCertificateEligible(true);
      setCertificateStatus('exists');
      
    } catch (error) {
      console.error("Failed to get certificate URL:", error);
      
      if (error.message === 'CERTIFICATE_NOT_FOUND') {
        setCertificateError(
          t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate.")
        );
      } else if (error.message.includes('NETWORK_ERROR')) {
        setCertificateError(
          t("courses.networkError", "Network error. Please check your connection and try again.")
        );
      } else if (error.message === 'CERTIFICATE_URL_NOT_FOUND') {
        setCertificateError(
          t("courses.certificateUrlNotFound", "Certificate URL not found. Please contact support.")
        );
      } else {
        setCertificateError(
          t("courses.certificateLoadError", "Failed to load certificate. Please try again.")
        );
      }
    } finally {
      setLoadingCertificate(false);
    }
  };

  const handleRetry = () => {
    setCertificateError("");
    setCertificatePdfUrl(null);
    setCertificateStatus('checking');
    window.location.reload();
  };

  // تنظيف object URL عند unmount
  useEffect(() => {
    return () => {
      if (certificatePdfUrl && certificatePdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(certificatePdfUrl);
      }
    };
  }, [certificatePdfUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="mt-4 text-text-muted">
          {certificateStatus === 'checking' 
            ? t("courses.checkingServerCertificate", "Checking server for certificate...")
            : t("courses.loadingCourse", "Loading course...")
          }
        </p>
      </div>
    );
  }
  
  if (!certificateEligible && certificateStatus === 'not_found') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="max-w-md p-8 text-center border shadow-2xl bg-surface rounded-2xl border-border">
          <div className="flex justify-center mb-4">
            <FaExclamationTriangle className="w-16 h-16 text-yellow-500" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-text">
            {t("courses.certificateNotAvailable", "Certificate Not Available")}
          </h2>
          <p className="mb-6 text-text-muted">
            {t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate.")}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(backPath)}
              className="flex-1 px-4 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
            >
              {t("courses.backToLessons", "Back to Lessons")}
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 px-4 py-3 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              {t("common.retry", "Retry")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (error || !course) {
    return (
      <section className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-center">
          <div className="mb-4 text-red-600">{error || t("common.error", "Error")}</div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(backPath)}
              className="px-4 py-2 text-white rounded bg-primary"
            >
              {t("common.back", "Back")}
            </button>
            <button
              onClick={handleRetry}
              className="px-4 py-2 text-white bg-gray-600 rounded"
            >
              {t("common.retry", "Retry")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-10 bg-gradient-to-br from-primary/5 to-secondary/5 text-text">
      <div className="max-w-6xl px-4 mx-auto">
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
            {t("courses.certificateOfCompletion", "Certificate of Completion")}
          </h1>
          <div className="w-10" />
        </div>

        {/* Certificate Container */}
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-surface rounded-2xl shadow-2xl border border-border p-4 sm:p-8">
          {/* Certificate Status */}
          {/* {certificateStatus === 'exists' && (
            <div className="flex items-center gap-2 p-2 mb-4 text-green-800 bg-green-100 rounded-lg">
              <FaCheckCircle />
              <span className="text-sm">
                {certificatePdfUrl 
                  ? t("courses.certificateFromServer", "Certificate loaded from server")
                  : t("courses.certificateAvailable", "Certificate available on server")
                }
              </span>
            </div>
          )} */}
          
          {certificateStatus === 'error' && (
            <div className="flex items-center gap-2 p-2 mb-4 text-yellow-800 bg-yellow-100 rounded-lg">
              <FaExclamationTriangle />
              <span className="text-sm">
                {t("courses.certificateCheckWarning", "Certificate check warning")}
              </span>
            </div>
          )}

          {/* Certificate Display */}
          {certificatePdfUrl ? (
            <div className="w-full max-w-4xl">
              <div className="flex items-center gap-2 mb-2 text-sm text-text-muted">
                <FaFilePdf />
                <span>{t("courses.serverCertificate", "Server Certificate")}</span>
              </div>
              <iframe
                src={`${certificatePdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-[636px] border rounded-lg border-border"
                style={{ border: "none" }}
              />
              <div className="mt-2 text-sm text-center text-text-muted">
                {t("courses.pdfViewHint", "If the PDF doesn't display correctly, use the download button below")}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              <div className="flex items-center gap-2 mb-2 text-sm text-text-muted">
                <FaAward />
                <span>{t("courses.previewCertificate", "Preview Certificate")}</span>
              </div>
              <div className="relative w-full aspect-[1.41/1] bg-white shadow-2xl rounded-xl overflow-hidden">
                <img
                  src={certificateImage}
                  alt={t("courses.certificateOfCompletion", "Certificate of Completion")}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error("Failed to load certificate image");
                    e.target.src = "/fallback-certificate.jpg";
                  }}
                />

                {/* Professional Overlay Data */}
                <div className="absolute inset-0 text-center">
                  
                  {/* Student Name - باللون الأصفر المميز */}
                  <div
                    className="absolute font-bold transform -translate-x-1/2 left-1/2"
                    style={{
                      top: "52%",
                      color: studentNameColor,
                      fontSize: "clamp(1.5rem, 4vw, 3rem)",
                      fontFamily: "'Times New Roman', serif",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "1px"
                    }}
                  >
                    {userName}
                  </div>

                  {/* Course Title */}
                  <div
                    className="absolute transform -translate-x-1/2 left-1/2"
                    style={{
                      top: "60%",
                      color: "#333333",
                      fontSize: "clamp(0.8rem, 2vw, 1.5rem)",
                      fontFamily: "'Times New Roman', serif",
                      fontWeight: "bold"
                    }}
                  >
                    {course?.title || t("courses.courseTitle", "Course Title")}
                  </div>

                  {/* Grade - التقدير */}
                  {grade && (
                    <div
                      className="absolute italic transform -translate-x-1/2 left-1/2"
                      style={{
                        top: "66%",
                        color: "#2c5aa0",
                        fontSize: "clamp(0.7rem, 1.8vw, 1.2rem)",
                        fontFamily: "'Times New Roman', serif",
                        fontWeight: "bold"
                      }}
                    >
                      Grade: {grade}
                    </div>
                  )}

                  {/* Date */}
                  <div
                    className="absolute"
                    style={{
                      bottom: "12%",
                      left: "10%",
                      color: "#000000",
                      fontSize: "clamp(0.6rem, 1.5vw, 1rem)",
                      fontFamily: "'Times New Roman', serif"
                    }}
                  >
                    <div style={{ borderBottom: "1px solid #000", paddingBottom: "2px", marginBottom: "2px" }}>
                      Date
                    </div>
                    <div>{certDate}</div>
                  </div>

                  {/* Signature */}
                  <div
                    className="absolute text-right"
                    style={{
                      bottom: "12%",
                      right: "10%",
                      color: "#000000",
                      fontSize: "clamp(0.6rem, 1.5vw, 1rem)",
                      fontFamily: "'Times New Roman', serif"
                    }}
                  >
                    <div style={{ borderBottom: "1px solid #000", paddingBottom: "2px", marginBottom: "2px" }}>
                      Signature
                    </div>
                    <div>Dr. KROK </div>
                  </div>
                </div>
              </div>

              {/* Color Information Display */}
              <div className="p-4 mt-4 text-center bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Student Name Color:</strong> 
                  <span style={{ color: studentNameColor, marginLeft: '8px' }}>
                    {studentNameColor}
                  </span>
                </p>
                {grade && (
                  <p className="text-sm text-gray-600">
                    <strong>Grade:</strong> {grade}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mt-8 sm:flex-row">
            {!certificatePdfUrl && certificateEligible && (
              <button
                onClick={handleShowCertificate}
                disabled={loadingCertificate}
                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-primary hover:bg-primary/90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingCertificate ? (
                  <>
                    <FaSync className="animate-spin" />
                    {t("common.loading", "Loading...")}
                  </>
                ) : (
                  <>
                    <FaDownload />
                    {t("courses.showCertificate", "Show Certificate")}
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={downloadPDF}
              disabled={!certificateEligible}
              className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-secondary hover:bg-primary hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDownload />
              {certificatePdfUrl 
                ? t("courses.downloadPDF", "Download as PDF") 
                : t("courses.generatePDF", "Generate PDF")
              }
            </button>

            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all bg-gray-500 rounded-lg shadow-lg hover:bg-gray-600 hover:shadow-xl"
            >
              <FaSync />
              {t("common.retry", "Retry")}
            </button>
          </div>

          {/* Certificate Error Message */}
          {certificateError && (
            <div className="p-4 mt-4 text-red-600 bg-red-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span>{certificateError}</span>
                <button 
                  onClick={() => setCertificateError("")}
                  className="ml-4 text-red-800 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-text-muted">
          <p>{t("courses.congratulations", "Congratulations on completing the course!")}</p>
        </div>
      </div>
    </section>
  );
}