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
} from "react-icons/fa";

import { useParams, Link, useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { useUser } from "../../context/UserContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import LeaveReview from "./LeaveReview";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getVideoCourseById, getCourseAccess } = useApi();
  const { userData, isLoggedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userHasAccess, setUserHasAccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isInstructorExpanded, setIsInstructorExpanded] = useState(false);
  const videoRef = useRef(null);


  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const data = await getVideoCourseById(id, isLoggedIn);
        if (!mounted) return;
        setCourse(data);
        
        // Set reviews from course data
        if (data && data.ratings && Array.isArray(data.ratings)) {
          setReviews(data.ratings);
        }

        // Check course access if logged in
        if (isLoggedIn) {
          try {
            const access = await getCourseAccess(id, 'video_course');
            setUserHasAccess(access);
          } catch {
            // If access check fails, assume no access for paid content
            setUserHasAccess(data.price === 0 || data.price === "0");
          }
        } else {
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
  }, [id, getVideoCourseById, getCourseAccess, isLoggedIn]);

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
    const img = course.image && Array.isArray(course.image) ? course.image[0] : course.image;
    if (typeof img === "string" && img.length > 0) return img;
    return "/logo.png";
  }, [course]);

  const videoUrl = useMemo(() => {
    if (!course) return null;
    return course.video && typeof course.video === "string" && course.video.length > 0
      ? course.video
      : null;
  }, [course]);

  const getLevelTranslation = (level) => {
    const levelMap = {
      'beginner': t('courses.beginner', 'Beginner'),
      'intermediate': t('courses.intermediate', 'Intermediate'),
      'advanced': t('courses.advanced', 'Advanced')
    };
    return levelMap[level] || level;
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    // Format: "22-09-2025 03:47 PM"
    const [datePart, timePart, ampm] = dateString.split(' ');
    const [day, month, year] = datePart.split('-');
    let [hour, minute] = timePart.split(':');
    hour = parseInt(hour);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return new Date(year, month - 1, day, hour, minute);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Handle DD-MM-YYYY HH:MM AM/PM format
      const parts = dateString.split(' ');
      if (parts.length >= 2) {
        const datePart = parts[0]; // DD-MM-YYYY
        const timePart = parts[1]; // HH:MM
        const ampm = parts[2]; // AM/PM

        const [day, month, year] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');

        // Convert to 24-hour format
        let hour24 = parseInt(hours);
        if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
        if (ampm === 'AM' && hour24 === 12) hour24 = 0;

        const date = new Date(year, month - 1, day, hour24, minutes);
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return `${formattedDate} (Ukraine Time)`;
      }

      // Fallback for other formats
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

  return (
    <section className="min-h-screen px-4 py-8 bg-background sm:px-6 md:px-12 text-text">
      <div className="grid max-w-6xl gap-8 mx-auto lg:grid-cols-2 lg:gap-10">
        {/* صورة أو فيديو */}
        <div className="relative w-full h-[500px] overflow-hidden shadow-lg rounded-2xl lg:mx-0">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="object-cover w-full h-full"
              muted
              playsInline
              controls={isPlaying}
              onEnded={handleVideoEnd}
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <img src={imageUrl} alt={course.title} className="object-cover w-full h-full" />
          )}
          {!isPlaying && videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/50" onClick={handlePlay}>
              <FaPlay className="text-4xl text-white drop-shadow-lg sm:text-5xl" />
            </div>
          )}
        </div>

        {/* تفاصيل الكورس */}
        <div className="flex flex-col justify-between space-y-4 sm:space-y-6">
          <h1 className="text-2xl font-bold sm:text-3xl">{course.title}</h1>
          <div 
            className={`text-sm text-text-secondary sm:text-base ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
          {course.description && course.description.length > 200 && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-1 font-medium underline text-primary hover:text-primary/80 text-start"
            >
              {isDescriptionExpanded ? "Show Less" : "Read More"}
            </button>
          )}

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
              <FaUser className="text-primary" /> {t("courses.instructor", "Instructor")} <span className="font-medium">{course.instructor?.name || (typeof course.instructor === 'string' ? course.instructor : "")}</span>
            </div>

            <div className="flex items-center gap-2">
              <FaLayerGroup className="text-primary" /> {t("courses.level", "Level")} <span className="font-medium">{getLevelTranslation(course?.level)}</span>
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
              <FaGlobe className="text-primary" /> {t("courses.language", "Language")} <span className="font-medium">{course?.language || ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBook className="text-primary" /> {t("courses.lectures", "Lectures")} <span className="font-medium">{course.lessons_count || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-primary" /> {t("courses.courseDate", "Course Date")} <span className="font-medium">
                {course.instructor?.created_at ? (() => {
                  const date = parseDate(course.instructor.created_at);
                  if (!date) return '';
                  const year = date.getFullYear();
                  const month = (date.getMonth() + 1).toString().padStart(2, '0');
                  const day = date.getDate().toString().padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })() : ''}
              </span>
            </div>

            {/* {course.avg_rating && (
              <div className="flex items-center gap-2">
                <FaStar className="text-primary" /> {t("courses.averageRating", "Average Rating")} <span className="font-medium">{course.avg_rating.toFixed(1)} / 5.0</span>
              </div>
            )} */}
          </div>

          <div className="flex gap-3">
            {userHasAccess ? (
              <button
                onClick={() => navigate(`/courses/${id}/lessons`)}
                className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-primary hover:bg-secondary sm:px-6 sm:py-3"
              >
                {t("courses.startCourse", "Start Course")}
              </button>
            ) : (
              <button
                onClick={() => navigate(`/courses/${id}/subscribe`)}
                className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-primary hover:bg-secondary sm:px-6 sm:py-3"
              >
                {t("courses.subscribeNow", "Subscribe Now")}
              </button>
            )}
            <button
              onClick={() => navigate(`/courses/${id}/lessons`)}
              className="px-4 py-2 text-sm transition border rounded-lg border-primary text-primary hover:bg-primary hover:text-white sm:px-6 sm:py-3"
            >
              {t("courses.previewCourse", "Preview Course")}
            </button>
          </div>
        </div>
      </div>

      {/* Review + Instructor */}
      <div className="grid max-w-6xl gap-8 mx-auto mt-12 sm:mt-16 lg:grid-cols-3">
        {/* Reviews */}
        <div className="lg:col-span-2">
          {/* Leave Review Component */}
          <div className="mb-8">
            <LeaveReview 
              courseId={id} 
              onReviewSubmitted={handleReviewSubmitted}
              userHasReviewed={userHasReviewed}
            />
          </div>

          {/* Display Reviews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold sm:text-xl">
              {t('courses.reviews') || 'Reviews'} ({reviews.length})
            </h3>
            
            {/* Rating Distribution */}
            {reviews.length > 0 && (
              <div className="p-4 mb-6 border rounded-lg border-border bg-surface">
                <h4 className="mb-4 text-base font-semibold">{t('courses.ratingDistribution', 'Rating Distribution')}</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((starCount) => {
                    const count = reviews.filter(r => Math.round(r.rate_number) === starCount).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={starCount} className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm">
                            {Array.from({ length: starCount }).map((_, i) => (
                              <FaStar key={i} className="text-yellow-400" size={14} />
                            ))}
                          </div>
                          <div className="flex-1 h-3 overflow-hidden bg-gray-200 rounded-full">
                            <div 
                              className="h-full transition-all duration-300 bg-yellow-400"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-text-muted w-14 text-right">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="text-xs text-center text-text-muted ml-1">
                          {starCount} {starCount === 1 ? t('courses.star', 'Star') : t('courses.stars', 'Stars')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
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

        {/* Instructor Info - Sticky */}
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
                  <FaUserGraduate className="mt-1 flex-shrink-0 text-primary" />
                  <div className="flex-1">
                    <div className={`${!isInstructorExpanded ? 'line-clamp-3' : ''}`}>
                      {course.instructor.bio}
                    </div>
                    {course.instructor.bio && course.instructor.bio.length > 100 && (
                      <button
                        onClick={() => setIsInstructorExpanded(!isInstructorExpanded)}
                        className="mt-1 text-sm font-medium underline text-primary hover:text-primary/80"
                      >
                        {isInstructorExpanded ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>
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
      </div>
    </section>
  );
}
