// LiveCourseLessons/Sidebar.jsx - Updated to force Vite reload
import React from "react";
import { FaTimes, FaBars } from "react-icons/fa";
import SectionItem from "../../../components/Courses/Sidebar/SectionItem";
import { FinalTestsSection } from "../../../components/Courses/QuizSystem/FinalTests.jsx";
import { CertificateSection } from "../../../components/Courses/CertificateSection/CertificateSection.jsx";
import i18n from "../../../i18n";

export default function Sidebar({
  sections,
  expandedSections,
  currentSection,
  currentLesson,
  lessonStatuses,
  sectionProgress,
  hasAccess,
  isLoggedIn,
  course,
  isSidebarOpen,
  onToggleSidebar,
  onSectionClick,
  onLessonClick,
  onToggleSection,
  hasFreeLessons,
  calculateTotalProgress,
  calculateSectionProgress,
  id,
  courseProgress,
  navigate,
  t
}) {
  const getSectionLessons = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || !section.lessons) return [];
    return section.lessons;
  };

  const isRtl = i18n.language === "ar";

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed z-50 lg:hidden top-24 right-4">
        <button
          onClick={onToggleSidebar}
          className="p-3 text-white transition-all duration-300 transform rounded-full shadow-lg bg-primary hover:bg-secondary hover:scale-110"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`
          lg:col-span-1 space-y-3 custom-sidebar-scrollbar
          fixed lg:sticky top-0 lg:top-28 left-0 h-screen lg:h-auto
          lg:self-start lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto pr-2
          w-80 lg:w-auto bg-surface lg:bg-transparent
          shadow-2xl lg:shadow-none z-40
          transform transition-transform duration-300 ease-in-out
          border-r border-border lg:border-r-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none lg:pointer-events-auto lg:translate-x-0'}
        `}
        style={{ direction: "ltr" }}
      >
        <div style={{ direction: isRtl ? "rtl" : "ltr" }} className="w-full flex flex-col h-full">
          {/* Close Button inside sidebar for mobile */}
          <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
            <h3 className="text-lg font-semibold text-text">
              {t("courses.courseContent", "Course Content")}
            </h3>
            <button
              onClick={onToggleSidebar}
              className="p-2 transition-colors text-text hover:text-primary"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Sidebar Content */}
          <div 
            className="p-4 lg:p-0 h-[calc(100vh-80px)] lg:h-auto overflow-y-auto sidebar-content custom-sidebar-scrollbar"
            style={{ direction: "ltr" }}
          >
            <div style={{ direction: isRtl ? "rtl" : "ltr" }} className="w-full">
              <h3 className="hidden mb-3 text-lg font-semibold lg:block text-text">
                {t("courses.courseContent", "Course Content")}
              </h3>

              <div className="space-y-2">
                {sections.map((section) => (
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
                    hasAccess={hasAccess}
                  />
                ))}

                <FinalTestsSection course={course} courseProgress={courseProgress} id={id} />

                <CertificateSection id={id} isLoggedIn={isLoggedIn} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}
    </>
  );
}