import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaVideo,
  FaImage,
  FaFileAlt,
  FaCheck,
  FaPlay,
  FaWhatsapp,
  FaStar as FaStarSolid,
  FaGraduationCap,
  FaList,
  FaLock,
  FaTimes,
  FaExclamationTriangle,
  FaChartLine,
  FaClock,
  FaUnlock
} from "react-icons/fa";

const VideoPlayerSection = ({
  currentLesson,
  currentSection,
  course,
  courseProgress,
  isLoggedIn,
  lessonStatuses,
  onLessonComplete,
  onFileClick,
  onVideoClick,
  onImageClick,
  updateLessonStatus,
  navigate,
  onLessonClick
}) => {
  const { t } = useTranslation();
  const [testModal, setTestModal] = useState({
    isOpen: false,
    message: "",
    progress: 0,
    required: 80,
    testName: ""
  });

  const getVideoRelatedArray = (videoRelated) => {
    if (!videoRelated) return [];
    if (Array.isArray(videoRelated)) return videoRelated;
    return [videoRelated];
  };

  // Handle test attempts
  const handleTestClick = (test, content, testType = 'lesson') => {
    const lessonProgress = lessonStatuses[content.id] || {};
    const progressPercentage = lessonProgress.percentage || lessonProgress.lesson_percentage || 0;
    const canTakeTest = progressPercentage >= 50;

    if (!canTakeTest) {
      setTestModal({
        isOpen: true,
        message: t("courses.watchVideoToUnlockTest", "You need to watch at least 50% of the video to unlock this test"),
        progress: progressPercentage,
        required: 50,
        testName: test.name || `${t("courses.test", "Test")}`
      });
      return;
    }

    // Navigate to test if allowed
    if (testType === 'lesson') {
      navigate(`/courses/${course.id}/test/lesson/${test.id}`, {
        state: {
          course,
          test,
          lessonId: content.id,
        },
      });
    } else {
      navigate(`/courses/${course.id}/test/final/${test.id}`, {
        state: { course, test },
      });
    }
  };

  // Professional modal popup
  const TestLockModal = () => {
    if (!testModal.isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 overflow-hidden transition-all transform shadow-xl bg-surface rounded-2xl">
          {/* Header */}
          <div className="p-6 text-white bg-primary to-primary/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full bg-opacity-20">
                  <FaLock className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {t("courses.testLocked", "Test Locked")}
                  </h3>
                  <p className="text-sm text-white text-opacity-90">
                    {testModal.testName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestModal({ ...testModal, isOpen: false })}
                className="p-2 transition-colors rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-surface">
            <div className="flex items-center gap-4 p-4 mb-4 border rounded-lg bg-background border-border">
              <div className="flex-shrink-0">
                <div className="p-3 bg-orange-100 rounded-full">
                  <FaExclamationTriangle className="text-2xl text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-text">
                  {testModal.message}
                </p>
              </div>
            </div>



            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setTestModal({ ...testModal, isOpen: false })}
                className="flex-1 px-4 py-3 font-medium transition-colors rounded-lg text-text bg-accent hover:bg-accent/80"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                onClick={() => {
                  setTestModal({ ...testModal, isOpen: false });
                }}
                className="flex-1 px-4 py-3 font-medium text-white transition-all transform rounded-lg bg-primary hover:bg-primary/90 hover:scale-105"
              >
                {t("courses.continueWatching", "Continue Watching")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContentAttachments = (content, type) => {
    const isLesson = type === 'lesson';
    
    return (
      <div className="mt-6">
        <h4 className="pb-2 mb-4 text-lg font-bold border-b text-text">
          {t(isLesson ? "courses.lessonAttachments" : "courses.sectionAttachments", 
             isLesson ? "📚 Lesson Materials" : "📁 Section Materials")}
        </h4>

        {content.images && content.images.length > 0 && (
          <div className="mb-6">
            <h5 className="flex items-center gap-2 mb-3 text-lg font-semibold text-text">
              <FaImage className="text-primary" />
              {t("courses.images", "Gallery")}
            </h5>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {content.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden transition-transform duration-200 transform rounded-lg cursor-pointer group hover:scale-105"
                  onClick={() => onImageClick(img)}
                >
                  <img
                    src={img}
                    alt={`${type} image ${idx + 1}`}
                    className="object-cover w-full rounded-lg h-28"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 group-hover:bg-opacity-30">
                    <div className="transition-all duration-200 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0">
                      <FaImage className="text-xl text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.files && content.files.length > 0 && (
          <div className="mb-6">
            <h5 className="flex items-center gap-2 mb-3 text-lg font-semibold text-text">
              <FaFileAlt className="text-primary" />
              {t("courses.files", "Study Materials")}
            </h5>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {content.files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => onFileClick(file.url || file)}
                  className="flex items-center gap-4 p-4 transition-all border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-md group"
                >
                  <div className="flex-shrink-0 p-3 transition-colors rounded-lg bg-primary/10 group-hover:bg-primary/20">
                    <FaFileAlt className="text-xl text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-sm font-medium text-text">
                      {file.name || `${t("courses.file", "File")} ${idx + 1}`}
                    </span>
                    <span className="block mt-1 text-xs text-text-muted">
                      {t("courses.clickToDownload", "Click to download")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {content.video_related && (
          <div className="mb-6">
            <h5 className="flex items-center gap-2 mb-3 text-lg font-semibold text-text">
              <FaVideo className="text-primary" />
              {t("courses.additionalVideos", "Additional Videos")}
            </h5>
            <div className="grid grid-cols-1 gap-4">
              {getVideoRelatedArray(content.video_related).map((video, idx) => {
                const isObj = typeof video === "object" && video !== null;
                const videoUrl = isObj
                  ? video.url || video.src || video.video || ""
                  : video;
                const thumbnail = isObj
                  ? video.thumbnail || video.poster || video.image || ""
                  : "";
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 transition-all border-2 border-gray-200 cursor-pointer rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-md group"
                    onClick={() => onVideoClick(video)}
                  >
                    <div className="relative flex-shrink-0 w-24 h-16 overflow-hidden rounded-lg">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={`Additional video ${idx + 1}`}
                          className="object-cover w-full h-full transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <video
                          src={videoUrl}
                          className="object-cover w-full h-full"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center transition-all bg-black/0 group-hover:bg-black/20">
                        <div className="flex items-center justify-center w-8 h-8 transition-transform transform bg-white rounded-full bg-opacity-90 group-hover:scale-110">
                          <FaPlay className="text-gray-700 text-xs ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-text">
                          {t("courses.additionalVideo", "Additional Video")} {idx + 1}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">
                        {t("courses.clickToWatch", "Click to watch this video")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isLesson && content.lesson_end_tests && content.lesson_end_tests.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary">
                <FaChartLine className="text-lg text-white" />
              </div>
              <div>
                <h5 className="text-lg font-bold text-text">
                  {t("courses.lessonTests", "Lesson Assessment")}
                </h5>
                <p className="text-sm text-text-muted">
                  {t("courses.testYourKnowledge", "Test your understanding of this lesson")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {content.lesson_end_tests.map((test, idx) => {
                const lessonProgress = lessonStatuses[content.id] || {};
                const progressPercentage = lessonProgress.percentage || lessonProgress.lesson_percentage || 0;
                const canTakeTest = progressPercentage >= 50;

                return (
                  <div
                    key={test.id || idx}
                    className={`p-5 border-2 rounded-xl transition-all transform hover:scale-105 cursor-pointer ${
                      canTakeTest
                        ? "border-primary/20 bg-primary/5 hover:border-primary hover:shadow-lg"
                        : "border-border bg-accent hover:border-border/80"
                    }`}
                    onClick={() => handleTestClick(test, content, 'lesson')}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          canTakeTest
                            ? "bg-primary text-white"
                            : "bg-text-muted text-background"
                        }`}>
                          {canTakeTest ? <FaUnlock /> : <FaLock />}
                        </div>
                        <div>
                          <h6 className="font-semibold text-text">
                            {test.name || `${t("courses.test", "Test")} ${idx + 1}`}
                          </h6>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        canTakeTest
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-text-muted"
                      }`}>
                        {canTakeTest ? t("courses.available", "Available") : t("courses.locked", "Locked")}
                      </div>
                    </div>

                    {/* Progress indicator for the test - only show when available */}
                    {canTakeTest && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-muted">
                            {t("courses.lessonProgress", "Lesson Progress")}
                          </span>
                          <span className="text-xs font-bold text-text">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-accent">
                          <div
                            className="h-2 transition-all duration-500 rounded-full bg-primary"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {!canTakeTest && (
                      <p className="flex items-center gap-1 mt-2 text-xs text-red-500">
                        <FaLock className="text-xs" />
                        {t("courses.watchVideoToUnlockTest", "Watch 50% of the lesson to unlock")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInstructorCard = () => {
    if (!course.instructor) return null;

    return (
      <div className="p-6 border rounded-lg bg-surface border-border">
        <h3 className="mb-4 text-lg font-semibold text-text">
          {t("courses.instructor", "Instructor")}
        </h3>

        <div className="flex items-start gap-4">
          <img
            src={course.instructor.image || "/placeholder-instructor.jpg"}
            alt={course.instructor.name}
            className="object-cover w-16 h-16 border-2 rounded-full border-primary"
          />

          <div className="flex-1">
            <h4 className="text-lg font-semibold text-text">
              {course.instructor.name}
            </h4>
            <p className="mb-2 font-medium text-primary">
              {course.instructor.job_title}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-text-muted">
              <div className="flex items-center gap-1">
                <FaGraduationCap />
                <span>
                  {course.instructor.years_of_experience}{" "}
                  {t("courses.yearsExp", "years experience")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FaStarSolid className="text-yellow-400" />
                <span>
                  {(course.instructor.average_rating || 0).toFixed(1)}
                </span>
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-text line-clamp-3">
              {course.instructor.bio}
            </p>

            <Link
              to={`/instructors/${course.instructor.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
            >
              {t("instructors.viewDetails", "View Details")}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderFinalTests = () => {
    if (!course.final_tests || course.final_tests.length === 0) return null;

    return (
      <div className="p-6 border rounded-lg bg-surface border-border">
        <h3 className="mb-3 text-lg font-semibold text-text">
          {t("courses.finalTests", "Final Tests")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {course.final_tests.map((test, idx) => {
            const locked =
              Math.round(courseProgress?.overall?.percentage || 0) < 100;
            return (
              <button
                key={test.id || idx}
                onClick={() => handleTestClick(test, course, 'final')}
                disabled={locked}
                className={`px-4 py-2 text-sm font-medium rounded ${
                  locked
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "text-white bg-primary hover:bg-primary/90"
                }`}
              >
                {test.name || `${t("courses.finalTest", "Final Test")} ${idx + 1}`}{" "}
                {locked && <FaLock className="inline ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVideoPlayer = () => {
    if (currentLesson) {
      return (
        <div>
          <div className="aspect-video">
            {currentLesson.video ? (
              <video
                src={currentLesson.video}
                controls
                className="w-full h-full"
                poster={currentLesson.image}
                onEnded={async () => {
                  if (isLoggedIn) {
                    try {
                      await updateLessonStatus(currentLesson.id);
                    } catch (error) {
                      console.error("Error on video end:", error);
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-accent">
                <div className="text-center">
                  <FaVideo className="mx-auto mb-2 text-4xl text-text-muted" />
                  <p className="text-text-muted">
                    {t("courses.videoNotAvailable", "Video not available")}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border">
            <h3 className="text-lg font-semibold text-text">
              {currentLesson.title}
            </h3>
            {isLoggedIn && currentLesson.video && (
              <div className="mt-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLessonComplete(currentLesson.id);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white rounded bg-primary hover:bg-primary/90"
                >
                  {t("courses.markCompleted", "Mark as Completed")}
                </button>
              </div>
            )}
            {currentLesson.description && (
              <div className="mt-2 text-sm text-text-secondary">
                <p className="leading-relaxed line-clamp-2">
                  {currentLesson.description}
                </p>
              </div>
            )}

            {renderContentAttachments(currentLesson, 'lesson')}

            {course.instructor && course.instructor.whatsapp && (
              <div className="p-3 mt-4 border rounded-lg bg-surface border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900">
                    <FaWhatsapp className="text-lg text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-text">
                      {t("courses.askInstructor", "Ask the Instructor")}
                    </h4>
                    <a
                      href={`https://wa.me/${course.instructor.whatsapp.replace(
                        /[^0-9]/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      {t("courses.contactInstructor", "Contact Instructor")}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else if (currentSection) {
      return (
        <div>
          <div className="aspect-video">
            {currentSection.video ? (
              <video
                src={currentSection.video}
                controls
                className="w-full h-full"
                poster={currentSection.images?.[0]}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-accent">
                <div className="text-center">
                  <FaVideo className="mx-auto mb-2 text-4xl text-text-muted" />
                  <p className="text-text-muted">
                    {t("courses.videoNotAvailable", "Video not available")}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border">
            <h3 className="text-lg font-semibold text-text">
              {currentSection.title}
            </h3>
            {currentSection.description && (
              <div className="mt-2 text-sm text-text-secondary">
                <p className="leading-relaxed line-clamp-3">
                  {currentSection.description}
                </p>
              </div>
            )}

            {renderContentAttachments(currentSection, 'section')}

            {currentSection.lessons && currentSection.lessons.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-3 font-semibold text-md text-text">
                  {t("courses.sectionLessons", "Section Lessons")} (
                  {currentSection.lessons.length})
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {currentSection.lessons.slice(0, 3).map((lesson, idx) => {
                    const isFree = lesson.type === "free" || lesson.type === "Free";
                    return (
                      <div
                        key={lesson.id || idx}
                        onClick={() => onLessonClick(lesson)}
                        className="flex items-center gap-3 p-3 transition-colors border rounded cursor-pointer hover:bg-accent"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isFree ? "bg-green-500" : "bg-primary"
                          }`}
                        ></div>
                        <span className="text-sm text-text">
                          {lesson.title}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            isFree
                              ? "bg-green-100 text-green-700"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {isFree
                            ? t("courses.free", "Free")
                            : t("courses.paid", "Paid")}
                        </span>
                      </div>
                    );
                  })}
                  {currentSection.lessons.length > 3 && (
                    <div className="text-center">
                      <span className="text-xs text-text-muted">
                        {t("courses.andMore", "And")} {currentSection.lessons.length - 3}{" "}
                        {t("courses.moreLessons", "more lessons")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center bg-accent aspect-video">
          <div className="text-center">
            <FaList className="mx-auto mb-4 text-6xl text-text-muted" />
            <p className="text-text-muted">
              {t("courses.selectContent", "Select a lesson or section to start")}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="space-y-6 lg:col-span-2">
        <div className="overflow-hidden border rounded-lg bg-surface border-border">
          {renderVideoPlayer()}
        </div>
        
        {renderInstructorCard()}
        {renderFinalTests()}
      </div>

      {/* Test Lock Modal */}
      <TestLockModal />
    </>
  );
};

export default VideoPlayerSection;