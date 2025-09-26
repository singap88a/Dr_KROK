import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FaFacebookF, FaInstagram, FaYoutube, FaEnvelope } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "swiper/css";
import "swiper/css/pagination";

function InstructorsCarousel() {
  const { t } = useTranslation();
  const { getInstructors } = useApi();
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const data = await getInstructors();
        setInstructors(data || []);
      } catch (err) {
        console.error("Error fetching instructors:", err);
        setError(err.message);
        toast.error(t("instructors.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, [getInstructors, t]);

  const handleViewAll = () => {
    navigate("/instructors");
  };

  if (loading) {
    return (
      <section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="px-4">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              {t("instructors.meetInstructors")}
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              {t("instructors.subtitle")}
            </p>
            <div className="flex justify-center mt-12">
              <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || instructors.length === 0) {
    return (
      <section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="px-4">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              {t("instructors.meetInstructors")}
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              {t("instructors.subtitle")}
            </p>
            <div className="mt-12 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                {error ? t("instructors.error") : t("instructors.noInstructors")}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
<section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-b from-[#e0f9fa] via-[#e0f9fa] to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4">
        {/* Title */}
        <div className="flex items-center justify-between mx-auto mt-12 max-w-7xl">
          <div className="text-start">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          {t("instructors.meetInstructors")}
        </h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          {t("instructors.subtitle")}
        </p>
          </div>
                  {/* View All Button */}
        <div className="flex justify-center mt-8">
          <Link
            to="/instructors"
            onClick={handleViewAll}
            className="underline transition rounded-lg text-primary ocus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {t("instructors.viewAll")}
          </Link>
        </div>
        </div>




        {/* Carousel */}
        <div className="mx-auto mt-12 max-w-7xl">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={25}
            slidesPerView={1}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 4
            }}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            grabCursor={true}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-12"
          >
            {instructors.map((ins) => (
              <SwiperSlide key={ins.id}>
                <div className="flex flex-col items-center h-full p-8 transition-transform duration-300 border border-gray-200 shadow-xl rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">

                  {/* Instructor Image */}
                  <div className="flex justify-center">
                    <img
                      src={ins.image || "/placeholder-avatar.jpg"}
                      alt={ins.name}
                      className="object-cover border-4 border-white rounded-full shadow-lg w-28 h-28 dark:border-gray-700"
                      onError={(e) => {
                        e.target.src = "/placeholder-avatar.jpg";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow mt-6 text-center">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {ins.name}
                    </h4>
                    <p className="mt-1 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
                      {ins.job_title || t("instructors.instructor")}
                    </p>
     

                    {/* Socials */}
                    <div className="flex justify-center mt-6 space-x-3">
                      {ins.facebook && (
                        <a
                          href={ins.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 text-gray-500 transition bg-gray-100 rounded-full hover:bg-primary hover:text-white dark:bg-gray-700 dark:hover:bg-primary"
                        >
                          <FaFacebookF size={18} />
                        </a>
                      )}
                      {ins.instagram && (
                        <a
                          href={ins.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 text-gray-500 transition bg-gray-100 rounded-full hover:bg-primary hover:text-white dark:bg-gray-700 dark:hover:bg-primary"
                        >
                          <FaInstagram size={18} />
                        </a>
                      )}
                      {ins.youtube && (
                        <a
                          href={ins.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 text-gray-500 transition bg-gray-100 rounded-full hover:bg-primary hover:text-white dark:bg-gray-700 dark:hover:bg-primary"
                        >
                          <FaYoutube size={18} />
                        </a>
                      )}
                      <a
                        href={`mailto:${ins.email}`}
                        className="flex items-center justify-center w-10 h-10 text-gray-500 transition bg-gray-100 rounded-full hover:bg-primary hover:text-white dark:bg-gray-700 dark:hover:bg-primary"
                      >
                        <FaEnvelope size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default InstructorsCarousel;
