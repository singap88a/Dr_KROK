import React from "react";
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
  FaLock
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
  navigate
}) => {
  const { t } = useTranslation();

  const getVideoRelatedArray = (videoRelated) => {
    if (!videoRelated) return [];
    if (Array.isArray(videoRelated)) return videoRelated;
    return [videoRelated];
  };

  const renderContentAttachments = (content, type) => {
    const isLesson = type === 'lesson';
    
    return (
      <div className="mt-4">
        <h4 className="mb-3 font-semibold text-md text-text">
          {t(isLesson ? "courses.lessonAttachments" : "courses.sectionAttachments", 
             isLesson ? "Lesson Attachments" : "Section Attachments")}
        </h4>

        {content.images && content.images.length > 0 && (
          <div className="mb-4">
            <h5 className="mb-2 text-sm font-medium text-text">
              {t("courses.images", "Images")}
            </h5>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {content.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${type} image ${idx + 1}`}
                  className="object-cover w-full h-32 rounded cursor-pointer"
                  style={{
                    width: "100%",
                    height: "128px",
                    objectFit: "cover",
                  }}
                  onClick={() => onImageClick(img)}
                />
              ))}
            </div>
          </div>
        )}

        {content.files && content.files.length > 0 && (
          <div className="mb-4">
            <h5 className="mb-2 text-sm font-medium text-text">
              {t("courses.files", "Files")}
            </h5>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {content.files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => onFileClick(file.url || file)}
                  className="flex flex-col items-center p-3 transition-colors border rounded hover:bg-accent"
                >
                  <FaFileAlt className="mb-2 text-2xl text-primary" />
                  <span className="text-xs text-center text-text">
                    {file.name || `${t("courses.file", "File")} ${idx + 1}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {content.video_related && (
          <div className="mb-4">
            <h5 className="mb-2 text-sm font-medium text-text">
              {t("courses.additionalVideos", "Additional Videos")}
            </h5>
            <div className="grid grid-cols-1 gap-3">
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
                    className="flex items-center gap-4 p-4 transition-all border rounded-lg cursor-pointer group hover:bg-accent hover:border-primary/50"
                    onClick={() => onVideoClick(video)}
                  >
                    <div className="relative flex-shrink-0 w-24 h-16 overflow-hidden rounded-lg">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={`Additional video ${idx + 1}`}
                          className="object-cover w-full h-full"
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
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full bg-opacity-90">
                          <FaPlay className="text-gray-700 text-xs ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FaVideo className="text-sm text-primary" />
                        <span className="text-sm font-medium text-text">
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
          <div className="mb-2">
            <h5 className="mb-2 text-sm font-medium text-text">
              {t("courses.lessonTests", "Lesson Tests")}
            </h5>
            <div className="flex flex-wrap gap-2">
              {content.lesson_end_tests.map((test, idx) => (
                <button
                  key={test.id || idx}
                  onClick={() =>
                    navigate(`/courses/${course.id}/test/lesson/${test.id}`, {
                      state: {
                        course,
                        test,
                        lessonId: content.id,
                      },
                    })
                  }
                  className="px-3 py-2 text-xs font-medium border rounded bg-accent hover:border-primary border-border"
                >
                  {test.name || `${t("courses.test", "Test")} ${idx + 1}`}
                </button>
              ))}
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
              className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
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
                onClick={() =>
                  !locked &&
                  navigate(`/courses/${course.id}/test/final/${test.id}`, {
                    state: { course, test },
                  })
                }
                disabled={locked}
                className={`px-4 py-2 text-sm font-medium rounded ${
                  locked
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "text-white bg-primary hover:bg-secondary"
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
                      const currentStatus = lessonStatuses[currentLesson.id] || {};
                      const hasTests =
                        currentLesson.lesson_end_tests &&
                        currentLesson.lesson_end_tests.length > 0;

                      let newPercentage = 100;

                      if (hasTests) {
                        const quizCompleted = currentStatus.quiz_percentage >= 100;
                        newPercentage = quizCompleted ? 100 : 50;
                      }

                      // تحديث فوري للواجهة
                      // سيتم التعامل مع هذا في المكون الرئيسي عبر onLessonComplete
                      
                      const res = await completeLessonProgress(
                        course.id,
                        currentLesson.id,
                        "lesson"
                      );
                      
                      // Refresh from server
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
                  className="px-4 py-2 text-sm font-medium text-white rounded bg-primary hover:bg-secondary"
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
    <div className="space-y-6 lg:col-span-2">
      <div className="overflow-hidden border rounded-lg bg-surface border-border">
        {renderVideoPlayer()}
      </div>
      
      {renderInstructorCard()}
      {renderFinalTests()}
    </div>
  );
};

// نضيف هذه الدالة مؤقتاً حتى لا يحدث خطأ
const completeLessonProgress = async (courseId, lessonId, type) => {
  // سيتم استدعاء API الحقيقي من خلال context
  return Promise.resolve();
};

export default VideoPlayerSection;