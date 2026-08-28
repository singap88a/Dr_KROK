import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaEnvelope,
  FaBriefcase,
  FaChevronRight,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { toast } from "react-toastify";
import Pagination from "../../components/Common/Pagination";
import SEO from "../../components/SEO/SEO";
import { useTranslation } from "react-i18next";

const PER_PAGE = 15;

const gradients = [
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-teal-500 to-emerald-600",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
];

function Avatar({ name, image, size = 48 }) {
  const [imgError, setImgError] = React.useState(false);
  const initial = name?.charAt(0)?.toUpperCase() || "M";
  const bgGradient = gradients[(name?.charCodeAt(0) || 0) % gradients.length];

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shadow-sm border-2 border-white dark:border-gray-900 ring-1 ring-gray-100 dark:ring-gray-800 flex-shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div style={{ width: size, height: size }} className={`rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white dark:border-gray-900 ring-1 ring-gray-100 dark:ring-gray-800`}>
      <span className="font-black text-white" style={{ fontSize: size * 0.42 }}>{initial}</span>
    </div>
  );
}

function MerchantCard({ merchant }) {
  const { t } = useTranslation();
  const hasSocial = merchant.facebook || merchant.instagram || merchant.youtube;
  const initial = merchant.name?.charAt(0)?.toUpperCase() || "M";
  const bgGradient = gradients[(merchant.name?.charCodeAt(0) || 0) % gradients.length];

  return (
    <Link to={`/merchants/${merchant.id}`} className="group block focus:outline-none">
      <div className="h-full bg-gray-50 dark:bg-gray-900 border border-primary/40 dark:border-primary/40 rounded-2xl hover:border-primary dark:hover:border-primary transition-all duration-300 flex flex-col overflow-hidden">
        {/* Card header — avatar + name */}
        <div className="p-5 flex items-center gap-4 border-b border-primary/5 dark:border-primary/10">
          <Avatar name={merchant.name} image={merchant.image} size={48} />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[15px] text-gray-900 dark:text-white truncate leading-snug group-hover:text-primary transition-colors">
              {merchant.name}
            </h3>
            {merchant.job_title && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 flex items-center gap-1">
                <FaBriefcase size={9} className="text-primary/60 flex-shrink-0" />
                {merchant.job_title}
              </p>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          {merchant.email && (
            <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 truncate mb-3">
              <FaEnvelope size={10} className="text-primary/50 flex-shrink-0" />
              {merchant.email}
            </p>
          )}

          {/* Social presence indicators */}
          {hasSocial && (
            <div className="flex items-center gap-2 mb-3">
              {merchant.facebook && <FaFacebookF size={11} className="text-primary/40" />}
              {merchant.instagram && <FaInstagram size={11} className="text-primary/40" />}
              {merchant.youtube && <FaYoutube size={11} className="text-primary/40" />}
            </div>
          )}

          <div className="pt-3">
            <span className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-primary text-white font-bold text-[13px] rounded-xl group-hover:opacity-90 transition-all duration-300">
              {t("merchantsPage.viewStore")}
              <FaChevronRight size={10} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="p-5 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
        <div className="h-px bg-gray-100 dark:bg-gray-800" />
        <div className="flex justify-between items-center">
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function Merchants() {
  const { t } = useTranslation();
  const { getMerchants } = useApi();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchMerchants = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMerchants({ page, per_page: PER_PAGE });
      setMerchants(Array.isArray(res.data) ? res.data : []);
      if (res.pagination) {
        setTotalPages(res.pagination.total_pages || 1);
        setCurrentPage(res.pagination.current_page || page);
        setTotalItems(res.pagination.total_items || 0);
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message);
      toast.error(t("merchantsPage.failedToLoadList"));
    } finally {
      setLoading(false);
    }
  }, [getMerchants]);

  useEffect(() => { fetchMerchants(1); }, [fetchMerchants]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMerchants(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = merchants.filter((m) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.job_title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <SEO
        title={`${t("merchantsPage.title")} — Dr. KROK`}
        description={t("merchantsPage.description")}
        url="/merchants"
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ── Header ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t("merchantsPage.title")}
            </h1>
            {!loading && totalItems > 0 && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("merchantsPage.sellersAvailable", { count: totalItems })}
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            <input
              id="merchant-search"
              type="text"
              placeholder={t("merchantsPage.searchList")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">{t("merchantsPage.failedToLoadList")}</p>
            <button onClick={() => fetchMerchants(currentPage)} className="px-5 py-2 text-sm font-medium text-white rounded-xl bg-primary hover:bg-primary/90 transition-colors">
              {t("merchantsPage.retry")}
            </button>
          </div>
        )}

        {/* ── Grid ── */}
        {!error && (
          <>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="text-gray-300 dark:text-gray-600" size={20} />
                </div>
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {searchTerm ? t("merchantsPage.noResultsFound") : t("merchantsPage.noMerchantsYet")}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {searchTerm ? t("merchantsPage.nothingMatches", { term: searchTerm }) : t("merchantsPage.checkBackSoon")}
                </p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="mt-3 text-sm text-primary hover:underline">
                    {t("merchantsPage.clearSearch")}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((m) => <MerchantCard key={m.id} merchant={m} />)}
              </div>
            )}

            {!searchTerm && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
