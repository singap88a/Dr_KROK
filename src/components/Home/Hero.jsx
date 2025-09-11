import React from "react";
import { motion } from "framer-motion";
import { FaStar, FaUserFriends } from "react-icons/fa";
import Lottie from "lottie-react";
import HeroAnimation from "../animations/hero.json"; // تأكد إن المسار مظبوط

export default function Hero() {
  return (
    <section className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container grid items-center grid-cols-1 gap-10 py-16 mx-auto lg:grid-cols-2 max-w-7xl">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-accent text-primary">
            Learn. Grow. Succeed.
          </span>

          <h1 className="text-4xl font-extrabold leading-tight text-text md:text-5xl">
            Enhance Your Skills with{" "}
            <span className="text-primary">Guided Online Learning</span>
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-text-secondary">
            Unlock your potential with structured online learning designed to
            match real-world needs, guided by expert mentors and interactive
            lessons.
          </p>

          {/* Stats + Rating */}
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-2">
              <FaUserFriends className="text-xl text-primary" />
              <span className="font-semibold text-text">
                50K+ Users
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400" />
              ))}
              <span className="ml-2 text-text-secondary">
                5.0 Rating
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 font-medium text-white transition rounded-full bg-primary hover:brightness-110">
              Get Started
            </button>
            <button className="px-6 py-3 font-medium transition border rounded-full text-text border-border hover:bg-accent">
              Browse Courses
            </button>
          </div>
        </motion.div>

        {/* Right Animation */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative w-[300px] md:w-[500px] lg:w-[700px]">
            <Lottie animationData={HeroAnimation} loop={true} />

            {/* Floating Card */}
            <div className="absolute flex items-center gap-3 px-4 py-3 border shadow-xl bg-surface border-border -bottom-8 -left-8 rounded-xl">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="expert"
                className="w-10 h-10 border-2 rounded-full border-primary"
              />
              <div>
                <h4 className="text-sm font-semibold text-text">
                  Alex Albert
                </h4>
                <p className="text-xs text-text-muted">
                  Medical Expert
                </p>
              </div>
              <button className="px-3 py-1 ml-3 text-sm text-white rounded-full bg-primary hover:brightness-110">
                Message
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
