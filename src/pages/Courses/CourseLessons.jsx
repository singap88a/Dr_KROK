import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import i18n from "../../i18n";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  FaPlay,
  FaLock,
  FaCheck,
  FaClock,
  FaBookOpen,
  FaArrowLeft,
  FaVideo,
  FaFileAlt,
  FaDownload,
  FaStar,
  FaShoppingCart,
  FaEye,
  FaRegStar,
  FaUser,
  FaGraduationCap,
  FaCalendarAlt,
  FaLanguage,
  FaLevelUpAlt,
  FaUsers,
  FaStar as FaStarSolid,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTelegram,
  FaWhatsapp,
} from "react-icons/fa";

export default function CourseLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getVideoCourseById, getCourseAccess } = useApi();
  const { isLoggedIn } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  // Removed unused state variables for description toggle as title and description moved below video

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Load course details (includes lessons) with auth token if logged in
        const courseData = await getVideoCourseById(id, isLoggedIn);
        if (!mounted) return;
        setCourse(courseData);
        setLessons(courseData.lessons || []);

        // Check access if logged in
        if (isLoggedIn) {
          try {
            const access = await getCourseAccess(id);
            setHasAccess(access);
          } catch {
            // If access check fails, assume no access for paid content
            setHasAccess(courseData.price === 0 || courseData.price === "0");
          }
        } else {
          // Not logged in, only free content accessible
          setHasAccess(false);
        }

        // Set first free lesson as current if available
        if (courseData.lessons && courseData.lessons.length > 0) {
          const firstFreeLesson = courseData.lessons.find(lesson => lesson.type === "free" || lesson.type === "Free");
          if (firstFreeLesson) {
            setCurrentLesson(firstFreeLesson);
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

    // Listen for language changes to re-fetch data
    const handleLanguageChange = () => {
      loadData();
    };
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      mounted = false;
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [id, getVideoCourseById, getCourseAccess, isLoggedIn, i18n]);

  // Sort lessons: free first, then paid
  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      const aFree = a.type === "free" || a.type === "Free";
      const bFree = b.type === "free" || b.type === "Free";
      if (aFree && !bFree) return -1;
      if (!aFree && bFree) return 1;
      return (a.id || 0) - (b.id || 0);
    });
  }, [lessons]);

  const handleLessonClick = (lesson) => {
    const isFree = lesson.type === "free" || lesson.type === "Free";
    if (!isFree) {
      // Show purchase modal for paid lessons
      if (!isLoggedIn) {
        navigate('/login');
        return;
      }
      setShowPurchaseModal(true);
      return;
    }

    // Set current lesson for sidebar video player
    setCurrentLesson(lesson);
  };

  const handleLessonComplete = (lessonId) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-sm text-text-muted" />);
      }
    }
    return stars;
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !course) {
    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-text">
        <div className="text-red-600">{t("common.error", "Error")}: {error || t("courses.courseNotFound", "Course not found.")}</div>
        <Link to="/courses" className="px-4 py-2 text-white rounded-lg bg-primary hover:bg-secondary">
          {t("courses.backToCourses", "Back to Courses")}
        </Link>
      </section>
    );
  }

  return (

    <section className="min-h-screen py-10 bg-background text-text dark:bg-background dark:text-text">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/courses/${id}`}
            className="inline-flex items-center gap-2 mb-4 transition-colors text-primary hover:text-secondary"
          >
            <FaArrowLeft />
            <span>{t('courses.backToCourse', 'Back to Course')}</span>
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>

              {/* Current Lesson Title and Description */}
              {/* Removed from here as per user request */}
              {/* {currentLesson && (
                <div className="mb-4">
                  <h2 className="mb-2 text-xl font-bold text-text">{currentLesson.title}</h2>
                  {currentLesson.description && (
                    <div className="text-sm text-text-secondary">
                      <p className={`leading-relaxed ${!showFullDescription ? 'line-clamp-2' : ''}`}>
                        {currentLesson.description}
                      </p>
                      {currentLesson.description.length > 100 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="mt-1 text-xs font-medium transition-colors text-primary hover:text-secondary"
                        >
                          {showFullDescription ? t('common.showLess', 'Show less') : t('common.showMore', 'Show more')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )} */}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaBookOpen className="text-primary" />
                  <span>{lessons.length} {t('courses.lessons', 'Lessons')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-primary" />
                  <span>{course.enrolled_count || 0} {t('courses.students', 'Students')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(course.avg_rating || 0)}
                  </div>
                  <span className="text-sm">
                    {(course.avg_rating || 0).toFixed(1)} ({course.ratings_count || 0})
                  </span>
                </div>
              </div>

              {/* Course Level & Language */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
                <span className="px-3 py-1 text-xs font-semibold border rounded-full bg-surface border-border">
                  {course.language}
                </span>
                {course.category && (
                  <span className="px-3 py-1 text-xs font-semibold border rounded-full text-primary bg-primary/10 border-primary/20">
                    {course.category.name}
                  </span>
                )}
              </div>
            </div>

            {/* Price & Enroll */}
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    ${
                      (Number(course.discount) > 0
                        ? (Number(course.price) - Number(course.discount))
                        : Number(course.price)
                      ).toFixed(2)
                    }
                  </span>
                  {Number(course.discount) > 0 && (
                    <>
                      <span className="text-lg line-through text-text-muted">${Number(course.price).toFixed(2)}</span>
                      <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded">
                        {Math.round((Number(course.discount) / Number(course.price)) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              {!hasAccess && (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="px-6 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r bg-primary to-secondary hover:shadow-lg hover:scale-105"
                >
                  {t('courses.enrollNow', 'Enroll Now')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Lessons List */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-lg font-semibold">{t('courses.courseContent', 'Course Content')}</h3>

            <div className="space-y-2">
              {sortedLessons.map((lesson, index) => {
                const isFree = lesson.type === "free" || lesson.type === "Free";
                // If API returns "free" for a lesson, it means user has access to it
                // If API returns "paid", it means user doesn't have access
                const isAccessible = isFree;
                const isCompleted = completedLessons.has(lesson.id);
                const isActive = currentLesson?.id === lesson.id;

                return (
                  <div
                    key={lesson.id || index}
                    onClick={() => handleLessonClick(lesson)}
                    className={`relative p-4 transition-all border rounded-lg cursor-pointer group hover:shadow-md ${
                      isActive
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-surface border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Lesson Number & Status */}
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isActive
                            ? 'bg-primary text-white'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : isAccessible
                            ? 'bg-accent text-text'
                            : 'bg-accent text-text-muted'
                        }`}>
                          {isCompleted ? <FaCheck className="text-xs" /> : index + 1}
                        </div>
                        {index < sortedLessons.length - 1 && (
                          <div className="w-px h-6 bg-border"></div>
                        )}
                      </div>

                      {/* Lesson Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium line-clamp-1 ${
                              isActive ? 'text-primary' : 'text-text'
                            }`}>
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                              {lesson.video && <FaVideo />}
                              {lesson.file && <FaFileAlt />}
                              <span>{isFree ? t('courses.free', 'Free') : t('courses.paid', 'Paid')}</span>
                              {lesson.duration && (
                                <>
                                  <span>•</span>
                                  <span>{lesson.duration}min</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Lock Icon */}
                          {!isAccessible && (
                            <FaLock className="ml-2 text-text-muted" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Video Player & Instructor */}
          <div className="space-y-6 lg:col-span-2">
            {/* Video Player */}
            <div className="overflow-hidden border rounded-lg bg-surface border-border">
              {currentLesson ? (
                <div>
                  <div className="aspect-video">
                    {currentLesson.video ? (
                      <video
                        src={currentLesson.video}
                        controls
                        className="w-full h-full"
                        poster={currentLesson.image}
                        onEnded={() => handleLessonComplete(currentLesson.id)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-accent">
                        <div className="text-center">
                          <FaVideo className="mx-auto mb-2 text-4xl text-text-muted" />
                          <p className="text-text-muted">{t('courses.videoNotAvailable', 'Video not available')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-text">{currentLesson.title}</h3>
                    {currentLesson.description && (
                      <div className="mt-2 text-sm text-text-secondary">
                        <p className="leading-relaxed line-clamp-2">
                          {currentLesson.description}
                        </p>
                      </div>
                    )}
                  </div>
                  {currentLesson.file && (
                    <div className="p-4 border-t border-border">
                      <a
                        href={currentLesson.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg text-primary bg-primary/10 hover:bg-primary/20"
                      >
                        <FaDownload />
                        {t('courses.downloadMaterials', 'Download Materials')}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center bg-accent aspect-video">
                  <div className="text-center">
                    <FaPlay className="mx-auto mb-4 text-6xl text-text-muted" />
                    <p className="text-text-muted">{t('courses.selectLesson', 'Select a lesson to start watching')}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Instructor Card */}
            {course.instructor && (
              <div className="p-6 border rounded-lg bg-surface border-border">
                <h3 className="mb-4 text-lg font-semibold text-text">{t('courses.instructor', 'Instructor')}</h3>

                <div className="flex items-start gap-4">
                  <img
                    src={course.instructor.image || '/placeholder-instructor.jpg'}
                    alt={course.instructor.name}
                    className="object-cover w-16 h-16 border-2 rounded-full border-primary"
                  />

                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-text">{course.instructor.name}</h4>
                    <p className="mb-2 font-medium text-primary">{course.instructor.job_title}</p>

                    <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <FaGraduationCap />
                        <span>{course.instructor.years_of_experience} {t('courses.yearsExp', 'years experience')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaStarSolid className="text-yellow-400" />
                        <span>{(course.instructor.average_rating || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="mb-4 text-sm leading-relaxed text-text line-clamp-3">
                      {course.instructor.bio}
                    </p>

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-2">
                      {course.instructor.facebook && (
                        <a
                          href={course.instructor.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700"
                        >
                          <FaFacebook className="text-xs" />
                        </a>
                      )}
                      {course.instructor.instagram && (
                        <a
                          href={course.instructor.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 text-white transition-colors bg-pink-600 rounded-full hover:bg-pink-700"
                        >
                          <FaInstagram className="text-xs" />
                        </a>
                      )}
                      {course.instructor.youtube && (
                        <a
                          href={course.instructor.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 text-white transition-colors bg-red-600 rounded-full hover:bg-red-700"
                        >
                          <FaYoutube className="text-xs" />
                        </a>
                      )}
                      {course.instructor.telegram && (
                        <a
                          href={course.instructor.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 text-white transition-colors bg-blue-500 rounded-full hover:bg-blue-600"
                        >
                          <FaTelegram className="text-xs" />
                        </a>
                      )}
                      {course.instructor.whatsapp && (
                        <a
                          href={`https://wa.me/${course.instructor.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 text-white transition-colors bg-green-600 rounded-full hover:bg-green-700"
                        >
                          <FaWhatsapp className="text-xs" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ask the Instructor Section */}
            {course.instructor && course.instructor.whatsapp && (
              <div className="p-6 border rounded-lg bg-surface border-border">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full dark:bg-green-900">
                    <FaWhatsapp className="text-2xl text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold text-text">{t('courses.askInstructor', 'Ask the Instructor')}</h3>
                    <p className="mb-4 text-sm text-text-muted">
                      {t('courses.askInstructorDescription', 'Have a question about this course? Contact the instructor directly through WhatsApp for personal assistance.')}
                    </p>
                    <a
                      href={`https://wa.me/${course.instructor.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <FaWhatsapp />
                      {t('courses.contactInstructor', 'Contact Instructor')}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md border rounded-lg shadow-xl bg-surface border-border">
            <div className="p-6">
              <div className="mb-6 text-center">
                <FaShoppingCart className="mx-auto mb-4 text-4xl text-primary" />
                <h3 className="mb-2 text-2xl font-semibold text-text">{t('courses.unlockPremium', 'Unlock Premium Content')}</h3>
                <p className="text-text-muted">
                  {t('courses.purchaseToAccess', 'Purchase this course to access all premium lessons and materials')}
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to={`/courses/${id}/subscribe`}
                  className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
                >
                  <FaShoppingCart />
                  {t('courses.purchaseNow', 'Purchase Now')}
                </Link>
                <button
                  onClick={closePurchaseModal}
                  className="w-full px-6 py-3 transition-colors bg-gray-200 rounded-lg text-text hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
