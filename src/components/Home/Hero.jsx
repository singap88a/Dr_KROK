import React, { useState, useEffect } from "react";
import { FaStar, FaUserFriends } from "react-icons/fa";
import Lottie from "lottie-react";
import HeroAnimation from "../animations/hero.json";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import he from 'he';

export default function Hero() {
  const { isLoggedIn } = useUser();
  const { t, i18n } = useTranslation();
  const { getSettings } = useApi();

  const [heroData, setHeroData] = useState({
    titleOne: "",
    titleTwo: "",
    description: ""
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const response = await getSettings();
        if (response && response.data) {
          setHeroData({
            titleOne: response.data.title_one_section_one_home || "",
            titleTwo: response.data.title_tow_section_one_home || "",
            description: response.data.description_section_start_your_journey_home || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch hero settings:", error);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, [getSettings, i18n.language]);

  return (
    <section className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4">
        <div className="container grid items-center grid-cols-1 gap-10 py-16 mx-auto lg:grid-cols-2 max-w-7xl">

          {/* Left Content */}
          <div className="space-y-6">
            <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-accent text-primary">
              {t('hero.badge')}
            </span>

            <h1 className="text-4xl font-extrabold leading-tight text-text md:text-5xl">
              {settingsLoading ? (
                <div className="space-y-2">
                  <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-3/4 h-8 bg-gray-300 rounded animate-pulse"></div>
                </div>
              ) : heroData.titleOne && heroData.titleTwo ? (
                <>
                  {heroData.titleOne}{" "}
                  <span className="text-primary">{heroData.titleTwo}</span>
                </>
              ) : (
                <>
                  {t('hero.titleOne')}{" "}
                  <span className="text-primary">{t('hero.titleTwo')}</span>
                </>
              )}
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-text-secondary">
              {settingsLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-5/6 h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-4/6 h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
              ) : heroData.description ? (
                <div dangerouslySetInnerHTML={{ __html: he.decode(heroData.description) }} />
              ) : (
                t('hero.description')
              )}
            </p>

            {/* Stats + Rating */}
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2">
                <FaUserFriends className="text-xl text-primary" />
                <span className="font-semibold text-text">
                  {t('hero.stats.users')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
                <span className="ml-2 text-text-secondary">
                  {t('hero.stats.rating')}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              {!isLoggedIn ? (
                <Link to="/register" className="px-6 py-3 font-medium text-white transition rounded-full bg-primary hover:brightness-110">
                  {t('hero.cta.getStarted')}
                </Link>
              ) : (
                <Link to="/courses" className="px-6 py-3 font-medium text-white transition rounded-full bg-primary hover:brightness-110">
                  {t('hero.cta.goToCourses')}
                </Link>
              )}
              <Link to="/test" className="px-6 py-3 font-medium transition border rounded-full text-text border-border hover:bg-accent">
                {t('hero.cta.startTest')}
              </Link>
            </div>
          </div>

          {/* Right Animation */}
          <div className="relative flex justify-center lg:justify-end">
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
                    {t('hero.expert.name')}
                  </h4>
                  <p className="text-xs text-text-muted">
                    {t('hero.expert.title')}
                  </p>
                </div>
                <button className="px-3 py-1 ml-3 text-sm text-white rounded-full bg-primary hover:brightness-110">
                  {t('hero.expert.message')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
