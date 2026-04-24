import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaAward, FaLock, FaBars, FaTimes } from "react-icons/fa";
import SectionItem from "../../../components/Courses/Sidebar/SectionItem";
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
  const { getCertificateFile, getAuthToken, checkCertificateExists } = useApi();
  
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [checkingCertificate, setCheckingCertificate] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 🔥 حالة القائمة الجانبية

  // 🔥 دالة لفتح/غلق القائمة الجانبية
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // إغلاق القائمة الجانبية تلقائياً على الشاشات الصغيرة عند النقر على درس
  const handleLessonClickWithClose = (lesson) => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    onLessonClick(lesson);
  };

  const handleSectionClickWithClose = (section) => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    onSectionClick(section);
  };

  // التحقق من وجود الشهادة في السيرفر فقط
  useEffect(() => {
    const checkCertificateEligibility = async () => {
      if (!isLoggedIn || !course?.id) {
        setCertificateEligible(false);
        return;
      }
      
      try {
        setCheckingCertificate(true);
        
        const token = getAuthToken();
        if (!token) {
          console.log("❌ No token available for certificate check");
          setCertificateEligible(false);
          setCheckingCertificate(false);
          return;
        }
        
        // التحقق من وجود الشهادة في السيرفر فقط
        const courseType = 'video';
        console.log(`🔍 Checking certificate for course ${course.id} (type: ${courseType})`);
        
        // استخدام checkCertificateExists للتحقق السريع من وجود الشهادة
        const exists = await checkCertificateExists(token, course.id, courseType);
        
        if (exists) {
          console.log(`✅ Certificate exists on server!`);
          setCertificateEligible(true);
        } else {
          console.log("❌ Certificate not found on server");
          setCertificateEligible(false);
        }
      } catch (error) {
        // إذا لم توجد الشهادة في السيرفر، يعني غير مؤهل
        console.log("❌ Certificate check failed:", error?.message || error);
        setCertificateEligible(false);
      } finally {
        setCheckingCertificate(false);
      }
    };

    checkCertificateEligibility();
  }, [isLoggedIn, course?.id, checkCertificateExists, getAuthToken]);

  const sortedSections = useMemo(() => {
    return sections;
  }, [sections]);

  const getSectionLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons) return [];
      return section.lessons;
    };
  }, [sections]);

  return (
    <>
      {/* 🔥 زر فتح القائمة الجانبية للشاشات الصغيرة */}
      <div className="fixed z-50 lg:hidden top-24 right-4">
        <button
          onClick={toggleSidebar}
          className="p-3 text-white transition-all duration-300 transform rounded-full shadow-lg bg-primary hover:bg-secondary hover:scale-110"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* 🔥 القائمة الجانبية مع إمكانية الإخفاء */}
      <div className={`
        lg:col-span-1 space-y-3
        fixed lg:static top-0 left-0 h-screen lg:h-auto
        w-80 lg:w-auto bg-surface lg:bg-transparent
        shadow-2xl lg:shadow-none z-40
        transform transition-transform duration-300 ease-in-out
        border-r border-border lg:border-r-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* 🔥 زر الإغلاق للشاشات الصغيرة داخل القائمة */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <h3 className="text-lg font-semibold text-text">
            {t("courses.courseContent", "Course Content")}
          </h3>
          <button
            onClick={toggleSidebar}
            className="p-2 transition-colors text-text hover:text-primary"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* محتوى القائمة */}
        <div className="p-4 lg:p-0 h-[calc(100vh-80px)] lg:h-auto overflow-y-auto sidebar-content">
          <h3 className="hidden mb-3 text-lg font-semibold lg:block text-text">
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
                onSectionClick={handleSectionClickWithClose}
                onLessonClick={handleLessonClickWithClose}
                onToggleSection={onToggleSection}
                isLoggedIn={isLoggedIn}
                hasAccess={hasAccess}
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
                    const totalProgress = Math.round(courseProgress?.overall?.percentage || 0);
                    const locked = !hasAccess || totalProgress < 100;
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
                        className={`px-3 py-2 text-xs font-medium rounded transition-all ${
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
                {hasAccess && Math.round(courseProgress?.overall?.percentage || 0) < 100 && (
                  <p className="mt-2 text-xs text-red-500">
                    {t("courses.completeProgressToUnlockTests", "You must complete 100% of the course to unlock final tests.")}
                  </p>
                )}
              </div>
            )}

            {/* زر الشهادة - الشرط المعدل */}
            {isLoggedIn && certificateEligible && (
              <div className="p-4 mt-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-700">
                <button
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    navigate(`/courses/${course.id}/certificate`);
                  }}
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

            {/* رسالة إذا كان غير مؤهل - تظهر فقط إذا كان عنده final tests متاحة */}
            {isLoggedIn && 
             hasAccess && 
             !certificateEligible && 
             !checkingCertificate && 
             course?.final_tests && 
             course.final_tests.length > 0 && (
              <div className="p-4 mt-4 border rounded-lg border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 rounded-full bg-amber-100 dark:bg-amber-800">
                    <FaAward className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-200">
                      {t("courses.certificateNotAvailable", "Certificate Not Available Yet")}
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      {t("courses.takeFinalTest", "Complete the final test and score 65% or higher to unlock your certificate")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 overlay للشاشات الصغيرة */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default CourseContentSidebar;