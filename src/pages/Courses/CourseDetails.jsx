import React, { useState } from "react";
import { FaUser, FaClock, FaUsers, FaCertificate, FaGlobe, FaLayerGroup, FaVideo, FaGraduationCap, FaStar } from "react-icons/fa";

export default function CourseDetails() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  // Mock logged in user data
  const currentUser = {
    name: "Ahmed Mohamed",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment || rating === 0) return;
    const newReview = {
      name: currentUser.name,
      avatar: currentUser.avatar,
      rating,
      comment,
      date: new Date().toLocaleDateString()
    };
    setReviews([newReview, ...reviews]);
    setComment("");
    setRating(0);
  };

  // نجوم ستاتيك (3 أصفر + 2 رمادي)
  const renderStaticStars = (filled) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} className={i < filled ? "text-yellow-400" : "text-gray-400"} />
    ));
  };

  // Clickable stars for rating input
  const renderClickableStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        className={`cursor-pointer text-2xl ${i < rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 transition-colors`}
        onClick={() => setRating(i + 1)}
      />
    ));
  };

  return (
    <section className="min-h-screen px-4 py-8 bg-background sm:px-6 md:px-12 text-text">
      <div className="grid max-w-6xl gap-8 mx-auto lg:grid-cols-2 lg:gap-10">

        {/* صورة + أيقون الفيديو */}
        <div className="relative w-full overflow-hidden shadow-lg rounded-2xl lg:mx-0">
          <img
            src="https://images.unsplash.com/photo-1581091012184-5c8a0a27f8d4"
            alt="Course"
            className="object-cover w-full h-48 sm:h-56 md:h-64"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <FaVideo className="text-3xl text-white drop-shadow-lg sm:text-4xl" />
          </div>
        </div>

        {/* تفاصيل الكورس */}
        <div className="flex flex-col justify-between space-y-4 sm:space-y-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Mastering React.js From Zero to Hero</h1>
          <p className="text-sm text-text-secondary sm:text-base">
            Learn React.js from scratch with hands-on projects, covering Hooks, Context API,
            Redux, Router, TailwindCSS integration, and building scalable apps. Suitable for
            beginners and advanced learners.
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">{renderStaticStars(3)}</div>
            <span className="ml-2 text-sm text-text-muted">(3.0 / 5.0)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary sm:text-2xl">$49.99</span>
            <span className="text-base line-through text-text-muted sm:text-lg">$99.99</span>
          </div>

          {/* معلومات */}
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <FaUser className="text-primary" /> Instructor: <span className="font-medium">John Doe</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-primary" /> Duration: <span className="font-medium">8 weeks</span>
            </div>
            <div className="flex items-center gap-2">
              <FaLayerGroup className="text-primary" /> Level: <span className="font-medium">Beginner</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCertificate className="text-primary" /> Certificate: <span className="font-medium">Included</span>
            </div>
            <div className="flex items-center gap-2">
              <FaGlobe className="text-primary" /> Language: <span className="font-medium">English</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-primary" /> Students: <span className="font-medium">1200+</span>
            </div>
            {/* <div className="flex items-center gap-2">
              <FaGraduationCap className="text-primary" /> Graduates: <span className="font-medium">850+</span>
            </div> */}
          </div>

          {/* زر شراء */}
          <button className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-primary hover:bg-secondary sm:px-6 sm:py-3">
            Buy Now
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="max-w-4xl mx-auto mt-12 sm:mt-16">
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
            <div className="flex gap-1">
              {renderClickableStars()}
            </div>
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
          {reviews.length === 0 && <p className="text-text-muted">No reviews yet.</p>}
          {reviews.map((rev, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-sm border-border bg-surface">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="object-cover w-8 h-8 rounded-full sm:w-10 sm:h-10"
                />
                <div>
                  <p className="text-sm font-semibold sm:text-base">{rev.name}</p>
                  <p className="text-xs text-text-muted">{rev.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2 text-yellow-400">
                {renderStaticStars(rev.rating)}
              </div>
              <p className="text-sm text-text-secondary sm:text-base">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
