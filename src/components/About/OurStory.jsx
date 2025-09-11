import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiPlay, FiCheckCircle } from "react-icons/fi";

// OurStory.jsx
// Responsive, modern two-column layout: left = content, right = video (modal player)
// Tailwind CSS required. Uses framer-motion for subtle entrance animation.

export default function OurStory({
  heading = "Our Story",
  subheading = "How we began and where we are heading",
  text = `Our platform was founded to transform learning into an engaging, accessible, and
rewarding experience. We started as a small initiative and today we are proud to
serve thousands of learners worldwide. With a mix of modern technology, expert
instructors, and a supportive community, we provide everything a learner needs in one place.`,
  bullets = [
    "Expert instructors",
    "Hands-on projects",
    "Community support",
  ],
  videoSrc = "https://www.w3schools.com/html/mov_bbb.mp4",
  poster = "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b8f2d6b6c9f8a3f6b3a2f4b1e2c3d4e",
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-4 py-12 transition-colors sm:py-16 lg:py-20 ">
      <div className="grid items-center grid-cols-1 gap-12 mx-auto max-w-7xl lg:grid-cols-2">
        {/* LEFT: Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4 space-y-6 sm:px-6"
        >
          <div className="inline-flex items-center gap-3 px-3 py-1 border rounded-full shadow-sm bg-white/60 dark:bg-white/5 backdrop-blur-sm border-white/30">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-200">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">Trusted & Growing</span>
          </div>

          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl text-cyan-900 dark:text-white">
            {heading}
          </h2>

          <p className="max-w-2xl text-lg text-cyan-800 dark:text-cyan-200">
            {subheading}
          </p>

          <p className="max-w-2xl text-base leading-relaxed text-gray-700 dark:text-gray-300">
            {text}
          </p>

          <ul className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 text-cyan-700 dark:text-cyan-300">
                  <FiCheckCircle className="w-5 h-5" />
                </span>
                <span className="text-gray-800 dark:text-gray-200">{b}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-3 px-5 py-3 font-medium text-white transition transform rounded-lg shadow bg-cyan-700 hover:scale-105"
            >
              Get Started
            </a>

            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 transition bg-white border border-transparent rounded-lg shadow-sm dark:bg-gray-800 hover:shadow-md text-cyan-800 dark:text-cyan-200"
            >
              Watch Video
            </button>
          </div>
        </motion.div>

        {/* RIGHT: Video preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4 sm:px-6"
        >
          <div className="relative overflow-hidden border shadow-xl rounded-xl bg-gradient-to-br from-white/80 to-cyan-50 border-white/50 dark:from-gray-800/60 dark:to-gray-900/60">
            <img
              src={poster}
              alt="Our story poster"
              className="w-full h-[320px] sm:h-[420px] object-cover"
              loading="lazy"
            />

            <button
              onClick={() => setOpen(true)}
              aria-label="Play video"
              className="absolute inset-0 flex items-center justify-center w-full h-full m-auto text-white"
            >
              <div className="flex items-center gap-4 px-6 py-3 transition rounded-full bg-black/40 hover:bg-black/50">
                <FiPlay className="w-8 h-8 text-white" />
                <span className="font-semibold text-white">Play the story</span>
              </div>
            </button>

            <div className="absolute flex items-center justify-between text-sm text-white bottom-4 left-4 right-4">
              <div className="px-3 py-1 rounded-lg bg-black/40">3m 42s</div>
              <div className="px-3 py-1 rounded-lg bg-black/40">Founded 2019</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal: Video player (simple, accessible) */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-3xl bg-transparent" onClick={(e) => e.stopPropagation()}>
            <div className="relative overflow-hidden rounded-lg shadow-2xl">
              <video controls autoPlay src={videoSrc} className="w-full h-auto max-h-[80vh] bg-black">
                Sorry, your browser doesn't support embedded videos.
              </video>

              <button
                onClick={() => setOpen(false)}
                aria-label="Close video"
                className="absolute p-2 rounded-full shadow top-3 right-3 bg-white/80 dark:bg-gray-800/80"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
