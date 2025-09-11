import React from 'react'
import {   FiAward, FiUsers,   FiShield,   } from "react-icons/fi";

export default function Stand_For() {
  return (
    <div>
            {/* Platform Values */}
            <div className="px-4 py-12 sm:px-6 sm:py-16 ">
              <h2 className="mb-8 text-2xl font-bold text-center sm:mb-12 sm:text-3xl text-primary">What We Stand For</h2>
              <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 text-center transition-all duration-300 border border-gray-200 shadow-lg sm:p-6 rounded-2xl bg-background hover:shadow-2xl hover:transform hover:scale-105">
                  <FiAward size={36} className="mx-auto mb-3 text-primary animate-bounce" />
                  <h4 className="mb-2 text-lg font-semibold sm:text-xl">Quality Education</h4>
                  <p className="text-sm text-text-secondary sm:text-base">
                    Every course and resource is curated by experts to ensure top-notch quality.
                  </p>
                </div>
                <div className="p-4 text-center transition-all duration-300 border border-gray-200 shadow-lg sm:p-6 rounded-2xl bg-background hover:shadow-2xl hover:transform hover:scale-105">
                  <FiUsers size={36} className="mx-auto mb-3 text-primary animate-bounce" />
                  <h4 className="mb-2 text-lg font-semibold sm:text-xl">Community First</h4>
                  <p className="text-sm text-text-secondary sm:text-base">
                    We foster collaboration, discussion, and knowledge-sharing among learners.
                  </p>
                </div>
                <div className="p-4 text-center transition-all duration-300 border border-gray-200 shadow-lg sm:p-6 rounded-2xl bg-background hover:shadow-2xl hover:transform hover:scale-105 sm:col-span-2 lg:col-span-1">
                  <FiShield size={36} className="mx-auto mb-3 text-primary animate-bounce" />
                  <h4 className="mb-2 text-lg font-semibold sm:text-xl">Trust & Security</h4>
                  <p className="text-sm text-text-secondary sm:text-base">
                    Your data, progress, and privacy are always protected with us.
                  </p>
                </div>
              </div>
            </div>
    </div>
  )
}
