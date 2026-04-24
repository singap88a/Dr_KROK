// LiveCourseLessons/Sidebar.jsx
import React from "react";
import { FaTimes, FaBars } from "react-icons/fa";
import SectionItem from "../../Courses/SectionItem";
import { FinalTestsSection } from "../QuizSystem/FinalTests";
import { CertificateSection } from "../CertificateSection/CertificateSection";

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
      <div className={`
        lg:col-span-1 space-y-3
        fixed lg:static top-0 left-0 h-screen lg:h-auto
        w-80 lg:w-auto bg-surface lg:bg-transparent
        shadow-2xl lg:shadow-none z-40
        transform transition-transform duration-300 ease-in-out
        border-r border-border lg:border-r-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
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
        <div className="p-4 lg:p-0 h-[calc(100vh-80px)] lg:h-auto overflow-y-auto sidebar-content">
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