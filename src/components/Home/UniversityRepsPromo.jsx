import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaUniversity, FaChartLine, FaUserGraduate, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const translations = {
  en: {
    tag: 'For University Management',
    title: 'University Representatives',
    description: 'University owners and managers can apply to join the Dr. KROK platform. Once approved, you will get a comprehensive dashboard to track your students across all academic years and precisely monitor their progress and performance in our courses.',
    track: 'Track Students',
    reports: 'Performance Reports',
    apply: 'Apply Now',
    imageTitle: 'The Future of Medical Education',
    imageSub: 'Comprehensive tracking for your university'
  },
  ua: {
    tag: 'Для керівництва університету',
    title: 'Представники університету',
    description: 'Власники та менеджери університетів можуть подати заявку на приєднання до платформи Dr. KROK. Після схвалення ви отримаєте комплексну інформаційну панель для відстеження ваших студентів на всіх курсах і точного моніторингу їхнього прогресу та успішності.',
    track: 'Відстеження студентів',
    reports: 'Звіти про успішність',
    apply: 'Подати заявку',
    imageTitle: 'Майбутнє медичної освіти',
    imageSub: 'Комплексне відстеження для вашого університету'
  }
};

export default function UniversityRepsPromo() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ua') ? 'ua' : 'en';
  const tLocal = translations[lang] || translations.en;

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-primary/5 via-surface to-secondary/10 border border-border/60 rounded-3xl overflow-hidden shadow-xl"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row items-center gap-8 p-8 md:p-12 relative z-10">
          
          {/* Text Content */}
          <div className="flex-1 space-y-6 lg:pr-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
              <FaUniversity />
              <span>{tLocal.tag}</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-text leading-tight">
              {tLocal.title}
            </h2>
            
            <p className="text-base md:text-lg text-text-secondary leading-relaxed opacity-90 max-w-2xl">
              {tLocal.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-text">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                  <FaUserGraduate />
                </div>
                <span>{tLocal.track}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-text">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center">
                  <FaChartLine />
                </div>
                <span>{tLocal.reports}</span>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/university-representative" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5">
                <span>{tLocal.apply}</span>
                <FaArrowRight />
              </Link>
            </div>
          </div>

          {/* Image/Visual Content */}
          <div className="w-full lg:w-5/12 max-w-md shrink-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <img 
                src="/university_management.png" 
                alt="University Management and Tracking" 
                className="w-full h-auto object-cover aspect-video sm:aspect-square lg:aspect-auto lg:h-[320px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="font-bold text-lg leading-tight">{tLocal.imageTitle}</p>
                  <p className="text-sm opacity-80 mt-1">{tLocal.imageSub}</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </motion.div>
    </section>
  );
}
