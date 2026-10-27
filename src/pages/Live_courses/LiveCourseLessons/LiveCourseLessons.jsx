import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../../components/Common/LoadingSpinner";
import CourseHeader from "../../../components/Courses/CourseHeader";
import VideoPlayerSection from "../../../components/Courses/VideoPlayerSection";
import Sidebar from "./Sidebar";
import CourseCompletionBanners from "../../../components/Courses/CourseLessons/CourseCompletionBanners";
import LiveCourseModals from "../../../components/Courses/CourseLessons/LiveCourseModals";
import { useLivePeriodicQuiz } from "../../../components/Courses/CourseLessons/hooks/useLivePeriodicQuiz";
import { useLiveCourseData } from "../../../components/Courses/CourseLessons/hooks/useLiveCourseData";
import BatchInfoCard from "../../../components/Courses/InfoCards/BatchInfoCard";
import { formatSessionTimeRaw, isLinkActive, getTimeUntilStart } from "../../../components/Courses/LiveCourses/timeUtils.jsx";

export default function LiveCourseLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    loading,
    error,
    course,
    sections,
    hasAccess,
    isExpired,
    isCompleted,
    currentLesson,
    currentSection,
    expandedSections,
    setExpandedSections,
    showPurchaseModal,
    setShowPurchaseModal,
    lessonStatuses,
    setLessonStatuses,
    courseProgress,
    setCourseProgress,
    sectionProgress,
    serverTimeOffset,
    currentTimeMs,
    isSidebarOpen,
    toggleSidebar,
    calculateTotalProgress,
    calculateSectionProgress,
    handleLessonComplete,
    handleLessonClickWithClose,
    handleSectionClickWithClose,
    hasFreeLessons,
    updateLessonStatus,
    isLoggedIn,
  } = useLiveCourseData(id);

  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFilesPopup, setShowFilesPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
  }, [loading]);

  const {
    quizModal,
    setQuizModal,
    resultsModal,
    setResultsModal,
    setAnsweredQuizzes,
    setQuizResults,
    handleVideoTimeUpdate,
    handleVideoEnd,
  } = useLivePeriodicQuiz({
    currentLesson,
    lessonStatuses,
    setLessonStatuses,
    updateLessonStatus,
    id,
    isLoggedIn,
    setCourseProgress,
  });

  const sortedSections = useMemo(() => sections, [sections]);

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setShowFilesPopup(true);
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
          to="/live-courses"
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
          hasAccess={hasAccess}
          isLoggedIn={isLoggedIn}
          courseProgress={courseProgress}
          progressLoading={false}
          isExpired={isExpired}
          isCompleted={isCompleted}
          onPurchaseClick={() => setShowPurchaseModal(true)}
          backPath={`/live-courses/${course.id}`}
        />

        <BatchInfoCard course={course} t={t} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {isCompleted || isExpired ? (
            <CourseCompletionBanners
              isCompleted={isCompleted}
              isExpired={isExpired}
              courseId={id}
              t={t}
            />
          ) : (
            <>
              <Sidebar
                sections={sortedSections}
                expandedSections={expandedSections}
                currentSection={currentSection}
                currentLesson={currentLesson}
                lessonStatuses={lessonStatuses}
                sectionProgress={sectionProgress}
                hasAccess={hasAccess}
                isLoggedIn={isLoggedIn}
                course={course}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={toggleSidebar}
                onSectionClick={handleSectionClickWithClose}
                onLessonClick={handleLessonClickWithClose}
                onToggleSection={(sectionId) => {
                  setExpandedSections((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(sectionId)) newSet.delete(sectionId);
                    else newSet.add(sectionId);
                    return newSet;
                  });
                }}
                hasFreeLessons={hasFreeLessons}
                calculateTotalProgress={calculateTotalProgress}
                calculateSectionProgress={calculateSectionProgress}
                id={id}
                courseProgress={courseProgress}
                navigate={navigate}
                t={t}
              />

              <div id="video-player-section" className="space-y-6 lg:col-span-2">
                <VideoPlayerSection
                  currentLesson={currentLesson}
                  currentSection={currentSection}
                  hasAccess={hasAccess}
                  isLoggedIn={isLoggedIn}
                  course={course}
                  id={id}
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
                  serverTimeOffset={serverTimeOffset}
                  currentTimeMs={currentTimeMs}
                  isDescriptionExpanded={isDescriptionExpanded}
                  setIsDescriptionExpanded={setIsDescriptionExpanded}
                  hasFreeLessons={hasFreeLessons}
                  formatSessionTimeRaw={formatSessionTimeRaw}
                  isLinkActive={isLinkActive}
                  getTimeUntilStart={getTimeUntilStart}
                  setShowPurchaseModal={setShowPurchaseModal}
                  isLiveCourse={true}
                  groupId={
                    course?.batch_info?.batch_id ??
                    course?.id ??
                    course?.group_id ??
                    course?.batch?.id ??
                    course?.batch_id ??
                    course?.group?.id ??
                    null
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>

      <LiveCourseModals
        showPurchaseModal={showPurchaseModal}
        closePurchaseModal={() => setShowPurchaseModal(false)}
        courseId={id}
        showImagePopup={showImagePopup}
        selectedImage={selectedImage}
        setShowImagePopup={setShowImagePopup}
        showFilesPopup={showFilesPopup}
        selectedFile={selectedFile}
        setShowFilesPopup={setShowFilesPopup}
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