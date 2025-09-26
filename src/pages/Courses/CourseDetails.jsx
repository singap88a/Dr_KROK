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
} from "react-icons/fa";

import { useParams, Link } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function CourseDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { getVideoCourseById } = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([
    {
      name: "Omar Ali",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4,
      comment: "Great course! Learned a lot about React fundamentals.",
      date: "12/09/2025",
    },
    {
      name: "Sara Mohamed",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      comment: "Very clear explanations and useful projects.",
      date: "10/09/2025",
    },
    {
      name: "Mostafa Ahmed",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
      rating: 3,
      comment: "Good course but could include more advanced topics.",
      date: "09/09/2025",
    },
    {
      name: "Laila Hassan",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      rating: 5,
      comment: "Excellent! Highly recommended for beginners.",
      date: "08/09/2025",
    },
  ]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // Mock logged in user
  const currentUser = {
    name: "Ahmed Mohamed",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getVideoCourseById(id)
      .then((data) => {
        if (!mounted) return;
        setCourse(data);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load course details");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id, getVideoCourseById]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment || rating === 0) return;
    const newReview = {
      name: currentUser.name,
      avatar: currentUser.avatar,
      rating,
      comment,
      date: new Date().toLocaleDateString(),
    };
    setReviews([newReview, ...reviews]);
    setComment("");
    setRating(0);
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const renderStaticStars = (filled) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        className={i < filled ? "text-yellow-400" : "text-gray-400"}
      />
    ));
  };

  const renderClickableStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        className={`cursor-pointer text-2xl ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        } hover:text-yellow-400 transition-colors`}
        onClick={() => setRating(i + 1)}
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

  const getLevelTranslation = (level) => {
    const levelMap = {
      'beginner': t('courses.beginner', 'Beginner'),
      'intermediate': t('courses.intermediate', 'Intermediate'),
      'advanced': t('courses.advanced', 'Advanced')
    };
    return levelMap[level] || level;
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
        <div className="relative w-full overflow-hidden shadow-lg rounded-2xl lg:mx-0">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="object-cover w-full h-full"
              loop
              muted
              playsInline
              controls={isPlaying}
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
          <p className="text-sm text-text-secondary sm:text-base">{course.description}</p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">{renderStaticStars(Math.round(course.avg_rating || 0))}</div>
            <span className="ml-2 text-sm text-text-muted">({(course.avg_rating || 0).toFixed(1)} / 5.0)</span>
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-3">
            {/* السعر بعد الخصم */}
            <span className="text-xl font-bold text-primary sm:text-2xl">
              ${course.discount && Number(course.discount) > 0
                ? (Number(course.price) - Number(course.discount)).toFixed(2)
                : Number(course.price).toFixed(2)}
            </span>
            {/* السعر الأصلي */}
            {course.discount && Number(course.discount) > 0 && (
              <>
                <span className="text-base line-through text-text-muted sm:text-lg">
                  ${Number(course.price).toFixed(2)}
                </span>
                {/* نسبة الخصم */}
                <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded">
                 {Math.round((Number(course.discount) / Number(course.price)) * 100)}%
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
              <FaClock className="text-primary" /> {t("courses.duration", "Duration")} <span className="font-medium">{Math.max(1, Math.round((course.duration_minutes || 0) / 60))}h</span>
            </div>
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
              <FaUsers className="text-primary" /> {t("courses.enrolledStudents", "Enrolled Students")} <span className="font-medium">{course.enrolled_count ?? 0}</span>
            </div>
            {/* {course.university && (
              <div className="flex items-center gap-2">
                <FaUniversity className="text-primary" /> {t("courses.university", "University")} <span className="font-medium">
                  {typeof course.university === "string"
                    ? course.university
                    : (course.university?.name || "")}
                </span>
              </div>
            )} */}
            {course.avg_rating && (
              <div className="flex items-center gap-2">
                <FaStar className="text-primary" /> {t("courses.averageRating", "Average Rating")} <span className="font-medium">{course.avg_rating.toFixed(1)} / 5.0</span>
              </div>
            )}
          </div>

          <button className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-primary hover:bg-secondary sm:px-6 sm:py-3">
            {t("books.buy_now", "Buy Now")}
          </button>
        </div>
      </div>

      {/* Review + Instructor */}
      <div className="grid max-w-6xl gap-8 mx-auto mt-12 sm:mt-16 lg:grid-cols-3">
        {/* Reviews */}
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">Leave a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              placeholder="Write your comment..."
              className="w-full p-3 border rounded-lg border-border bg-surface text-text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              <label className="font-medium">Your Rating:</label>
              <div className="flex gap-1">{renderClickableStars()}</div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white transition rounded-lg bg-secondary hover:bg-primary sm:px-5 sm:py-2"
            >
              Submit Review
            </button>
          </form>

          {/* عرض الريفيوز */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold sm:text-xl">Reviews</h3>
            {reviews.length === 0 && (
              <p className="text-text-muted">No reviews yet.</p>
            )}
            {(showAll ? reviews : reviews.slice(0, 3)).map((rev, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg shadow-sm border-border bg-surface"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="object-cover w-8 h-8 rounded-full sm:w-10 sm:h-10"
                  />
                  <div>
                    <p className="text-sm font-semibold sm:text-base">
                      {rev.name}
                    </p>
                    <p className="text-xs text-text-muted">{rev.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2 text-yellow-400">
                  {renderStaticStars(rev.rating)}
                </div>
                <p className="text-sm text-text-secondary sm:text-base">
                  {rev.comment}
                </p>
              </div>
            ))}
            {reviews.length > 3 && (
              <button
                className="px-4 py-2 mt-2 text-sm text-white rounded-lg bg-primary hover:bg-secondary"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : "Show More"}
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
      </div>
    </section>
  );
}
