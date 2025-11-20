import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaAward, FaLock } from "react-icons/fa";
import SectionItem from "../SectionItem";
import { useApi } from "../../../context/ApiContext";
import { useUser } from "../../../context/UserContext";

const CourseContentSidebar = ({
  sections,
  course,
  courseProgress,
  expandedSections,
  currentLesson,
  currentSection,
  lessonStatuses,
  hasAccess,
  isLoggedIn,
  sectionProgress,
  calculateTotalProgress,
  calculateSectionProgress,
  onLessonClick,
  onSectionClick,
  onToggleSection,
  hasFreeLessons,
  navigate
}) => {
  const { t } = useTranslation();
  const { getFinalTestResult, getCertificateFile, getAuthToken } = useApi();
  const { userData } = useUser();
  
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [checkingCertificate, setCheckingCertificate] = useState(false);

// في التحقق من أهلية الشهادة في CourseContentSidebar.js
useEffect(() => {
  const checkCertificateEligibility = async () => {
    if (!isLoggedIn || !course?.id) return;
    
    try {
      setCheckingCertificate(true);
      
      // 1. أولاً: التحقق من وجود الشهادة في السيرفر
      const token = getAuthToken();
      if (token) {
        try {
          // تحديد نوع الكورس (افتراضي video)
          const courseType = 'video'; // بما إن ده للفيديو كورس فقط
          const blob = await getCertificateFile(token, course.id, courseType);
          if (blob && blob.size > 0) {
            setCertificateEligible(true);
            setCheckingCertificate(false);
            return;
          }
        } catch (error) {
          console.log("No certificate blob from server, but might still be eligible");
          // نستمر في التحقق من الطرق الأخرى
        }
      }
      
      // 2. إذا وصلنا هنا، يبقى مفيش شهادة في السيرفر، نتحقق من الأهلية بطرق أخرى
      const storageKey = `course_${course.id}_certificate_${userData?.id || 'anonymous'}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const certificateData = JSON.parse(stored);
          if (certificateData.score >= 65 || certificateData.percentage >= 65) {
            setCertificateEligible(true);
            setCheckingCertificate(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing stored certificate data:", e);
        }
      }
      
      // 3. التحقق من نتيجة الاختبار النهائي في السيرفر
      try {
        const finalTestResult = await getFinalTestResult(course.id);
        if (finalTestResult && (finalTestResult.score >= 65 || finalTestResult.percentage >= 65)) {
          setCertificateEligible(true);
          setCheckingCertificate(false);
          return;
        }
      } catch (error) {
        console.log("No final test result found");
      }
      
      // 4. كحالة احتياطية: إذا كان progress 100%
      if (courseProgress?.overall?.percentage >= 100) {
        setCertificateEligible(true);
      } else {
        setCertificateEligible(false);
      }
      
    } catch (error) {
      console.error("Error checking certificate eligibility:", error);
      // Fallback: إذا كان progress 100% يعتبر مؤهل
      if (courseProgress?.overall?.percentage >= 100) {
        setCertificateEligible(true);
      } else {
        setCertificateEligible(false);
      }
    } finally {
      setCheckingCertificate(false);
    }
  };

  checkCertificateEligibility();
}, [isLoggedIn, course?.id, courseProgress?.overall?.percentage, getFinalTestResult, getCertificateFile, getAuthToken, userData]);

  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [sections]);

  const getSectionLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons) return [];
      return [...section.lessons].sort((a, b) => {
        const aFree = a.type === "free" || a.type === "Free";
        const bFree = b.type === "free" || b.type === "Free";
        if (aFree && !bFree) return -1;
        if (!aFree && bFree) return 1;
        return (a.id || 0) - (b.id || 0);
      });
    };
  }, [sections]);

  return (
    <div className="space-y-3 lg:col-span-1">
      <h3 className="text-lg font-semibold">
        {t("courses.courseContent", "Course Content")}
      </h3>

      <div className="space-y-2">
        {sortedSections.map((section) => (
          <SectionItem
            key={`section-${section.id}`}
            section={section}
            lessons={getSectionLessons(section.id)}
            isExpanded={expandedSections.has(section.id)}
            isActive={currentSection?.id === section.id}
            hasFree={hasFreeLessons(section.id)}
            isAccessible={hasFreeLessons(section.id) || hasAccess}
            lessonStatuses={lessonStatuses}
            currentLesson={currentLesson}
            sectionProgress={sectionProgress}
            calculateTotalProgress={calculateTotalProgress}
            calculateSectionProgress={calculateSectionProgress}
            onSectionClick={onSectionClick}
            onLessonClick={onLessonClick}
            onToggleSection={onToggleSection}
            isLoggedIn={isLoggedIn}
            navigate={navigate}
            course={course}
          />
        ))}

        {course.final_tests && course.final_tests.length > 0 && (
          <div className="p-4 mt-4 border rounded-lg bg-surface border-border">
            <div className="mb-2 text-sm font-semibold text-text">
              {t("courses.finalTests", "Final Tests")}
            </div>
            <div className="flex flex-wrap gap-2">
              {course.final_tests.map((test, idx) => {
                // تعديل شرط القفل: يكون مفتوح إذا كان الطالب عنده access للكورس
                const locked = !hasAccess;
                return (
                  <button
                    key={test.id || idx}
                    onClick={() =>
                      !locked &&
                      navigate(`/courses/${course.id}/test/final/${test.id}`, {
                        state: { course, test },
                      })
                    }
                    disabled={locked}
                    className={`px-3 py-2 text-xs font-medium rounded ${
                      locked
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "text-white bg-primary hover:bg-secondary"
                    }`}
                  >
                    {test.name ||
                      `${t("courses.finalTest", "Final Test")} ${idx + 1}`}{" "}
                    {locked && <FaLock className="inline ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* زر الشهادة - الشرط المعدل */}
        {isLoggedIn && certificateEligible && (
          <div className="p-4 mt-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-700">
            <button
              onClick={() => navigate(`/courses/${course.id}/certificate`)}
              disabled={checkingCertificate}
              className="flex items-center w-full gap-3 p-2 text-left transition-all rounded hover:bg-green-100 dark:hover:bg-green-800/50 disabled:opacity-50"
            >
              <div className="flex-shrink-0 p-2 bg-green-100 rounded-full dark:bg-green-800">
                <FaAward className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 dark:text-green-200">
                  {t("courses.certificate", "Certificate of Completion")}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {checkingCertificate 
                    ? t("courses.checkingEligibility", "Checking eligibility...") 
                    : t("courses.downloadCertificate", "Download your certificate")
                  }
                </p>
              </div>
            </button>
          </div>
        )}

        {/* رسالة إذا كان يتحقق من الأهلية */}
        {checkingCertificate && (
          <div className="p-3 mt-4 text-center border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t("courses.checkingCertificate", "Checking certificate availability...")}
            </p>
          </div>
        )}

        {/* رسالة إذا كان غير مؤهل لكن عنده access */}
        {isLoggedIn && hasAccess && !certificateEligible && !checkingCertificate && (
          <div className="p-3 mt-4 text-center border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {t("courses.takeFinalTest", "Take the final test to get your certificate")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContentSidebar;