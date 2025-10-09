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
  FaImage,
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
  FaTimes,
} from "react-icons/fa";

export default function CourseLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getVideoCourseById, getCourseAccess, getCourseProgress, startLessonProgress, completeLessonProgress } = useApi();
  const { isLoggedIn } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFilesPopup, setShowFilesPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  // test state removed; navigation to dedicated test page

  // No modal timer; tests open in dedicated page

  // Image Popup Modal
  const ImagePopup = () => {
    if (!showImagePopup || !selectedImage) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={() => setShowImagePopup(false)}
      >
        <img
          src={selectedImage}
          alt="Selected lesson"
          className="max-w-full max-h-full rounded-lg shadow-lg"
          style={{ width: '600px', height: '400px', objectFit: 'contain' }}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={() => setShowImagePopup(false)}
          className="absolute text-3xl font-bold text-white top-4 right-4"
          aria-label="Close image popup"
        >
          &times;
        </button>
      </div>
    );
  };

  // PDF Popup Modal
  const PDFPopup = () => {
    if (!showFilesPopup || !selectedFile) return null;
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={() => setShowFilesPopup(false)}
      >
        <div 
          className="w-full max-w-4xl p-6 mx-4 rounded-lg dark:bg-gray-800 h-4/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            {/* <h3 className="text-lg font-semibold text-text">{t('courses.pdfViewer', 'PDF Viewer')}</h3> */}
            <button
              onClick={() => setShowFilesPopup(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={t('common.close', 'Close')}
            >
              <FaTimes className="text-xl text-teal-50" />
            </button>
          </div>
          <div className="h-full border rounded-lg">
            <iframe
              src={selectedFile}
              className="w-full h-full rounded-lg"
              title="PDF Viewer"
            />
          </div>
        </div>
      </div>
    );
  };

  // Video Popup Modal
  const VideoPopup = () => {
    if (!showVideoPopup || !selectedVideo) return null;
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={() => setShowVideoPopup(false)}
      >
        <div 
          className="w-full max-w-4xl p-4 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text">{t('courses.additionalVideo', 'Additional Video')}</h3>
            <button
              onClick={() => setShowVideoPopup(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={t('common.close', 'Close')}
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <div className="aspect-video">
            <video
              src={selectedVideo}
              controls
              className="w-full h-full rounded"
              autoPlay
            />
          </div>
        </div>
      </div>
    );
  };

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
          // Fetch course progress
          try {
            setProgressLoading(true);
            const progress = await getCourseProgress(id);
            setCourseProgress(progress);
          } catch {
            // ignore
          } finally {
            setProgressLoading(false);
          }
        } else {
          // Not logged in, only free content accessible
          setHasAccess(false);
        }

        // Load locally completed lessons
        try {
          const listKey = `course_${id}_completed_lessons`;
          const raw = localStorage.getItem(listKey);
          const arr = raw ? JSON.parse(raw) : [];
          if (Array.isArray(arr)) setCompletedLessons(new Set(arr.map(Number)));
        } catch { /* noop */ }

        // Set first free lesson as current if available
        if (courseData.lessons && courseData.lessons.length > 0) {
          const firstFreeLesson = courseData.lessons.find(lesson => lesson.type === "free" || lesson.type === "Free");
          if (firstFreeLesson) {
            setCurrentLesson(firstFreeLesson);
            // Fire start progress when opening first free lesson for logged-in users
            if (isLoggedIn) {
              try {
                const res = await startLessonProgress(id, firstFreeLesson.id);
                if (res?.course_progress) setCourseProgress(res.course_progress);
              } catch { /* noop */ }
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

    // Listen for language changes to re-fetch data
    const handleLanguageChange = () => {
      loadData();
    };
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      mounted = false;
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [id, getVideoCourseById, getCourseAccess, getCourseProgress, startLessonProgress, isLoggedIn]);

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

  const handleLessonClick = async (lesson) => {
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
    if (isLoggedIn) {
      try {
        const res = await startLessonProgress(id, lesson.id);
        if (res?.course_progress) setCourseProgress(res.course_progress);
      } catch {
        // ignore
      }
    }
  };

  const handleLessonComplete = async (lessonId) => {
    // require lesson test pass before allowing manual completion
    try {
      const passedKey = `course_${id}_lesson_test_passed_${lessonId}`;
      const passed = localStorage.getItem(passedKey) === '1';
      if (!passed) {
        alert(t('courses.passLessonTestFirst', 'Please pass the lesson test first.'));
        return;
      }
    } catch { /* noop */ }

    setCompletedLessons(prev => new Set([...prev, lessonId]));
    try {
      const listKey = `course_${id}_completed_lessons`;
      const raw = localStorage.getItem(listKey);
      const set = new Set((raw ? JSON.parse(raw) : []).map(Number));
      set.add(Number(lessonId));
      localStorage.setItem(listKey, JSON.stringify(Array.from(set)));
    } catch { /* noop */ }
    if (isLoggedIn) {
      try {
        const res = await completeLessonProgress(id, lessonId);
        if (res?.course_progress) setCourseProgress(res.course_progress);
      } catch {
        // ignore
      }
    }
  };

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

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaBookOpen className="text-primary" />
                  <span>{lessons.length} {t('courses.lessons', 'Lessons')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-primary" />
                  <span>{course.enrolled_count || 0} {t('courses.students', 'Students')}</span>
                </div>
              {isLoggedIn && (
                <div className="flex items-center gap-2">
                  <FaClock className="text-primary" />
                  <span>
                    {t('courses.progress', 'Progress')}: {progressLoading ? '...' : `${Math.round(courseProgress?.percentage || 0)}%`}
                  </span>
                </div>
              )}
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

              {isLoggedIn && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="text-text-muted">{t('courses.overallProgress', 'Overall Progress')}</span>
                    <span className="font-medium">{Math.round(courseProgress?.percentage || 0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-accent">
                    <div
                      className={`h-2 rounded-full ${Math.round(courseProgress?.percentage || 0) === 100 ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, Math.max(0, Math.round(courseProgress?.percentage || 0)))}%` }}
                    />
                  </div>
                  {Math.round(courseProgress?.percentage || 0) === 100 && (
                    <div className="inline-block px-2 py-1 mt-2 text-xs font-semibold text-green-700 bg-green-100 rounded">
                      {t('courses.completed', 'Completed')}
                    </div>
                  )}
                </div>
              )}
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
                                {lesson.images && lesson.images.length > 0 && <FaImage />}
                                {lesson.files && lesson.files.length > 0 && <FaFileAlt />}
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
                        {isCompleted && (
                          <div className="mt-2 text-xs font-medium text-green-600">
                            {t('courses.lessonCompleted', 'Lesson Completed')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Final Tests Under Course Content */}
              {course.final_tests && course.final_tests.length > 0 && (
                <div className="p-4 mt-4 border rounded-lg bg-surface border-border">
                  <div className="mb-2 text-sm font-semibold text-text">
                    {t('courses.finalTests', 'Final Tests')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {course.final_tests.map((test, idx) => (
                      <button
                        key={test.id || idx}
                        onClick={() => navigate(`/courses/${id}/test/final/${test.id}`, { state: { course, test } })}
                        className="px-3 py-2 text-xs font-medium text-white rounded bg-primary hover:bg-secondary"
                      >
                        {test.name || `${t('courses.finalTest', 'Final Test')} ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                      // removed auto-complete on video end; completion gated by test pass
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
                  {isLoggedIn && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleLessonComplete(currentLesson.id)}
                        className="px-4 py-2 text-sm font-medium text-white rounded bg-primary hover:bg-secondary"
                      >
                        {t('courses.markCompleted', 'Mark as Completed')}
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
                    
                    {/* Lesson Attachments */}
                    {(currentLesson.images && currentLesson.images.length > 0) || 
                     (currentLesson.files && currentLesson.files.length > 0) || 
                     (currentLesson.video_related && currentLesson.video_related.length > 0) ? (
                      <div className="mt-4">
                        <h4 className="mb-3 font-semibold text-md text-text">
                          {t('courses.lessonAttachments', 'Lesson Attachments')}
                        </h4>
                        
                        {/* Image Gallery */}
                        {currentLesson.images && currentLesson.images.length > 0 && (
                          <div className="mb-4">
                            <h5 className="mb-2 text-sm font-medium text-text">{t('courses.images', 'Images')}</h5>
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                              {currentLesson.images.map((img, idx) => (
                                <img 
                                  key={idx} 
                                  src={img} 
                                  alt={`Lesson image ${idx + 1}`} 
                                  className="object-cover w-full h-32 rounded cursor-pointer" 
                                  style={{ width: '100%', height: '128px', objectFit: 'cover' }}
                                  onClick={() => { setSelectedImage(img); setShowImagePopup(true); }} 
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* File Gallery */}
                        {currentLesson.files && currentLesson.files.length > 0 && (
                          <div className="mb-4">
                            <h5 className="mb-2 text-sm font-medium text-text">{t('courses.files', 'Files')}</h5>
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                              {currentLesson.files.map((file, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleFileClick(file)}
                                  className="flex flex-col items-center p-3 transition-colors border rounded hover:bg-accent"
                                >
                                  <FaFileAlt className="mb-2 text-2xl text-primary" />
                                  <span className="text-xs text-center text-text">
                                    {t('courses.file', 'File')} {idx + 1}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Additional Videos */}
                        {currentLesson.video_related && currentLesson.video_related.length > 0 && (
                          <div className="mb-4">
                            <h5 className="mb-2 text-sm font-medium text-text">{t('courses.additionalVideos', 'Additional Videos')}</h5>
                            <div className="grid grid-cols-1 gap-3">
                              {currentLesson.video_related.map((video, idx) => {
                                const isObj = typeof video === 'object' && video !== null;
                                const videoUrl = isObj ? (video.url || video.src || video.video || '') : video;
                                const thumbnail = isObj ? (video.thumbnail || video.poster || video.image || '') : '';
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 p-4 transition-all border rounded-lg cursor-pointer group hover:bg-accent hover:border-primary/50"
                                    onClick={() => handleVideoClick(video)}
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
                                          {t('courses.additionalVideo', 'Additional Video')} {idx + 1}
                                        </span>
                                      </div>
                                      <p className="text-xs text-text-muted">
                                        {t('courses.clickToWatch', 'Click to watch this video')}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Lesson-End Tests */}
                        {currentLesson.lesson_end_tests && currentLesson.lesson_end_tests.length > 0 && (
                          <div className="mb-2">
                            <h5 className="mb-2 text-sm font-medium text-text">{t('courses.lessonTests', 'Lesson Tests')}</h5>
                            <div className="flex flex-wrap gap-2">
                              {currentLesson.lesson_end_tests.map((test, idx) => (
                                <button
                                  key={test.id || idx}
                                  onClick={() => navigate(`/courses/${id}/test/lesson/${test.id}`, { state: { course, test, lessonId: currentLesson.id } })}
                                  className="px-3 py-2 text-xs font-medium border rounded bg-accent hover:border-primary border-border"
                                >
                                  {test.name || `${t('courses.test', 'Test')} ${idx + 1}`}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                    
                    {/* Ask the Instructor */}
                    {course.instructor && course.instructor.whatsapp && (
                      <div className="p-3 mt-4 border rounded-lg bg-surface border-border">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900">
                            <FaWhatsapp className="text-lg text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-text">{t('courses.askInstructor', 'Ask the Instructor')}</h4>
                            <a
                              href={`https://wa.me/${course.instructor.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:text-green-700"
                            >
                              {t('courses.contactInstructor', 'Contact Instructor')}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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

                    {/* View Details Button */}
                    <Link
                      to={`/instructors/${course.instructor.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
                    >
                      {t("instructors.viewDetails", "View Details")}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Final Tests Section */}
            {course.final_tests && course.final_tests.length > 0 && (
              <div className="p-6 border rounded-lg bg-surface border-border">
                <h3 className="mb-3 text-lg font-semibold text-text">{t('courses.finalTests', 'Final Tests')}</h3>
                <div className="flex flex-wrap gap-2">
                  {course.final_tests.map((test, idx) => (
                    <button
                      key={test.id || idx}
                      onClick={() => navigate(`/courses/${id}/test/final/${test.id}`, { state: { course, test } })}
                      className="px-4 py-2 text-sm font-medium text-white rounded bg-primary hover:bg-secondary"
                    >
                      {test.name || `${t('courses.finalTest', 'Final Test')} ${idx + 1}`}
                    </button>
                  ))}
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

      {/* Image Popup */}
      <ImagePopup />

      {/* PDF Popup */}
      <PDFPopup />

      {/* Video Popup */}
      <VideoPopup />

      {/* Test Modal removed in favor of dedicated page */}
    </section>
  );
}