import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";

export default function Heroabout() {
  const { t, i18n } = useTranslation();
  const { request } = useApi();
  const [heroData, setHeroData] = useState(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const result = await request('setting');
        if (result && result.data) {
          setHeroData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch hero about settings:", error);
      }
    };

    fetchHeroData();
  }, [request, i18n.language]); // Add i18n.language dependency to refetch when language changes

  return (
    <div>
      <div
        className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroData?.image_banner_page_about || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b8f2d6b6c9f8a3f6b3a2f4b1e2c3d4e"})`,
        }}
      >
        {/* فلتر أسود شفاف */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white sm:p-6">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in">
            {t('about.title')}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl lg:text-2xl">
            {heroData?.title_about_us_banner || t('about.description')}
          </p>
        </div>
      </div>
    </div>
  );
}
