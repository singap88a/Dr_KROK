import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FaFacebookF, FaInstagram, FaYoutube, FaEnvelope, FaBriefcase, FaStore } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "swiper/css";
import "swiper/css/pagination";

function MerchantsCarousel() {
  const { t } = useTranslation();
  const { getMerchants } = useApi();
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let fetched = false;

    const fetchMerchants = async () => {
      if (fetched) return;
      fetched = true;

      try {
        setLoading(true);
        const res = await getMerchants({ page: 1, per_page: 10 }); // Fetch first 10 for carousel

        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

        const uniqueMerchants = list.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        );

        setMerchants(uniqueMerchants);
      } catch (err) {
        console.error("Error fetching merchants:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, [getMerchants]);

  const handleViewAll = () => {
    navigate("/merchants");
  };

  if (loading) {
    return (
      <section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="px-4 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {t("merchantsPage.title", "Merchants")}
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            {t("merchantsPage.description", "Discover our trusted merchants")}
          </p>
          <div className="flex justify-center mt-12">
            <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || merchants.length === 0) {
    return null; // Don't show the section if no merchants
  }

  return (
    <section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 mx-auto mt-12 sm:flex-row max-w-7xl">
          <div className="text-start">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              {t("merchantsPage.title", "Merchants")}
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              {t("merchantsPage.description", "Discover our trusted merchants")}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/merchants"
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 rounded-xl bg-primary hover:bg-primary-dark hover:-translate-y-0.5 shadow-lg shadow-primary/30"
            >
              <FaStore className="text-sm" />
              {t("merchantsPage.allMerchants", "View All")}
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
            loop={merchants.length > 3}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            grabCursor={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            style={{ paddingBottom: '60px' }}
          >
            {merchants.map((merchant) => (
              <SwiperSlide key={merchant.id} className="!h-auto pt-[85px] pb-4">
                <div className="block h-full relative">
                  <div className="group block focus:outline-none h-full bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl hover:border-primary hover:shadow-xl dark:hover:border-primary transition-all duration-300 flex flex-col pt-[85px] pb-5 px-5 text-center shadow-sm">
                    {/* Floating Avatar */}
                    <div className="absolute -top-[65px] left-1/2 -translate-x-1/2 w-[130px] h-[130px] rounded-full border-[5px] border-white dark:border-gray-900 shadow-md bg-white overflow-hidden z-10 transition-transform duration-300 group-hover:scale-105">
                      {merchant.image ? (
                        <img
                          src={merchant.image}
                          alt={merchant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "/logo.png"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                          <span className="font-black text-white text-4xl">{merchant.name?.charAt(0)?.toUpperCase() || "M"}</span>
                        </div>
                      )}
                    </div>
                      
                    {/* Card content */}
                    <div className="flex-1 flex flex-col mt-2">
                      <h3 className="font-bold text-[17px] text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                        {merchant.name}
                      </h3>
                      {merchant.job_title && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1.5">
                          <FaBriefcase size={11} className="text-primary/70" />
                          <span className="truncate">{merchant.job_title}</span>
                        </p>
                      )}

                      {/* Social presence indicators */}
                      <div className="flex-1 flex flex-col justify-end mt-4">
                        {(merchant.facebook || merchant.instagram || merchant.youtube || merchant.email) && (
                          <div className="flex items-center justify-center gap-2 mb-4">
                          {merchant.email && (
                            <a 
                              href={`mailto:${merchant.email}`}
                              className="flex items-center justify-center w-8 h-8 text-primary/70 transition bg-primary/10 rounded-full hover:bg-primary hover:text-white"
                              title={merchant.email}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaEnvelope size={12} />
                            </a>
                          )}
                          {merchant.facebook && (
                            <a 
                              href={merchant.facebook} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center w-8 h-8 text-primary/70 transition bg-primary/10 rounded-full hover:bg-primary hover:text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaFacebookF size={12} />
                            </a>
                          )}
                          {merchant.instagram && (
                            <a 
                              href={merchant.instagram} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center w-8 h-8 text-primary/70 transition bg-primary/10 rounded-full hover:bg-primary hover:text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaInstagram size={12} />
                            </a>
                          )}
                          {merchant.youtube && (
                            <a 
                              href={merchant.youtube} target="_blank" rel="noopener noreferrer"
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
                          to={`/merchants/${merchant.id}`}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-primary text-white font-bold text-[13px] rounded-xl hover:opacity-90 transition-all duration-300"
                        >
                          {t("merchantsPage.viewStore", "View Store")}
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

export default MerchantsCarousel;
