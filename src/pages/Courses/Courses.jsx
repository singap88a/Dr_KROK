// CoursesPage.jsx
import React, { useState } from "react";
import {
  FaClock,
  FaStar,
  FaUserTie,
  FaPlayCircle,
  FaVideo,
  FaUsers,
} from "react-icons/fa";
import { sampleVideoCourses, sampleLiveCourses } from "./data/coursesData";
import RatingStars from "./components/RatingStars";
import VideoCourseCard from "./components/VideoCourseCard";
import LiveCourseCard from "./components/LiveCourseCard";

export default function Courses() {
  const [activeTab, setActiveTab] = useState("video"); // video | live
  const [query, setQuery] = useState("");

  const videoCourses = sampleVideoCourses;
  const liveCourses = sampleLiveCourses;

  const visible = activeTab === "video" ? videoCourses : liveCourses;
  const filtered = visible.filter((c) => {
    const t = `${c.title} ${c.instructor} ${c.description}`.toLowerCase();
    return t.includes(query.toLowerCase());
  });

  function goToDetails(course) {
    // connect to your routing logic here
    alert(`Open details page for: ${course.title}`);
  }

  return (
    <div className="min-h-screen py-10 transition-colors duration-300 ">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
              All Courses
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Choose course type — Recorded Video Courses or Interactive Live
              Courses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="items-center hidden p-1 bg-white rounded-full shadow-sm sm:flex dark:bg-gray-800">
              <button
                onClick={() => setActiveTab("video")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "video"
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-200"
                }`}
              >
                <FaPlayCircle className="inline mr-2" /> Video Course
              </button>
              <button
                onClick={() => setActiveTab("live")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "live"
                    ? "bg-red-600 text-white"
                    : "text-gray-600 dark:text-gray-200"
                }`}
              >
                <FaVideo className="inline mr-2" /> Live Course
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center overflow-hidden bg-white border border-transparent rounded-full shadow-sm dark:bg-gray-800">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 px-4 py-2 text-sm text-gray-700 bg-transparent outline-none sm:w-64 dark:text-gray-200"
                placeholder="Search for a course or instructor..."
                aria-label="Search courses"
              />
            </div>
          </div>
        </header>

        {/* Mobile Toggle */}
        <div className="flex gap-3 mb-4 sm:hidden">
          <button
            onClick={() => setActiveTab("video")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "video"
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            <FaPlayCircle className="inline mr-2" /> Video Course
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "live"
                ? "bg-red-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            <FaVideo className="inline mr-2" /> Live Course
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {filtered.length} of {visible.length} — Type:{" "}
            <span className="font-medium">
              {activeTab === "video" ? "Video Course" : "Live Course"}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Layout: Modern Cards
          </div>
        </div>

        {/* Grid */}
        <section>
          <div
            className={`grid grid-cols-1 gap-6 ${
              activeTab === "video"
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : "sm:grid-cols-2"
            }`}
          >
            {filtered.map((course) =>
              course.type === "video" ? (
                <VideoCourseCard
                  key={course.id}
                  course={course}
                  onClick={goToDetails}
                />
              ) : (
                <LiveCourseCard
                  key={course.id}
                  course={course}
                  onClick={goToDetails}
                />
              )
            )}

            {filtered.length === 0 && (
              <div className="p-8 text-center bg-white shadow col-span-full dark:bg-gray-800 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  No results found
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Try different search keywords or choose another course type.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
