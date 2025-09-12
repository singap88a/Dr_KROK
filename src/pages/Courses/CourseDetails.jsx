import React, { useState, useRef } from "react";
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
} from "react-icons/fa";

export default function CourseDetails() {
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

  return (
    <section className="min-h-screen px-4 py-8 bg-background sm:px-6 md:px-12 text-text">
      <div className="grid max-w-6xl gap-8 mx-auto lg:grid-cols-2 lg:gap-10">
        {/* صورة أو فيديو */}
        <div className="relative w-full overflow-hidden shadow-lg rounded-2xl lg:mx-0">
          <video
            ref={videoRef}
            src="public/dd.mp4" // ضع لينك الفيديو هنا
            className="object-cover w-full h-full"
            loop
            muted
            playsInline
            controls={isPlaying}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/50" onClick={handlePlay}>
              <FaPlay className="text-4xl text-white drop-shadow-lg sm:text-5xl" />
            </div>
          )}
        </div>

        {/* تفاصيل الكورس */}
        <div className="flex flex-col justify-between space-y-4 sm:space-y-6">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Mastering React.js From Zero to Hero
          </h1>
          <p className="text-sm text-text-secondary sm:text-base">
            Learn React.js from scratch with hands-on projects, covering Hooks,
            Context API, Redux, Router, TailwindCSS integration, and building
            scalable apps.
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">{renderStaticStars(4)}</div>
            <span className="ml-2 text-sm text-text-muted">(4.0 / 5.0)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary sm:text-2xl">
              $49.99
            </span>
            <span className="text-base line-through text-text-muted sm:text-lg">
              $99.99
            </span>
          </div>

          {/* معلومات */}
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <FaUser className="text-primary" /> Instructor:{" "}
              <span className="font-medium">John Doe</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-primary" /> Duration:{" "}
              <span className="font-medium">8 weeks</span>
            </div>
            <div className="flex items-center gap-2">
              <FaLayerGroup className="text-primary" /> Level:{" "}
              <span className="font-medium">Beginner</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCertificate className="text-primary" /> Certificate:{" "}
              <span className="font-medium">Included</span>
            </div>
            <div className="flex items-center gap-2">
              <FaGlobe className="text-primary" /> Language:{" "}
              <span className="font-medium">English</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-primary" /> Students:{" "}
              <span className="font-medium">1200+</span>
            </div>
          </div>

          <button className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-primary hover:bg-secondary sm:px-6 sm:py-3">
            Buy Now
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
          <div className="p-6 border rounded-lg shadow-sm border-border bg-surface h-[500px] overflow-y-auto">
            <img
              src="https://randomuser.me/api/portraits/men/10.jpg"
              alt="Instructor"
              className="object-cover w-24 h-24 mx-auto mb-4 rounded-full"
            />
            <h3 className="text-lg font-bold text-center">John Doe</h3>
            <p className="mb-2 text-sm text-center text-text-muted">
              Senior Software Engineer & React Expert
            </p>
            <p className="mb-4 text-sm font-medium text-center text-primary">
              Specialization: Frontend Development
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <FaChalkboardTeacher className="text-primary" /> 10+ Years
                Teaching Experience
              </li>
              <li className="flex items-center gap-2">
                <FaLaptopCode className="text-primary" /> 50+ Completed Projects
              </li>
              <li className="flex items-center gap-2">
                <FaBook className="text-primary" /> Author of 3 Programming
                Books
              </li>
              <li className="flex items-center gap-2">
                <FaGlobe className="text-primary" /> Worked with Global Tech
                Companies
              </li>
            </ul>

            <div className="flex justify-center gap-4 mt-4 text-xl text-primary">
              <a href="#" className="hover:text-secondary">
                <FaLinkedin />
              </a>
              <a href="#" className="hover:text-secondary">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-secondary">
                <FaGithub />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
