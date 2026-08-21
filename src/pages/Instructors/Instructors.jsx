import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaSearch,
  FaTelegram,
  FaWhatsapp,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { toast } from "react-toastify";
import Pagination from "../../components/Common/Pagination";
import SEO from "../../components/SEO/SEO";

const PER_PAGE = 12;

function Instructors() {
  const { t } = useTranslation();
  const { getInstructors } = useApi();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInstructors = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await getInstructors({ page, per_page: PER_PAGE });
      const data = res.data || res || [];
      setInstructors(Array.isArray(data) ? data : []);
      if (res.pagination) {
        setTotalPages(res.pagination.total_pages || 1);
        setCurrentPage(res.pagination.current_page || page);
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching instructors:", err);
      setError(err.message);
      toast.error(t("instructors.error"));
    } finally {
      setLoading(false);
    }
  }, [getInstructors, t]);

  useEffect(() => {
    fetchInstructors(1);
  }, [fetchInstructors]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchInstructors(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Client-side search filter (on current page data)
  const filteredInstructors = instructors.filter((instructor) => {
    if (!searchTerm) return true;
    return (
      instructor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instructor.job_title &&
        instructor.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      instructor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {t("instructors.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-8 text-center bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
          <p className="mb-4 text-red-500">{t("instructors.error")}</p>
          <button
            onClick={() => fetchInstructors(currentPage)}
            className="px-6 py-2 text-white rounded-lg bg-primary hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:to-gray-950">
      <SEO 
        title="Our Instructors"
        description="Meet our team of professional medical instructors and KROK tutors. Get expert guidance and training to pass your medical exams easily."
        url="/instructors"
      />
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl">
            {t("instructors.title")}
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400 md:text-lg">
            {t("instructors.subtitle")}
          </p>
        </div>

        {/* Search */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder={t("instructors.searchPlaceholder") || "Search..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Instructors Grid */}
        {filteredInstructors.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm
                ? t("instructors.noResults")
                : t("instructors.noInstructors")}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredInstructors.map((instructor) => (
              <Link
                key={instructor.id}
                to={`/instructors/${instructor.id}`}
                className="block"
              >
                <div className="overflow-hidden transition-all duration-300 bg-white border shadow-sm group dark:bg-gray-800 rounded-2xl hover:shadow-lg">
                  <div className="relative">
                    <img
                      src={instructor.image || "/logo.png"}
                      alt={instructor.name}
                      className="mx-auto h-64 w-[250px]"
                      onError={(e) => {
                        e.target.src = "/logo.png";
                      }}
                    />
                    <div className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary">
                      {instructor.name}
                    </h3>
                    <p className="mb-4 text-sm font-medium text-primary">
                      {instructor.job_title || t("instructors.instructor")}
                    </p>

                    {/* Social Icons */}
                    <div className="flex justify-center space-x-3">
                      {instructor.facebook && (
                        <a
                          href={instructor.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"
                        >
                          <FaFacebookF size={15} />
                        </a>
                      )}
                      {instructor.instagram && (
                        <a
                          href={instructor.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"
                        >
                          <FaInstagram size={15} />
                        </a>
                      )}
                      {instructor.youtube && (
                        <a
                          href={instructor.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"
                        >
                          <FaYoutube size={15} />
                        </a>
                      )}
                      {instructor.telegram && (
                        <a
                          href={instructor.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-blue-500 hover:text-white"
                        >
                          <FaTelegram size={15} />
                        </a>
                      )}
                      {instructor.whatsapp && (
                        <a
                          href={`https://wa.me/${instructor.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-green-500 hover:text-white"
                        >
                          <FaWhatsapp size={15} />
                        </a>
                      )}
                      <a
                        href={`mailto:${instructor.email}`}
                        className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"
                      >
                        <FaEnvelope size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination — only shown when not filtering by search */}
        {!searchTerm && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default Instructors;
