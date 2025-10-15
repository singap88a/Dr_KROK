import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../context/UserContext";
import i18n from "../../../i18n";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CourseHeader from "./CourseHeader";
import CourseContentSidebar from "./CourseContentSidebar";
import VideoPlayerSection from "./VideoPlayerSection";
import ImagePopup from "../Popups/ImagePopup";
import PDFPopup from "../Popups/PDFPopup";
import VideoPopup from "../Popups/VideoPopup";
import PurchaseModal from "../Popups/PurchaseModal";

export default function CourseLessons() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    getVideoCourseById,
    getCourseAccess,
    getCourseProgress,
    startLessonProgress,
    completeLessonProgress,
    getLessonProgress,
    getCourseProgressDetails,
    markLessonAsCompleted,
  } = useApi();
  const { isLoggedIn } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [sections, setSections] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [lessonStatuses, setLessonStatuses] = useState({});
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFilesPopup, setShowFilesPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [progressLoading] = useState(false);
  const [sectionProgress, setSectionProgress] = useState({});

  // دالة محسنة لحساب التقدم الكلي للدرس بناءً على النظام الجديد
  const calculateTotalProgress = useCallback((lesson, lessonStatus) => {
    if (!lessonStatus) return 0;

    if (
      lessonStatus.status === "completed" ||
      lessonStatus.progress_status === "completed"
    ) {
      return 100;
    }

    if (
      lessonStatus.percentage !== undefined &&
      lessonStatus.percentage !== null
    ) {
      return Math.min(100, Math.max(0, lessonStatus.percentage));
    }

    const hasVideo = !!lesson.video;
    const hasTests =
      lesson.lesson_end_tests && lesson.lesson_end_tests.length > 0;

    let totalProgress = 0;

    if (hasTests) {
      totalProgress = lessonStatus.quiz_percentage || 0;
    } else if (hasVideo) {
      totalProgress =
        lessonStatus.lesson_percentage >= 100 ||
        lessonStatus.status === "completed"
          ? 100
          : lessonStatus.lesson_percentage || 0;
    }

    return Math.min(100, totalProgress);
  }, []);

  // دالة محسنة لتحديث حالة الدرس
  const updateLessonStatus = useCallback(
    async (lessonId) => {
      if (!isLoggedIn) return;

      try {
        const [updatedCourseProgress, updatedLessonProgress] =
          await Promise.all([
            getCourseProgressDetails(id),
            getLessonProgress(id, lessonId),
          ]);

        if (updatedCourseProgress) {
          setCourseProgress(updatedCourseProgress);

          if (updatedCourseProgress.sections_progress) {
            const sectionProgressData = {};
            updatedCourseProgress.sections_progress.forEach((section) => {
              sectionProgressData[section.section_id] = section.progress;
            });
            setSectionProgress(sectionProgressData);
          }
        }

        if (updatedLessonProgress?.lesson) {
          setLessonStatuses((prev) => ({
            ...prev,
            [lessonId]: updatedLessonProgress.lesson,
          }));
        }
      } catch (error) {
        console.error(`Error updating lesson ${lessonId} status:`, error);
      }
    },
    [isLoggedIn, id, getCourseProgressDetails, getLessonProgress]
  );

  // دالة محسنة لإكمال الدرس - تحديث فوري للواجهة
  const handleLessonComplete = async (lessonId) => {
    let lesson = null;
    lesson = lessons.find((l) => l.id === lessonId);

    if (!lesson && sections.length > 0) {
      for (const section of sections) {
        if (section.lessons) {
          lesson = section.lessons.find((l) => l.id === lessonId);
          if (lesson) break;
        }
      }
    }

    if (!lesson && currentLesson && currentLesson.id === lessonId) {
      lesson = currentLesson;
    }

    if (!lesson) return;

    const hasVideo = !!lesson.video;
    const hasTests =
      lesson.lesson_end_tests && lesson.lesson_end_tests.length > 0;
    let newPercentage = 100;

    if (hasVideo && hasTests) {
      const currentStatus = lessonStatuses[lessonId] || {};
      const quizCompleted = currentStatus.quiz_percentage >= 100;
      newPercentage = quizCompleted ? 100 : 50;
    }

    setLessonStatuses((prev) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        percentage: newPercentage,
        status: newPercentage === 100 ? "completed" : "in_progress",
        lesson_percentage: hasVideo ? 100 : prev[lessonId]?.lesson_percentage || 0,
        quiz_percentage:
          hasTests && newPercentage === 100
            ? 100
            : prev[lessonId]?.quiz_percentage || 0,
      },
    }));

    try {
      const res = await markLessonAsCompleted(id, lessonId);
      if (res) {
        const updatedProgress = await getCourseProgressDetails(id);
        if (updatedProgress) {
          setCourseProgress(updatedProgress);

          if (updatedProgress.sections_progress) {
            const sectionProgressData = {};
            updatedProgress.sections_progress.forEach((section) => {
              sectionProgressData[section.section_id] = section.progress;
            });
            setSectionProgress(sectionProgressData);
          }
        }
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
      await updateLessonStatus(lessonId);
    }
  };

  // دالة لحساب تقدم القسم
  const calculateSectionProgress = useCallback(
    (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons || section.lessons.length === 0) {
        return 0;
      }

      let totalProgress = 0;
      let completedLessons = 0;

      section.lessons.forEach((lesson) => {
        const lessonStatus = lessonStatuses[lesson.id];
        const progress = calculateTotalProgress(lesson, lessonStatus);
        totalProgress += progress;
        if (progress === 100) {
          completedLessons++;
        }
      });

      const averageProgress = totalProgress / section.lessons.length;
      return {
        percentage: Math.round(averageProgress),
        completedLessons,
        totalLessons: section.lessons.length,
      };
    },
    [sections, lessonStatuses, calculateTotalProgress]
  );

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const courseData = await getVideoCourseById(id, isLoggedIn);
        if (!mounted) return;
        setCourse(courseData);
        setLessons(courseData.lessons || []);
        setSections(courseData.sections || []);

        const sectionsWithFreeLessons = new Set();
        if (courseData.sections) {
          courseData.sections.forEach((section) => {
            if (
              section.lessons &&
              section.lessons.some(
                (lesson) => lesson.type === "free" || lesson.type === "Free"
              )
            ) {
              sectionsWithFreeLessons.add(section.id);
            }
          });
        }
        setExpandedSections(sectionsWithFreeLessons);

        if (courseData?.lessons?.length) {
          const initialStatuses = {};
          courseData.lessons.forEach((lesson) => {
            if (lesson.percentage !== undefined || lesson.status) {
              initialStatuses[lesson.id] = {
                percentage: lesson.percentage || 0,
                status: lesson.status || "not_started",
                lesson_percentage: lesson.lesson_percentage || 0,
                quiz_percentage: lesson.quiz_percentage || 0,
              };
            }
          });
          setLessonStatuses(initialStatuses);
        }

        if (isLoggedIn) {
          try {
            const courseProgressDetails = await getCourseProgressDetails(id);
            if (courseProgressDetails) {
              setCourseProgress(courseProgressDetails);

              const updatedStatuses = { ...lessonStatuses };
              if (courseProgressDetails.sections_progress) {
                courseProgressDetails.sections_progress.forEach((section) => {
                  if (section.lessons) {
                    section.lessons.forEach((lesson) => {
                      if (lesson.lesson_id) {
                        updatedStatuses[lesson.lesson_id] = {
                          ...updatedStatuses[lesson.lesson_id],
                          percentage: lesson.percentage || 0,
                          status: lesson.status || "not_started",
                        };
                      }
                    });
                  }
                });

                const sectionProgressData = {};
                courseProgressDetails.sections_progress.forEach((section) => {
                  sectionProgressData[section.section_id] = section.progress;
                });
                setSectionProgress(sectionProgressData);
              }
              setLessonStatuses(updatedStatuses);
            }
          } catch (error) {
            console.log("Failed to load course progress details:", error);
            try {
              const oldProgress = await getCourseProgress(id);
              setCourseProgress(oldProgress);
            } catch {
              // ignore
            }
          }
        }

        if (isLoggedIn) {
          try {
            const access = await getCourseAccess(id);
            setHasAccess(access);
          } catch {
            setHasAccess(courseData.price === 0 || courseData.price === "0");
          }
        } else {
          setHasAccess(false);
        }

        if (courseData.sections && courseData.sections.length > 0) {
          let firstFreeContent = null;
          for (const section of courseData.sections) {
            if (section.lessons && section.lessons.length > 0) {
              const firstFreeLesson = section.lessons.find(
                (lesson) => lesson.type === "free" || lesson.type === "Free"
              );
              if (firstFreeLesson) {
                firstFreeContent = { type: "lesson", data: firstFreeLesson };
                break;
              }
            }
          }

          if (!firstFreeContent) {
            const firstSectionWithFree = courseData.sections.find(
              (section) =>
                section.lessons &&
                section.lessons.some(
                  (lesson) => lesson.type === "free" || lesson.type === "Free"
                )
            );
            if (firstSectionWithFree) {
              firstFreeContent = {
                type: "section",
                data: firstSectionWithFree,
              };
            }
          }

          if (!firstFreeContent && courseData.sections[0]) {
            firstFreeContent = {
              type: "section",
              data: courseData.sections[0],
            };
          }

          if (firstFreeContent) {
            if (firstFreeContent.type === "lesson") {
              setCurrentLesson(firstFreeContent.data);
              if (isLoggedIn) {
                try {
                  const res = await startLessonProgress(
                    id,
                    firstFreeContent.data.id
                  );
                  if (res?.course_progress)
                    setCourseProgress(res.course_progress);
                  if (res?.lesson) {
                    setLessonStatuses((prev) => ({
                      ...prev,
                      [firstFreeContent.data.id]: {
                        ...prev[firstFreeContent.data.id],
                        ...res.lesson,
                      },
                    }));
                  }
                } catch {
                  /* noop */
                }
              }
            } else if (firstFreeContent.type === "section") {
              setCurrentSection(firstFreeContent.data);
            }
          }
        } else if (courseData.lessons && courseData.lessons.length > 0) {
          const firstFreeLesson = courseData.lessons.find(
            (lesson) => lesson.type === "free" || lesson.type === "Free"
          );
          if (firstFreeLesson) {
            setCurrentLesson(firstFreeLesson);
            if (isLoggedIn) {
              try {
                const res = await startLessonProgress(id, firstFreeLesson.id);
                if (res?.course_progress)
                  setCourseProgress(res.course_progress);
                if (res?.lesson) {
                  setLessonStatuses((prev) => ({
                    ...prev,
                    [firstFreeLesson.id]: {
                      ...prev[firstFreeLesson.id],
                      ...res.lesson,
                    },
                  }));
                }
              } catch {
                /* noop */
              }
            }
          }
        }
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load course lessons");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    const handleLanguageChange = () => {
      loadData();
    };
    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      mounted = false;
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [
    id,
    getVideoCourseById,
    getCourseAccess,
    getCourseProgress,
    getCourseProgressDetails,
    startLessonProgress,
    getLessonProgress,
    isLoggedIn,
    updateLessonStatus,
  ]);

  useEffect(() => {
    const s = location.state || {};
    if (s.lessonCompleted && s.lessonId && isLoggedIn) {
      (async () => {
        try {
          await updateLessonStatus(s.lessonId);
        } catch (error) {
          console.error("Error updating lesson status after quiz:", error);
        }
      })();
    } else if (s.courseCompleted && isLoggedIn) {
      (async () => {
        try {
          const updatedProgress = await getCourseProgressDetails(id);
          setCourseProgress(updatedProgress);
        } catch (error) {
          console.error("Error updating course progress:", error);
        }
      })();
    }
  }, [
    location.state,
    id,
    isLoggedIn,
    getCourseProgressDetails,
    updateLessonStatus,
  ]);

  const handleLessonClick = async (lesson) => {
    const isFree = lesson.type === "free" || lesson.type === "Free";
    if (!isFree) {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      setShowPurchaseModal(true);
      return;
    }

    setCurrentLesson(lesson);
    setCurrentSection(null);
    if (isLoggedIn) {
      try {
        const res = await startLessonProgress(id, lesson.id);
        if (res?.course_progress) setCourseProgress(res.course_progress);
        if (res?.lesson) {
          setLessonStatuses((prev) => ({
            ...prev,
            [lesson.id]: {
              ...prev[lesson.id],
              ...res.lesson,
            },
          }));
        }
      } catch {
        // ignore
      }
    }
  };

  const handleSectionClick = (section) => {
    const hasFree = hasFreeLessons(section.id);
    if (!hasFree && !hasAccess) {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      setShowPurchaseModal(true);
      return;
    }

    setCurrentSection(section);
    setCurrentLesson(null);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const hasFreeLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons) return false;
      return section.lessons.some(
        (lesson) => lesson.type === "free" || lesson.type === "Free"
      );
    };
  }, [sections]);

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
  };

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
          {t("common.error", "Error")}:{" "}
          {error || t("courses.courseNotFound", "Course not found.")}
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
          progressLoading={progressLoading}
          hasAccess={hasAccess}
          onPurchaseClick={() => setShowPurchaseModal(true)}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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

          <VideoPlayerSection
            currentLesson={currentLesson}
            currentSection={currentSection}
            course={course}
            courseProgress={courseProgress}
            isLoggedIn={isLoggedIn}
            lessonStatuses={lessonStatuses}
            onLessonComplete={handleLessonComplete}
            onFileClick={handleFileClick}
            onVideoClick={handleVideoClick}
            onImageClick={(image) => {
              setSelectedImage(image);
              setShowImagePopup(true);
            }}
            updateLessonStatus={updateLessonStatus}
            navigate={navigate}
          />
        </div>
      </div>

      <PurchaseModal
        show={showPurchaseModal}
        onClose={closePurchaseModal}
        courseId={id}
      />

      <ImagePopup
        show={showImagePopup}
        image={selectedImage}
        onClose={() => setShowImagePopup(false)}
      />

      <PDFPopup
        show={showFilesPopup}
        file={selectedFile}
        onClose={() => setShowFilesPopup(false)}
      />

      <VideoPopup
        show={showVideoPopup}
        video={selectedVideo}
        onClose={() => setShowVideoPopup(false)}
      />
    </section>
  );
}