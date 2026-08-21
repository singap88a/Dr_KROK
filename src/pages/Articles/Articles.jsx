import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaUser, FaRegCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useApi } from '../../context/ApiContext';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Pagination from '../../components/Common/Pagination';
import SEO from '../../components/SEO/SEO';
import { getArticlePath, stripHtml } from '../../utils/articleUtils';

const DEFAULT_INSTRUCTOR_IMAGE = '/logo.png';

function ArticleCard({ blog, formatDate, onImageError }) {
  const instr = blog.instructor_id || {};
  const articlePath = getArticlePath(blog);
  const imageAlt = blog.alt_text || blog.name;
  const excerpt = stripHtml(blog.description || '').slice(0, 100);

  return (
    <Link
      to={articlePath}
      className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm group dark:bg-gray-800 rounded-2xl dark:border-gray-700 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative h-36 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {(blog.images && blog.images.length > 0) || blog.image ? (
          <img
            src={blog.images?.[0] || blog.image}
            alt={imageAlt}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-3xl font-bold text-primary/30">
            DR
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h4 className="mb-2 text-sm font-semibold leading-snug line-clamp-2 transition group-hover:text-primary">
          {blog.name}
        </h4>

        {excerpt && (
          <p className="mb-3 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
            {excerpt}{excerpt.length >= 100 ? '...' : ''}
          </p>
        )}

        <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-400 dark:text-gray-500">
          <FaRegCalendarAlt className="shrink-0" />
          <span className="truncate">{formatDate(blog.created_at)}</span>
        </div>

        <div className="flex items-center gap-2 pt-3 mt-auto border-t border-gray-100 dark:border-gray-700">
          <img
            src={instr.image}
            alt={instr.name}
            className="object-cover w-7 h-7 rounded-full"
            onError={onImageError}
          />
          <span className="text-xs font-medium text-gray-600 truncate dark:text-gray-300">
            {instr.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TrainerArticlesPage() {
  const { getBlogs } = useApi();
  const { t, i18n } = useTranslation();
  const [instructors, setInstructors] = useState([]);
  const [allExtractedBlogs, setAllExtractedBlogs] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PER_PAGE = 15;

  const currentLang = (i18n?.language || 'en').split('-')[0];

  const load = useCallback(async (instructorId = null) => {
    setLoading(true);
    setError('');
    try {
      const params = { per_page: 100 };
      if (instructorId) params.instructor_id = instructorId;
      const blogsResponse = await getBlogs(params);
      if (blogsResponse && blogsResponse.data) {
        const blogsList = Array.isArray(blogsResponse.data) ? blogsResponse.data : [];

        if (!instructorId) {
          const instructorMap = new Map();
          blogsList.forEach(blog => {
            const inst = blog.instructor;
            if (inst) {
              if (!instructorMap.has(inst.id)) {
                instructorMap.set(inst.id, {
                  id: inst.id,
                  name: inst.name,
                  image: inst.image || DEFAULT_INSTRUCTOR_IMAGE,
                  blogs: [],
                  facebook: inst.facebook,
                  instagram: inst.instagram,
                  youtube: inst.youtube,
                });
              }
              instructorMap.get(inst.id).blogs.push(blog);
            }
          });
          setInstructors(Array.from(instructorMap.values()));
        }

        const allBlogs = blogsList
          .filter(blog => !instructorId || (blog.instructor && String(blog.instructor.id) === String(instructorId)))
          .map(blog => ({
            ...blog,
            instructor_id: blog.instructor || {}
          }));

        setAllExtractedBlogs(allBlogs);
        setTotalPages(Math.ceil(allBlogs.length / PER_PAGE) || 1);
        setCurrentPage(1);
      } else {
        setAllExtractedBlogs([]);
        if (!instructorId) setInstructors([]);
      }
    } catch (e) {
      setError(e?.message || t('articles.error'));
    } finally {
      setLoading(false);
    }
  }, [getBlogs, t]);

  useEffect(() => {
    load(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInstructorSelect = (id) => {
    setSelectedInstructorId(id);
    load(id);
  };

  const currentBlogs = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return allExtractedBlogs.slice(start, start + PER_PAGE);
  }, [allExtractedBlogs, currentPage]);

  const selectedInstructor = useMemo(() => {
    return instructors.find(i => String(i.id) === String(selectedInstructorId)) || null;
  }, [instructors, selectedInstructorId]);

  const instructorsWithArticles = useMemo(() => {
    return instructors.filter(instructor => instructor.blogs && instructor.blogs.length > 0);
  }, [instructors]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [date, time] = dateStr.split(' ');
    const [day, month, year] = date.split('-');
    const dateObj = new Date(`${year}-${month}-${day}T${time?.replace(' ', '') || '00:00'}`);
    return dateObj.toLocaleDateString(currentLang === 'ua' ? 'uk-UA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleImageError = (e) => {
    e.target.src = DEFAULT_INSTRUCTOR_IMAGE;
  };

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
      <SEO
        title={selectedInstructor ? `Articles by ${selectedInstructor.name}` : 'Articles & News'}
        description="Stay updated with the latest KROK news, explained clinical cases, and educational articles from our expert instructors."
        url="/articles"
      />

      <div className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">{t('articles.title')}</h1>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Instructor filter sidebar */}
          <aside className="p-4 bg-white border border-gray-100 shadow-sm lg:col-span-3 dark:bg-gray-800 rounded-2xl dark:border-gray-700 h-fit lg:sticky lg:top-20">
            <h2 className="mb-3 text-lg font-medium">{t('articles.instructors')}</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleInstructorSelect(null)}
                className={`w-full text-left p-2.5 rounded-lg transition-colors text-sm ${selectedInstructorId === null ? 'border border-primary bg-primary/10 dark:bg-primary/30 shadow-sm' : 'border border-primary/20 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {t('articles.allInstructors')}
              </button>
              {instructorsWithArticles.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => handleInstructorSelect(tr.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${String(selectedInstructorId) === String(tr.id) ? 'border border-primary bg-primary/10 dark:bg-primary/30 shadow-sm' : 'border border-primary/20 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <img
                    src={tr.image}
                    alt={tr.name}
                    className="object-cover w-10 h-10 border-2 border-white rounded-full shadow-sm"
                    onError={handleImageError}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold leading-tight truncate">{tr.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {tr.blogs.length} {t('articles.articleCount', { count: tr.blogs.length })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Articles grid */}
          <main className="lg:col-span-9">
            {selectedInstructor && (
              <div className="flex flex-wrap items-center gap-4 p-4 mb-5 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                <img
                  src={selectedInstructor.image}
                  alt={selectedInstructor.name}
                  className="object-cover w-14 h-14 border-2 rounded-full border-primary"
                  onError={handleImageError}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{selectedInstructor.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedInstructor.blogs.length} {t('articles.articleCount', { count: selectedInstructor.blogs.length })}
                  </div>
                </div>
                <div className="flex gap-2">
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
                <Link
                  to={`/instructors/${selectedInstructor.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-primary/90"
                >
                  <FaUser />
                  {t('articles.viewProfile')}
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedInstructor ? t('articles.byInstructor', { name: selectedInstructor.name }) : t('articles.allArticles')}
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12 bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                <LoadingSpinner variant="spinner" size="lg" className="text-primary" />
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600 bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                {t('articles.error')}
              </div>
            ) : !currentBlogs.length ? (
              <div className="p-6 text-center bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                {t('articles.noArticles')}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {currentBlogs.map((b) => (
                    <ArticleCard
                      key={b.id}
                      blog={b}
                      formatDate={formatDate}
                      onImageError={handleImageError}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
