import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import LoadingSpinner from "../../../components/Common/LoadingSpinner";
import CourseHeader from "../../../components/Courses/CourseHeader";
import VideoPlayerSection from "../../../components/Courses/VideoPlayerSection";
import CourseLessonsBanners from "../../../components/Courses/CourseLessons/CourseLessonsBanners";
import CourseLessonsModals from "../../../components/Courses/CourseLessons/CourseLessonsModals";
import { useVideoPeriodicQuiz } from "../../../components/Courses/CourseLessons/hooks/useVideoPeriodicQuiz";
import { useVideoCourseData } from "../../../components/Courses/CourseLessons/hooks/useVideoCourseData";
import CourseContentSidebar from "./CourseContentSidebar";
import InstructorCard from "../../../components/Courses/InfoCards/InstructorCard";

export default function CourseLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    loading,
    error,
    course,
    lessons,
    sections,
    hasAccess,
    isExpired,
    isCompleted,
    currentLesson,
    currentSection,
    expandedSections,
    toggleSection,
    showPurchaseModal,
    setShowPurchaseModal,
    lessonStatuses,
    courseProgress,
    sectionProgress,
    calculateTotalProgress,
    calculateSectionProgress,
    handleLessonComplete,
    handleLessonClick,
    handleSectionClick,
    hasFreeLessons,
    isLoggedIn,
  } = useVideoCourseData(id);

  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Reset scroll after loading
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
  }, [loading]);

  // Periodic quizzes
  const {
    quizModal,
    setQuizModal,
    resultsModal,
    setResultsModal,
    setAnsweredQuizzes,
    setQuizResults,
    handleVideoTimeUpdate,
    handleVideoEnd,
  } = useVideoPeriodicQuiz({
    currentLesson,
    isLoggedIn,
    handleLessonComplete,
  });

  const handleFileClick = (file) => {
    if (file) {
      window.open(file, "_blank");
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoPopup(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !course) {
    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-text">
        <div className="text-red-600">
          {t("common.error", "Error")}: {error || t("courses.courseNotFound", "Course not found.")}
        </div>
        <Link
          to="/courses"
          className="px-4 py-2 text-white rounded-lg bg-primary hover:bg-secondary"
        >
          {t("courses.backToCourses", "Back to Courses")}
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-10 bg-background text-text dark:bg-background dark:text-text">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <CourseHeader
          course={course}
          courseProgress={courseProgress}
          progressLoading={false}
          hasAccess={hasAccess}
          isLoggedIn={isLoggedIn}
          isExpired={isExpired}
          isCompleted={isCompleted}
          onPurchaseClick={() => setShowPurchaseModal(true)}
          backPath={`/courses/${course.id}`}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {isCompleted || isExpired ? (
            <CourseLessonsBanners
              isCompleted={isCompleted}
              isExpired={isExpired}
              courseId={id}
              t={t}
            />
          ) : (
            <>
              <div
                className="space-y-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto pr-2 custom-sidebar-scrollbar"
                style={{ direction: "ltr" }}
              >
                <div style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }} className="w-full">
                  <CourseContentSidebar
                    sections={sections}
                    lessons={lessons}
                    course={course}
                    courseProgress={courseProgress}
                    expandedSections={expandedSections}
                    currentLesson={currentLesson}
                    currentSection={currentSection}
                    lessonStatuses={lessonStatuses}
                    hasAccess={hasAccess}
                    isLoggedIn={isLoggedIn}
                    sectionProgress={sectionProgress}
                    calculateTotalProgress={calculateTotalProgress}
                    calculateSectionProgress={calculateSectionProgress}
                    onLessonClick={handleLessonClick}
                    onSectionClick={handleSectionClick}
                    onToggleSection={toggleSection}
                    hasFreeLessons={hasFreeLessons}
                    navigate={navigate}
                  />
                </div>
              </div>

              {/* Video Section with integrated Quizzes + Instructor Card */}
              <div id="video-player-section" className="space-y-6 lg:col-span-2">
                <VideoPlayerSection
                  currentLesson={currentLesson}
                  currentSection={currentSection}
                  course={course}
                  id={id}
                  isLoggedIn={isLoggedIn}
                  hasAccess={hasAccess}
                  lessonStatuses={lessonStatuses}
                  quizModal={quizModal}
                  setQuizModal={setQuizModal}
                  resultsModal={resultsModal}
                  setResultsModal={setResultsModal}
                  setAnsweredQuizzes={setAnsweredQuizzes}
                  setQuizResults={setQuizResults}
                  onVideoTimeUpdate={handleVideoTimeUpdate}
                  onVideoEnd={handleVideoEnd}
                  onLessonComplete={handleLessonComplete}
                  onFileClick={handleFileClick}
                  onVideoClick={handleVideoClick}
                  onImageClick={(image) => {
                    setSelectedImage(image);
                    setShowImagePopup(true);
                  }}
                  isDescriptionExpanded={isDescriptionExpanded}
                  setIsDescriptionExpanded={setIsDescriptionExpanded}
                  setShowPurchaseModal={setShowPurchaseModal}
                  isLiveCourse={false}
                />
                <InstructorCard course={course} t={t} />
              </div>
            </>
          )}
        </div>
      </div>

      <CourseLessonsModals
        showPurchaseModal={showPurchaseModal}
        closePurchaseModal={() => setShowPurchaseModal(false)}
        courseId={id}
        showImagePopup={showImagePopup}
        selectedImage={selectedImage}
        setShowImagePopup={setShowImagePopup}
        showVideoPopup={showVideoPopup}
        selectedVideo={selectedVideo}
        setShowVideoPopup={setShowVideoPopup}
        quizModal={quizModal}
        setQuizModal={setQuizModal}
        resultsModal={resultsModal}
        setResultsModal={setResultsModal}
      />
    </section>
  );
}