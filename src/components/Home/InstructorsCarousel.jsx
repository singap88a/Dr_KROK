import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FaFacebookF, FaInstagram, FaYoutube, FaEnvelope, FaBriefcase } from "react-icons/fa";
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
    let fetched = false;

    const fetchInstructors = async () => {
      if (fetched) return;
      fetched = true;

      try {
        setLoading(true);
        const res = await getInstructors();

        // support both old (plain array) and new ({data, pagination}) return shape
        const list = Array.isArray(res) ? res : (res?.data || []);

        // إزالة التكرار إن وجد
        const uniqueInstructors = list.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        );

        setInstructors(uniqueInstructors);
      } catch (err) {
        console.error("Error fetching instructors:", err);
        setError(err.message);
        toast.error(t("instructors.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []); // ← خالي عشان يتنادى مرة واحدة فقط

  const handleViewAll = () => {
    navigate("/instructors");
  };

  if (loading) {
    return (
      <section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="px-4 text-center">
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
      </section>
    );
  }

  if (error || instructors.length === 0) {
    return (
      <section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="px-4 text-center">
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
      </section>
    );
  }

  return (
    <section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-b from-[#e0f9fa] via-[#e0f9fa] to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 mx-auto mt-12 sm:flex-row max-w-7xl">
          <div className="text-start">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              {t("instructors.meetInstructors")}
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              {t("instructors.subtitle")}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/instructors"
              onClick={handleViewAll}
              className="underline transition rounded-lg text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {t("instructors.viewAll")}
            </Link>
          </div>
        </div>

        {/* Swiper Carousel */}
        <div className="mx-auto mt-12 max-w-7xl">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={25}
            slidesPerView={1}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 4,
            }}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            grabCursor={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            style={{ paddingBottom: '60px' }}
          >
            {instructors.map((ins) => (
              <SwiperSlide key={ins.id} className="!h-auto pt-16 pb-4">
                <div className="block h-full relative">
                  <div className="group block focus:outline-none h-full bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl hover:border-primary hover:shadow-xl dark:hover:border-primary transition-all duration-300 flex flex-col pt-16 pb-5 px-5 text-center shadow-sm">
                    {/* Floating Avatar */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-[5px] border-white dark:border-gray-900 shadow-md bg-white overflow-hidden z-10 transition-transform duration-300 group-hover:scale-105">
                      {ins.image ? (
                        <img
                          src={ins.image}
                          alt={ins.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "/logo.png"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                          <span className="font-black text-white text-4xl">{ins.name?.charAt(0)?.toUpperCase() || "I"}</span>
                        </div>
                      )}
                    </div>
                      
                    {/* Card content */}
                    <div className="flex-1 flex flex-col mt-2">
                      <h3 className="font-bold text-[17px] text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                        {ins.name}
                      </h3>
                      {ins.job_title && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1.5">
                          <FaBriefcase size={11} className="text-primary/70" />
                          <span className="truncate">{ins.job_title}</span>
                        </p>
                      )}

                      {/* Social presence indicators */}
                      <div className="flex-1 flex flex-col justify-end mt-4">
                        {(ins.facebook || ins.instagram || ins.youtube || ins.email) && (
                          <div className="flex items-center justify-center gap-2 mb-4">
                          {ins.email && (
                            <a 
                              href={`mailto:${ins.email}`}
                              className="flex items-center justify-center w-8 h-8 text-primary/70 transition bg-primary/10 rounded-full hover:bg-primary hover:text-white"
                              title={ins.email}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaEnvelope size={12} />
                            </a>
                          )}
                          {ins.facebook && (
                            <a 
                              href={ins.facebook} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center w-8 h-8 text-primary/70 transition bg-primary/10 rounded-full hover:bg-primary hover:text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaFacebookF size={12} />
                            </a>
                          )}
                          {ins.instagram && (
                            <a 
                              href={ins.instagram} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center w-8 h-8 text-primary/70 transition bg-primary/10 rounded-full hover:bg-primary hover:text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaInstagram size={12} />
                            </a>
                          )}
                          {ins.youtube && (
                            <a 
                              href={ins.youtube} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center w-8 h-8 text-primary/70 transition bg-primary/10 rounded-full hover:bg-primary hover:text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaYoutube size={12} />
                            </a>
                          )}
                        </div>
                      )}

                      <div className="pt-auto mt-auto">
                        <Link 
                          to={`/instructors/${ins.id}`}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-primary text-white font-bold text-[13px] rounded-xl hover:opacity-90 transition-all duration-300"
                        >
                          {t("instructors.viewProfile", "View Profile")}
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="10" width="10" xmlns="http://www.w3.org/2000/svg"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path></svg>
                        </Link>
                      </div>
                    </div>
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
