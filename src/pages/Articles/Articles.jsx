import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaStar, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useApi } from '../../context/ApiContext';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Pagination from '../../components/Common/Pagination';

// الصورة الافتراضية للمحاضرين
const DEFAULT_INSTRUCTOR_IMAGE = '/logo.png';

// ---------- Component ----------
export default function TrainerArticlesPage() {
  const { getBlogs } = useApi();
  const { t, i18n } = useTranslation();
  const [instructors, setInstructors] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const PER_PAGE = 15;

  const currentLang = (i18n?.language || 'en').split('-')[0];

  const load = useCallback(async (page = 1, instructorId = null) => {
    setLoading(true);
    setError("");
    try {
      const params = { page, per_page: PER_PAGE };
      if (instructorId) params.instructor_id = instructorId;
      const blogsResponse = await getBlogs(params);
      if (blogsResponse && blogsResponse.data) {
        // Extract instructors from data (only on page 1 without filter, to build sidebar)
        if (page === 1 && !instructorId) {
          const instructorsFromBlogs = blogsResponse.data.map(instructor => ({
            id: instructor.id,
            name: instructor.name,
            image: instructor.image || DEFAULT_INSTRUCTOR_IMAGE,
            blogs: instructor.blogs || [],
            facebook: instructor.facebook,
            instagram: instructor.instagram,
            youtube: instructor.youtube,
          }));
          setInstructors(instructorsFromBlogs);
        }

        // Create flat blogs array, filtered by instructor if selected
        const allBlogs = blogsResponse.data
          .filter(instructor => !instructorId || String(instructor.id) === String(instructorId))
          .flatMap(instructor =>
            (instructor.blogs || []).map(blog => ({
              ...blog,
              instructor_id: {
                id: instructor.id,
                name: instructor.name,
                image: instructor.image || DEFAULT_INSTRUCTOR_IMAGE,
              }
            }))
          );

        // Set pagination info
        const pag = blogsResponse.pagination;
        if (pag) {
          setTotalPages(pag.total_pages || 1);
          // If filtering by instructor, we might want to use the local count 
          // if the server totalItems is for all instructors
          setTotalItems(instructorId ? allBlogs.length : (pag.total_items || 0));
          setCurrentPage(pag.current_page || page);
        }

        setBlogs(allBlogs);
      } else {
        setBlogs([]);
        if (page === 1 && !instructorId) setInstructors([]);
      }
    } catch (e) {
      setError(e?.message || t('articles.error'));
    } finally {
      setLoading(false);
    }
  }, [getBlogs, t]);

  // Initial load — fetch all instructors for sidebar
  useEffect(() => {
    load(1, null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when language changes
  useEffect(() => {
    setExpanded({});
  }, [currentLang]);

  // When instructor filter or page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    load(page, selectedInstructorId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInstructorSelect = (id) => {
    setSelectedInstructorId(id);
    setCurrentPage(1);
    load(1, id);
  };

  const selectedInstructor = useMemo(() => {
    return instructors.find(i => String(i.id) === String(selectedInstructorId)) || null;
  }, [instructors, selectedInstructorId]);

  // The instructors with blogs for the sidebar
  const instructorsWithArticles = useMemo(() => {
    return instructors.filter(instructor => instructor.blogs && instructor.blogs.length > 0);
  }, [instructors]);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return div.textContent || div.innerText || '';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [date, time] = dateStr.split(' ');
    const [day, month, year] = date.split('-');
    const dateObj = new Date(`${year}-${month}-${day}T${time?.replace(' ', '') || '00:00'}`);
    return dateObj.toLocaleDateString(currentLang === 'ua' ? 'uk-UA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageError = (e) => {
    e.target.src = DEFAULT_INSTRUCTOR_IMAGE;
  };

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
      <div className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">{t('articles.title')}</h1>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="p-3 bg-white border border-gray-100 shadow-sm lg:col-span-3 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
            <h2 className="mb-3 text-lg font-medium">{t('articles.instructors')}</h2>
            <div className="space-y-3">
              <button
                onClick={() => handleInstructorSelect(null)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${selectedInstructorId === null ? 'border border-primary dark:border-primary bg-primary/10 dark:bg-primary/30 shadow-sm' : 'border border-primary/20 dark:border-primary/70 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {t('articles.allInstructors')}
              </button>
              {instructorsWithArticles.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => handleInstructorSelect(tr.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${String(selectedInstructorId) === String(tr.id) ? 'border border-primary dark:border-primary bg-primary/10 dark:bg-primary/30 shadow-sm' : 'border border-primary/20 dark:border-primary/70 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <img
                    src={tr.image}
                    alt={tr.name}
                    className="object-cover w-12 h-12 border-2 border-white rounded-full shadow-sm"
                    onError={handleImageError}
                  />
                  <div className="flex items-start justify-between flex-1">
                    <div>
                      <div className="font-semibold leading-tight">{tr.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {tr.blogs.length} {t('articles.articleCount', { count: tr.blogs.length })}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="lg:col-span-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {selectedInstructor ? t('articles.byInstructor', { name: selectedInstructor.name }) : t('articles.allArticles')}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {totalItems} {t('articles.count')}
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-center bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                <LoadingSpinner variant="spinner" size="lg" className="text-primary" />
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600 bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl dark:border-gray-700">{t('articles.error')}</div>
            ) : !blogs.length ? (
              <div className="p-6 text-center bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl dark:border-gray-700">{t('articles.noArticles')}</div>
            ) : (
              <>
                <div className="grid gap-4">
                  {blogs.map((b) => {
                    const text = stripHtml(b.description || '');
                    const isExpanded = !!expanded[b.id];
                    const maxChars = 200;
                    const showToggle = text.length > maxChars;
                    const display = isExpanded ? text : text.slice(0, maxChars) + (showToggle ? '...' : '');
                    const instr = b.instructor_id || {};
                    return (
                      <article key={b.id} className="p-4 overflow-hidden bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                        <h4 className="mb-2 text-lg font-semibold">{b.name}</h4>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{formatDate(b.created_at)}</p>
                        <p className="mb-3 text-sm text-gray-600 whitespace-pre-line dark:text-gray-300">{display}</p>
                        {showToggle && (
                          <button onClick={() => toggleExpand(b.id)} className="mb-3 text-sm font-medium text-primary hover:underline">
                            {isExpanded ? t('articles.showLess') : t('articles.showMore')}
                          </button>
                        )}
                        {b.image && (
                          <img
                            src={b.image}
                            alt={b.name}
                            className="object-cover w-full h-56 mb-3 rounded-lg"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <img
                            src={instr.image}
                            alt={instr.name}
                            className="object-cover w-10 h-10 rounded-full"
                            onError={handleImageError}
                          />
                          <div>
                            <div className="text-sm font-medium">{instr.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {t('articles.instructor')}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Server-side Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </>
            )}
          </main>

          <aside className="lg:col-span-3">
            {selectedInstructor ? (
              <div className="sticky p-6 bg-white border border-gray-100 shadow-lg dark:bg-gray-800 rounded-2xl dark:border-gray-700 top-6">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedInstructor.image}
                    alt={selectedInstructor.name}
                    className="object-cover w-20 h-20 border-2 rounded-full shadow-md border-primary"
                    onError={handleImageError}
                  />
                  <div>
                    <div className="text-xl font-semibold">{selectedInstructor.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {selectedInstructor.blogs.length} {t('articles.articleCount', { count: selectedInstructor.blogs.length })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  {selectedInstructor.facebook && (
                    <a href={selectedInstructor.facebook} target="_blank" rel="noreferrer" className="p-2 transition bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"><FaFacebook /></a>
                  )}
                  {selectedInstructor.instagram && (
                    <a href={selectedInstructor.instagram} target="_blank" rel="noreferrer" className="p-2 transition bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"><FaInstagram /></a>
                  )}
                  {selectedInstructor.youtube && (
                    <a href={selectedInstructor.youtube} target="_blank" rel="noreferrer" className="p-2 transition bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"><FaYoutube /></a>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <FaStar className="text-yellow-500" />
                  <span>{t('articles.instructorCard')}</span>
                </div>

                <Link
                  to={`/instructors/${selectedInstructor.id}`}
                  className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 mt-4 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
                >
                  <FaUser />
                  View Profile
                </Link>
              </div>
            ) : (
              <div className="sticky p-6 text-sm text-gray-600 bg-white border border-gray-100 shadow-lg dark:bg-gray-800 rounded-2xl dark:border-gray-700 top-6">
                {t('articles.selectInstructorInfo')}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}