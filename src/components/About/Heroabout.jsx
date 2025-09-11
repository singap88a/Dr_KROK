import React from 'react';

export default function Heroabout({ title, description, imageUrl }) {
  return (
    <div>
      <div
        className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-cover bg-center overflow-hidden  "
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        {/* فلتر أسود شفاف */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white sm:p-6">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl lg:text-2xl">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
