import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import TopStudentsSlider from "../../components/Common/TopStudentsSlider";
import SEO from "../../components/SEO/SEO";
import LiveCourseHeroMedia from "../../components/Courses/LiveCourses/LiveCourseHeroMedia";
import LiveCourseHeroInfo from "../../components/Courses/LiveCourses/LiveCourseHeroInfo";
import LiveCourseInstructorSidebar from "../../components/Courses/LiveCourses/LiveCourseInstructorSidebar";
import CourseReviewsSection from "../../components/Courses/CourseDetails/CourseReviewsSection";
import CourseStatusModals from "../../components/Courses/CourseDetails/CourseStatusModals";
import { useCourseDetailsLogic } from "../../components/Courses/CourseDetails/useCourseDetailsLogic";

export default function LiveCourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    loading,
    error,
    course,
    reviews,
    showAll,
    setShowAll,
    userHasReviewed,
    userHasAccess,
    isExpired,
    isCompleted,
    showExpiredModal,
    setShowExpiredModal,
    showCompletedModal,
    setShowCompletedModal,
    isPlaying,
    setIsPlaying,
    isDescriptionExpanded,
    setIsDescriptionExpanded,
    videoRef,
    handleReviewSubmitted,
    renderStaticStars,
    isLoggedIn,
    imageUrl,
    videoUrl,
    handlePlay,
    handleVideoEnd,
    getLevelTranslation,
    formatDate,
    timeStatus,
    isUpcoming,
  } = useCourseDetailsLogic({ id, isLive: true });

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
    <section className="min-h-screen px-4 py-8 bg-background sm:px-6 md:px-12 text-text pt-20">
      <SEO
        title={course?.title ? `${course.title}` : "Live Course Details"}
        description={
          course?.description
            ? course.description.replace(/<[^>]*>?/gm, "").slice(0, 160)
            : "Learn from top medical instructors with interactive live sessions for KROK preparation."
        }
        image={imageUrl || course?.image || "/logo.png"}
        url={`/live-courses/${id}`}
      />

      {/* صورة أو فيديو + تفاصيل الكورس */}
      <div className="grid max-w-6xl gap-8 mx-auto lg:grid-cols-2 lg:gap-10">
        <LiveCourseHeroMedia
          videoUrl={videoUrl}
          videoRef={videoRef}
          imageUrl={imageUrl}
          isPlaying={isPlaying}
          handlePlay={handlePlay}
          handleVideoEnd={handleVideoEnd}
          title={course?.title}
          timeStatus={timeStatus}
          t={t}
        />

        <LiveCourseHeroInfo
          course={course}
          renderStaticStars={renderStaticStars}
          isDescriptionExpanded={isDescriptionExpanded}
          setIsDescriptionExpanded={setIsDescriptionExpanded}
          getLevelTranslation={getLevelTranslation}
          formatDate={formatDate}
          isCompleted={isCompleted}
          isExpired={isExpired}
          userHasAccess={userHasAccess}
          isUpcoming={isUpcoming}
          setShowCompletedModal={setShowCompletedModal}
          setShowExpiredModal={setShowExpiredModal}
          navigate={navigate}
          id={id}
          t={t}
        />
      </div>

      {/* Review + Instructor */}
      <div className="grid max-w-6xl gap-8 mx-auto mt-12 sm:mt-16 lg:grid-cols-3">
        <CourseReviewsSection
          courseId={course.id}
          handleReviewSubmitted={handleReviewSubmitted}
          userHasReviewed={userHasReviewed}
          reviews={reviews}
          showAll={showAll}
          setShowAll={setShowAll}
          renderStaticStars={renderStaticStars}
          t={t}
        />

        <LiveCourseInstructorSidebar course={course} t={t} />
      </div>

      {/* Top Students Section */}
      <TopStudentsSlider students={course.top_students} />

      <CourseStatusModals
        showExpiredModal={showExpiredModal}
        setShowExpiredModal={setShowExpiredModal}
        showCompletedModal={showCompletedModal}
        setShowCompletedModal={setShowCompletedModal}
        course={course}
        id={id}
        navigate={navigate}
        t={t}
        isLive={true}
      />
    </section>
  );
}
