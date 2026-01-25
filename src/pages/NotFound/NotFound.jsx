import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden">
      <div className="relative w-full max-w-5xl">
        {/* Lottie Animation */}
        <div className="w-full">
          <DotLottieReact
            src="https://lottie.host/84df50dc-26b2-4d8b-83a1-fff354988b4c/o1sJn7UbuY.lottie"
            loop
            autoplay
            className="w-full h-auto scale-110 md:scale-125"
          />
        </div>

        {/* Action Button positioned under "Oops!" text in the animation */}
        <div className="absolute top-[68%] left-[8%] sm:left-[12%] md:left-[15%] lg:left-[10%]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2 md:px-8 md:py-3 bg-[#8550FC] text-white rounded-full font-semibold transition-all hover:bg-primary-dark hover:scale-105 shadow-xl text-sm md:text-lg whitespace-nowrap"
          >
            <FaHome className="text-base md:text-xl" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Support Message */}
      <div className="mt-12 md:mt-24 text-center">
        <p className="text-sm md:text-base text-textSecondary opacity-80">
          If you believe this is an error, please contact technical support.
        </p>
      </div>
    </div>
  );
}
