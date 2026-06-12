import React, { useEffect, useMemo, useState } from "react";
import he from "he";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FaRegCalendarAlt } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";

const parseDateString = (dateString) => {
  if (!dateString) return 0;
  try {
    if (typeof dateString === 'string' && dateString.includes('-') && dateString.split('-')[0].length === 2) {
      const parts = dateString.split(' ');
      const [day, month, year] = parts[0].split('-');
      let hours = 0, minutes = 0;
      if (parts.length > 1) {
        const timeSplit = parts[1].split(':');
        hours = parseInt(timeSplit[0]) || 0;
        minutes = parseInt(timeSplit[1]) || 0;
        if (parts[2] === 'PM' && hours !== 12) hours += 12;
        if (parts[2] === 'AM' && hours === 12) hours = 0;
      }
      return new Date(year, month - 1, day, hours, minutes).getTime();
    }
    const d = new Date(dateString).getTime();
    return isNaN(d) ? 0 : d;
  } catch {
    return 0;
  }
};

const formatDateString = (dateString) => {
  if (!dateString) return '';
  try {
    if (typeof dateString === 'string' && dateString.includes('-') && dateString.split('-')[0].length === 2) {
      const parts = dateString.split(' ');
      const [day, month, year] = parts[0].split('-');
      const parsedDate = new Date(year, month - 1, day);
      if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString();
      }
      return parts[0];
    }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    return dateString;
  } catch {
    return dateString;
  }
};

export default function FeaturedArticles({ articles }) {
  const { getBlogs } = useApi();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getBlogs({ page: 1, per_page: 3 });
        if (!isMounted) return;

        // Flatten blogs from instructors and sort by date
        const allBlogs = (res.data || []).flatMap(instructor => instructor.blogs || []);
        const sortedBlogs = allBlogs.sort((a, b) => parseDateString(b.created_at) - parseDateString(a.created_at));
        const decodedBlogs = sortedBlogs.slice(0, 3).map(b => ({
          ...b,
          description: b.description ? he.decode(b.description) : ""
        }));
        setFetched(decodedBlogs);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.message || "");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [getBlogs]);

  const apiMapped = useMemo(() => {
    return (fetched || []).map((b) => ({
      id: b.id,
      title: b.name,
      description: b.description,
      date: formatDateString(b.created_at),
      image: b.image,
    }));
  }, [fetched]);

  // استخدم فقط البيانات الجاية من الـ props أو الباك
  const list = (articles && articles.length ? articles : apiMapped);

  return (
    <section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {t("articles.featured")}
              </h2>
            </div>
            <Link
              className="py-2 text-sm font-bold underline transition text-primary border-primary"
              to="/articles"
            >
              {t("articles.viewAll")}
            </Link>
          </div>

          {/* Swiper Section */}
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={25}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop={true}
            pagination={{ clickable: true }}
            style={{ paddingBottom: '60px' }}
          >
            {loading && (
              <SwiperSlide>
                <div className="flex items-center justify-center h-48">
                  {t("articles.loading")}
                </div>
              </SwiperSlide>
            )}
            {error && !loading && (
              <SwiperSlide>
                <div className="flex items-center justify-center h-48 text-red-600">
                  {t("articles.error")}
                </div>
              </SwiperSlide>
            )}
            {list.map((item) => (
              <SwiperSlide key={item.id} className="!h-auto">
                <div className="flex flex-col h-full overflow-hidden transition-transform duration-300 bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative h-48">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-cover w-full h-full"
                      width="400"
                      height="200"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col h-full p-5">
                    <h3 className="mb-2 text-lg font-semibold line-clamp-1">
                      {item.title}
                    </h3>
                    <div 
                      className="mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />

                    {item.date ? (
                      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
                        <FaRegCalendarAlt />
                        <span>{item.date}</span>
                      </div>
                    ) : null}

                    {/* CTA Button */}
                    <Link
                      to="/articles"
                      className="w-full px-4 py-2 mt-auto text-sm font-medium text-center text-white transition bg-primary rounded-xl hover:shadow-md hover:brightness-110"
                      aria-label={`${t("articles.readMore")} - ${item.title}`}
                    >
                      {t("articles.readMore")}
                    </Link>
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
