import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaTrophy, FaMedal, FaStar } from "react-icons/fa";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const TopStudentsSlider = ({ students }) => {
  const { t } = useTranslation();

  if (!students || students.length === 0) {
    return null;
  }

  // Define colors for top ranks
  const getRankStyles = (rank) => {
    switch (rank) {
      case 1:
        return {
          bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
          shadow: "shadow-yellow-200/50",
          icon: <FaTrophy className="text-yellow-100" />,
          label: "gold"
        };
      case 2:
        return {
          bg: "bg-gradient-to-br from-gray-300 to-gray-500",
          shadow: "shadow-gray-200/50",
          icon: <FaMedal className="text-gray-100" />,
          label: "silver"
        };
      case 3:
        return {
          bg: "bg-gradient-to-br from-orange-400 to-orange-600",
          shadow: "shadow-orange-200/50",
          icon: <FaMedal className="text-orange-100" />,
          label: "bronze"
        };
      default:
        return {
          bg: "bg-primary/80",
          shadow: "shadow-primary/20",
          icon: <span className="text-white text-xs font-bold">{rank}</span>,
          label: "regular"
        };
    }
  };

  return (
    <section className="py-16 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text mb-2"
          >
            {t("courses.topStudents.title")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary"
          >
            {t("courses.topStudents.subtitle")}
          </motion.p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1.2}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-12"
        >
          {students.map((student, index) => {
            const styles = getRankStyles(student.rank);
            return (
              <SwiperSlide key={student.student_id || index}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="relative p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center text-center transition-all duration-300"
                >
                  {/* Rank Badge */}
                  <div className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center ${styles.bg} ${styles.shadow} shadow-lg z-10`}>
                    {styles.icon}
                  </div>

                  {/* Student Image */}
                  <div className="relative mb-4">
                    <div className={`w-24 h-24 rounded-full p-1 ${student.rank <= 3 ? styles.bg : 'bg-border'}`}>
                      <img
                        src={student.image || "/user.png"}
                        alt={student.name}
                        className="w-full h-full object-cover rounded-full bg-surface"
                        onError={(e) => { e.target.src = "/user.png"; }}
                      />
                    </div>
                    {student.rank === 1 && (
                      <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-md">
                        <FaStar size={12} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="font-bold text-lg text-text mb-1 line-clamp-1">{student.name}</h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {t("courses.topStudents.score")}: {student.score}
                    </div>
                  </div>

                  {/* Progress Bar / Percentage */}
                  <div className="w-full mt-4 bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${student.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${styles.bg}`}
                    />
                  </div>
                  <span className="text-xs text-text-muted mt-1 font-medium">
                    {student.percentage}%
                  </span>
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default TopStudentsSlider;
