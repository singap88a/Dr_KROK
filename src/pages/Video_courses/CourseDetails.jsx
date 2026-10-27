import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import LeaveReview from "../../components/Courses/LeaveReview.jsx";
import TopStudentsSlider from "../../components/Common/TopStudentsSlider";
import SEO from "../../components/SEO/SEO";
import CourseHeroMedia from "../../components/Courses/CourseDetails/CourseHeroMedia";
import CourseHeroInfo from "../../components/Courses/CourseDetails/CourseHeroInfo";
import CourseReviewsSection from "../../components/Courses/CourseDetails/CourseReviewsSection";
import CourseInstructorSidebar from "../../components/Courses/CourseDetails/CourseInstructorSidebar";
import CourseStatusModals from "../../components/Courses/CourseDetails/CourseStatusModals";
import { useCourseDetailsLogic } from "../../components/Courses/CourseDetails/useCourseDetailsLogic";

export default function CourseDetails() {
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
    isInstructorExpanded,
    setIsInstructorExpanded,
    videoRef,
    handleReviewSubmitted,
    renderStaticStars,
    isLoggedIn,
    imageUrl,
    videoUrl,
    handlePlay,
    handleVideoEnd,
    getLevelTranslation,
    parseDate,
  } = useCourseDetailsLogic({ id, isLive: false });

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
    <section className="min-h-screen px-4 py-8 bg-background sm:px-6 md:px-12 text-text pt-20">
      <SEO
        title={course?.title ? `${course.title}` : "Course Details"}
        description={
          course?.description
            ? course.description.replace(/<[^>]*>?/gm, "").slice(0, 160)
            : "Learn from top medical instructors and prepare for KROK exams."
        }
        image={imageUrl || course?.image || "/logo.png"}
        url={`/courses/${id}`}
      />

      {/* صورة أو فيديو + تفاصيل الكورس */}
      <div className="grid max-w-6xl gap-8 mx-auto lg:grid-cols-2 lg:gap-10">
        <CourseHeroMedia
          videoUrl={videoUrl}
          videoRef={videoRef}
          imageUrl={imageUrl}
          isPlaying={isPlaying}
          handlePlay={handlePlay}
          handleVideoEnd={handleVideoEnd}
          title={course?.title}
        />

        <CourseHeroInfo
          course={course}
          renderStaticStars={renderStaticStars}
          isDescriptionExpanded={isDescriptionExpanded}
          setIsDescriptionExpanded={setIsDescriptionExpanded}
          getLevelTranslation={getLevelTranslation}
          parseDate={parseDate}
          isCompleted={isCompleted}
          isExpired={isExpired}
          userHasAccess={userHasAccess}
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

        <CourseInstructorSidebar
          course={course}
          isInstructorExpanded={isInstructorExpanded}
          setIsInstructorExpanded={setIsInstructorExpanded}
          t={t}
        />
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
        isLive={false}
      />
    </section>
  );
}
