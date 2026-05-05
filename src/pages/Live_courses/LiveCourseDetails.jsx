import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaUser,
  FaClock,
  FaUsers,
  FaCertificate,
  FaGlobe,
  FaLayerGroup,
  FaVideo,
  FaStar,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaBook,
  FaChalkboardTeacher,
  FaLaptopCode,
  FaPlay,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTelegram,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaBriefcase,
  FaUserGraduate,
  FaCalendarAlt,
  FaImage,
  FaHourglassHalf,
  FaPercentage,
} from "react-icons/fa";

import { useParams, Link, useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { useUser } from "../../context/UserContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import LeaveReview from "../../components/Courses/LeaveReview.jsx";
import TopStudentsSlider from "../../components/Common/TopStudentsSlider";

export default function LiveCourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getLiveCourseById, getCourseAccess } = useApi();
  const { userData, isLoggedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userHasAccess, setUserHasAccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getLiveCourseById(id, isLoggedIn);
        if (!mounted) return;
        setCourse(data);

        // Set reviews from course data
        if (data.ratings && Array.isArray(data.ratings)) {
          setReviews(data.ratings);
        }

        // Check course access and expiration
        if (data.enrollment_status) {
          const { is_enrolled, is_expired: expired } = data.enrollment_status;
          setIsExpired(expired === true);
          setUserHasAccess(is_enrolled === true && expired === false);
        } else if (isLoggedIn) {
          try {
            const access = await getCourseAccess(id, 'live_course');
            // access can be a boolean or an object { is_enrolled, is_expired }
            if (access && typeof access === 'object') {
              const enrolled = access.is_enrolled === true;
              const expired  = access.is_expired  === true;
              setIsExpired(expired);
              setUserHasAccess(enrolled && !expired);
            } else {
              setIsExpired(false);
              setUserHasAccess(!!access);
            }
          } catch {
            // If access check fails, assume no access for paid content
            setIsExpired(false);
            setUserHasAccess(data.price === 0 || data.price === "0");
          }
        } else {
          setIsExpired(false);
          setUserHasAccess(false);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load course details");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id, getLiveCourseById, getCourseAccess, isLoggedIn]);

  // Check if user has already reviewed this course
  useEffect(() => {
    if (isLoggedIn && userData && reviews.length > 0) {
      const userReview = reviews.find(review => review.client?.id === userData.id);
      setUserHasReviewed(!!userReview);
    } else {
      setUserHasReviewed(false);
    }
  }, [isLoggedIn, userData, reviews]);

  const handleReviewSubmitted = (newReview) => {
    // Add the new review to the list
    // The API returns the review data in the response
    if (newReview && newReview.id) {
      setReviews([newReview, ...reviews]);
      setUserHasReviewed(true);
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const renderStaticStars = (filled) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        className={i < filled ? "text-yellow-400" : "text-text-muted"}
      />
    ));
  };

  const imageUrl = useMemo(() => {
    if (!course) return "/logo.png";
    const img = Array.isArray(course.image) ? course.image[0] : course.image;
    if (typeof img === "string" && img.length > 0) return img;
    return "/logo.png";
  }, [course]);

  const videoUrl = useMemo(() => {
    if (!course) return null;
    return course.video && typeof course.video === "string" && course.video.length > 0
      ? course.video
      : null;
  }, [course]);
  // ////
  const getLevelTranslation = (level) => {
    const levelMap = {
      'beginner': t('courses.beginner', 'Beginner'),
      'intermediate': t('courses.intermediate', 'Intermediate'),
      'advanced': t('courses.advanced', 'Advanced')
    };
    return levelMap[level] || level;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `${formattedDate} (Ukraine Time)`;
    } catch {
      return dateString;
    }
  };

  const getTimeStatus = (dateString) => {
    const now = new Date();
    const courseDate = new Date(dateString);
    const diffTime = courseDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 0) return null; // Don't show anything if ended
    if (diffHours <= 24) return { status: 'liveToday', text: 'LIVE TODAY', color: 'bg-red-500' };
    if (diffHours <= 168) return { status: 'comingSoon', text: 'COMING SOON', color: 'bg-orange-500' };
    return { status: 'upcoming', text: 'UPCOMING', color: 'bg-blue-500' };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!!error || !course) {
    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-text">
        <div className="text-red-600">{t("common.error", "Error")}: {error || t("courses.courseNotFound", "Course not found.")}</div>
        <Link to="/courses" className="px-4 py-2 text-white rounded-lg bg-primary">{t("courses.backToCourses", "Back to Courses")}</Link>
      </section>
    );
  }

  const timeStatus = getTimeStatus(course.started_at);
  const isUpcoming = new Date(course.started_at) > new Date();

  return (
    <section className="min-h-screen px-4 py-20 bg-background sm:px-6 md:px-12 text-text">
      <div className="grid max-w-6xl gap-8 mx-auto lg:grid-cols-2 lg:gap-10">
        {/* صورة أو فيديو */}
        <div className="relative w-full overflow-hidden shadow-lg rounded-2xl lg:mx-0 h-fit lg:self-start">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="object-cover w-full h-[400px]"
              muted
              playsInline
              controls={isPlaying}
              onEnded={handleVideoEnd}
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <img src={imageUrl} alt={course.title} className="object-cover w-full h-[500px]" />
          )}
          {!isPlaying && videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/50" onClick={handlePlay}>
              <FaPlay className="text-4xl text-white drop-shadow-lg sm:text-5xl" />
            </div>
          )}
          {/* Live Badge */}
          <div className="absolute z-10 top-4 left-4">
            <div className="flex items-center gap-1 px-3 py-1 text-white rounded-full shadow-lg bg-gradient-to-r from-[#E11D48] to-[#F97316]">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs font-bold">{t("liveCourses.live", "LIVE")}</span>
            </div>
          </div>
          {/* Time Status Badge */}
          {timeStatus && (
            <div className="absolute z-10 top-4 right-4">
              <div className={`px-3 py-1 text-xs font-semibold text-white rounded-full shadow-lg ${timeStatus.color}`}>
                {t(`liveCourses.${timeStatus.status}`, timeStatus.text)}
              </div>
            </div>
          )}
        </div>

        {/* تفاصيل الكورس */}
        <div className="flex flex-col justify-between space-y-4 sm:space-y-6">
          <h1 className="text-2xl font-bold sm:text-3xl">{course.title}</h1>
          <div className="text-sm text-text-secondary sm:text-base">
            <div
              className={`leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-6' : ''}`}
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
            {course.description && course.description.length > 150 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-1 text-sm font-medium underline text-primary hover:text-primary/80 cursor-pointer"
              >
                {isDescriptionExpanded ? t("common.showLess", "Show Less") : t("common.showMore", "Show More")}
              </button>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">{renderStaticStars(Math.round(course.avg_rating || 0))}</div>
            <span className="ml-2 text-sm text-text-muted">({(course.avg_rating || 0).toFixed(1)} / 5.0)</span>
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-3">
            {/* السعر بعد الخصم */}
            <span className="text-xl font-bold text-primary sm:text-2xl">
              ₴{course.discount && Number(course.discount) > 0
                ? (Number(course.price) - (Number(course.price) * Number(course.discount) / 100)).toFixed(2)
                : Number(course.price).toFixed(2)}
            </span>
            {/* السعر الأصلي */}
            {course.discount && Number(course.discount) > 0 && (
              <>
                <span className="text-base line-through text-text-muted sm:text-lg">
                  ₴{Number(course.price).toFixed(2)}
                </span>
                {/* نسبة الخصم */}
                <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded">
                  {Math.round(Number(course.discount))}%
                </span>
              </>
            )}
          </div>

          {/* معلومات */}
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <FaLayerGroup className="text-primary" /> {t("courses.level", "Level")} <span className="font-medium">{getLevelTranslation(course.level)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCertificate className="text-primary" /> {t("courses.category", "Category")} <span className="font-medium">
                {(() => {
                  if (typeof course.category === 'string') {
                    return course.category;
                  }
                  if (course.category && typeof course.category === 'object' && course.category.name) {
                    return typeof course.category.name === 'string' ? course.category.name : String(course.category.name);
                  }
                  return "";
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaGlobe className="text-primary" /> {t("courses.language", "Language")} <span className="font-medium">{course.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBook className="text-primary" /> {t("courses.lessons", "Lessons")} <span className="font-medium">{course.lessons_count || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-primary" /> {t("courses.startedAt", "Started At")} <span className="font-medium">{formatDate(course.started_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-primary" /> {t("courses.collegeYear", "College Year")} <span className="font-medium">{course.college_year}</span>
            </div>
            {course.course_duration_days > 0 && (
              <div className="flex items-center gap-2 col-span-full">
                <FaHourglassHalf className="text-primary" />
                <span>{t("courses.accessDuration", "Access Duration")}:</span>
                <span className="font-semibold text-primary">
                  {course.course_duration_days} {t("courses.days", "days")}
                </span>
                <span className="text-text-muted text-xs">({t("courses.accessDurationNote", "from the date of purchase")})</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            {isExpired ? (
              /* ───── الكورس منتهى الصلاحية ───── */
              <button
                onClick={() => setShowExpiredModal(true)}
                className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-green-600 hover:bg-green-700 sm:px-6 sm:py-3 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("courses.courseCompleted", "تم اجتياز الدورة")}
              </button>
            ) : userHasAccess ? (
              /* ───── مسجّل والكورس نشط ───── */
              <button
                onClick={() => navigate(`/live-courses/${id}/lessons`)}
                className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-primary hover:bg-secondary sm:px-6 sm:py-3"
              >
                {isUpcoming ? t("courses.joinLive", "Join Live") : t("courses.viewRecording", "View Recording")}
              </button>
            ) : (
              /* ───── غير مسجّل ───── */
              <button
                onClick={() => navigate(`/live-courses/${id}/subscribe`)}
                className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-primary hover:bg-secondary sm:px-6 sm:py-3"
              >
                {t("courses.subscribeNow", "Subscribe Now")}
              </button>
            )}
            {/* زر «عرض الدروس» */}
            <button
              onClick={() => navigate(`/live-courses/${id}/lessons`)}
              className="px-4 py-2 text-sm transition border rounded-lg border-primary text-primary hover:bg-primary hover:text-white sm:px-6 sm:py-3"
            >
              {t("courses.viewLessons", "View Lessons")}
            </button>
          </div>
        </div>
      </div>



      {/* Review + Instructor (if available) */}
      <div className="grid max-w-6xl gap-8 mx-auto mt-12 sm:mt-16 lg:grid-cols-3">
        {/* Reviews */}
        <div className="lg:col-span-2">
          {/* Leave Review Component */}
          <div className="mb-8">
            <LeaveReview
              courseId={id}
              onReviewSubmitted={handleReviewSubmitted}
              userHasReviewed={userHasReviewed}
              type="live_course"
            />
          </div>

          {/* Display Reviews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold sm:text-xl">
              {t('courses.reviews') || 'Reviews'} ({reviews.length})
            </h3>
            {reviews.length === 0 && (
              <p className="text-text-muted">
                {t('courses.noReviews') || 'No reviews yet.'}
              </p>
            )}
            {(showAll ? reviews : reviews.slice(0, 3)).map((review, index) => (
              <div
                key={review.id || index}
                className="p-4 border rounded-lg shadow-sm border-border bg-surface"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={review.client?.imageprofile || review.client?.avatar || "/user.png"}
                    alt={review.client?.name || 'User'}
                    className="object-cover w-8 h-8 rounded-full sm:w-10 sm:h-10"
                    onError={(e) => {
                      e.currentTarget.src = '/user.png';
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold sm:text-base">
                      {review.client?.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2 text-yellow-400">
                  {renderStaticStars(review.rate_number)}
                </div>
                <p className="text-sm text-text-secondary sm:text-base">
                  {review.rate_comment}
                </p>
              </div>
            ))}
            {reviews.length > 3 && (
              <button
                className="px-4 py-2 mt-2 text-sm text-white rounded-lg bg-primary hover:bg-secondary"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (t('courses.showLess') || 'Show Less') : (t('courses.showMore') || 'Show More')}
              </button>
            )}
          </div>
        </div>

        {/* Instructor Info - if available */}
        {course.instructor && (
          <div className="sticky self-start top-24">
            <div className="p-6 border rounded-lg shadow-sm border-border bg-surface h-fit">
              <img
                src={course.instructor?.image || "https://randomuser.me/api/portraits/men/10.jpg"}
                alt={course.instructor?.name || t("courses.instructor", "Instructor")}
                className="object-cover w-24 h-24 mx-auto mb-4 rounded-full"
              />
              <h3 className="text-lg font-bold text-center">{course.instructor?.name || t("courses.instructor", "Instructor")}</h3>
              <p className="mb-2 text-sm text-center text-text-muted">
                {course.instructor?.job_title || t("courses.jobTitle", "Job Title")}
              </p>
              <p className="mb-4 text-sm font-medium text-center text-primary">
                {t("courses.expertise", "Expertise")}: {course.instructor?.expertise || t("courses.noExpertise", "Not specified")}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {course.instructor?.years_of_experience && (
                  <li className="flex items-center gap-2">
                    <FaChalkboardTeacher className="text-primary" />
                    {course.instructor.years_of_experience} {t("courses.yearsOfExperience", "Years of Experience")}
                  </li>
                )}
                {course.instructor?.bio && (
                  <li className="flex items-start gap-2">
                    <FaUserGraduate className="mt-1 text-primary" /> {course.instructor.bio}
                  </li>
                )}
                {course.university?.name && (
                  <li className="flex items-center gap-2">
                    <FaUniversity className="text-primary" /> {course.university.name}
                  </li>
                )}
                {course.instructor?.email && (
                  <li className="flex items-center gap-2">
                    <FaEnvelope className="text-primary" />
                    <a href={`mailto:${course.instructor.email}`} className="hover:text-secondary">
                      {course.instructor.email}
                    </a>
                  </li>
                )}
                {course.instructor?.phone && (
                  <li className="flex items-center gap-2">
                    <FaPhone className="text-primary" />
                    <a href={`tel:${course.instructor.phone}`} className="hover:text-secondary">
                      {course.instructor.phone}
                    </a>
                  </li>
                )}
              </ul>
              {/* Social Links */}
              <div className="flex justify-center gap-4 mt-4 text-xl text-primary">
                {course.instructor?.facebook && (
                  <a href={course.instructor.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-secondary">
                    <FaFacebook />
                  </a>
                )}
                {course.instructor?.instagram && (
                  <a href={course.instructor.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-secondary">
                    <FaInstagram />
                  </a>
                )}
                {course.instructor?.youtube && (
                  <a href={course.instructor.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-secondary">
                    <FaYoutube />
                  </a>
                )}
                {course.instructor?.telegram && (
                  <a href={course.instructor.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-secondary">
                    <FaTelegram />
                  </a>
                )}
                {course.instructor?.whatsapp && (
                  <a href={course.instructor.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-secondary">
                    <FaWhatsapp />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Students Section */}
      <TopStudentsSlider students={course.top_students} />

      {/* Expired Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 overflow-hidden text-center bg-white shadow-2xl rounded-2xl dark:bg-surface">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/30">
              <FaCertificate className="text-3xl text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {t("courses.courseCompletedTitle", "تم اجتياز الدورة بنجاح")}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t("courses.courseCompletedMessage", "لقد أتممت متطلبات هذه الدورة بنجاح في وقت سابق. نظراً لانتهاء فترة صلاحية الوصول، لا يمكن عرض المحتوى حالياً. نتمنى لك دوام التوفيق والنجاح.")}
            </p>
            <button
              onClick={() => setShowExpiredModal(false)}
              className="w-full px-4 py-3 font-semibold text-white transition-colors bg-primary rounded-xl hover:bg-secondary"
            >
              {t("common.close", "إغلاق")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
