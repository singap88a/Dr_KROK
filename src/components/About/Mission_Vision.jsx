import React from 'react'
import { FiTarget, FiEye,   } from "react-icons/fi";

export default function Mission_Vision() {
  return (
    <div>
            {/* Mission & Vision */}
      <div className="grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 mx-auto sm:gap-8 sm:px-6 sm:py-12 md:grid-cols-2">
        <div className="p-6 transition-all duration-300 border border-gray-200 shadow-lg sm:p-8 rounded-2xl bg-surface hover:shadow-2xl hover:transform hover:scale-105">
          <FiTarget size={40} className="mb-4 text-primary animate-pulse" />
          <h3 className="mb-3 text-xl font-semibold sm:text-2xl">Our Mission</h3>
          <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
            To democratize education by making high-quality resources accessible
            to learners everywhere, regardless of background or location.
          </p>
        </div>
        <div className="p-6 transition-all duration-300 border border-gray-200 shadow-lg sm:p-8 rounded-2xl bg-surface hover:shadow-2xl hover:transform hover:scale-105">
          <FiEye size={40} className="mb-4 text-primary animate-pulse" />
          <h3 className="mb-3 text-xl font-semibold sm:text-2xl">Our Vision</h3>
          <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
            To become the go-to platform for students and professionals
            seeking to upskill, collaborate, and grow in the digital era.
          </p>
        </div>
      </div>
    </div>
  )
}
