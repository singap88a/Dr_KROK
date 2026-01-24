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
  const { getSettings, request } = useApi();

  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState({
    titleOne: "",
    titleTwo: "",
    description: "",
    totalClients: null,
    clientsRates: 0
  });

  const formatUsers = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+ Users`;
    return `${num} Users`;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Use request directly with useCache: false to bypass cache and get fresh data
        const response = await request("setting", { useCache: false });
        if (response && response.data) {
          setHeroData({
            titleOne: response.data.title_one_section_one_home || "",
            titleTwo: response.data.title_tow_section_one_home || "",
            description: response.data.description_section_home || "",
            totalClients: response.data.total_clients ? parseInt(response.data.total_clients) : null,
            clientsRates: response.data.clients_rates ? parseInt(response.data.clients_rates) : 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch hero settings:", error);
      } finally {
        // Ensure loading is set to false after fetch (success or failure)
        setLoading(false);
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
            {loading ? (
              <div className="max-w-xl space-y-6 animate-pulse">
                {/* Badge Skeleton */}
                <div className="w-32 h-8 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                
                {/* Title Skeleton */}
                <div className="space-y-3">
                  <div className="w-3/4 h-12 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
                  <div className="w-1/2 h-12 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
                </div>

                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                  <div className="w-5/6 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                  <div className="w-4/6 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>

                {/* Stats Skeleton */}
                <div className="flex gap-8">
                  <div className="w-32 h-6 bg-gray-200 rounded dark:bg-gray-700"></div>
                  <div className="w-32 h-6 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>

                {/* Buttons Skeleton */}
                <div className="flex gap-4 pt-2">
                  <div className="w-32 h-12 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  <div className="w-32 h-12 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                </div>
              </div>
            ) : (
              <>
                <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-accent text-primary">
                  {t('hero.badge')}
                </span>

                <h1 className="text-4xl font-extrabold leading-tight text-text md:text-5xl min-h-[3rem]">
                  {heroData.titleOne && heroData.titleTwo ? (
                    <>
                      {heroData.titleOne}{" "}
                      <span className="text-primary">{heroData.titleTwo}</span>
                    </>
                  ) : null}
                </h1>

                <p className="max-w-lg text-lg leading-relaxed text-text-secondary min-h-[1.5rem]">
                  {heroData.description ? (
                    <div dangerouslySetInnerHTML={{ __html: he.decode(heroData.description) }} />
                  ) : null}
                </p>

                {/* Stats + Rating */}
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-2">
                    <FaUserFriends className="text-xl text-primary" />
                    <span className="font-semibold text-text">
                      {heroData.totalClients ? formatUsers(heroData.totalClients) : "0 Users"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < heroData.clientsRates ? "text-yellow-400" : "text-gray-300"} />
                    ))}
                    <span className="ml-2 text-text-secondary">
                      {heroData.clientsRates ? Number(heroData.clientsRates).toFixed(1) : "0.0"} Rating
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
              </>
            )}
          </div>

          {/* Right Animation */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[300px] md:w-[500px] lg:w-[700px]">
              <Lottie animationData={HeroAnimation} loop={true} />

              {/* Floating Card */}
              <div className="absolute flex items-center gap-3 px-4 py-3 border shadow-xl bg-surface border-border -bottom-8 -left-8 rounded-xl">
                <img
                  src="logo.png"
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
                <Link to="/contact">
                                <button className="px-3 py-1 ml-3 text-sm text-white rounded-full bg-primary hover:brightness-110">
                  {t('hero.expert.message')}
                </button>
                </Link>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
