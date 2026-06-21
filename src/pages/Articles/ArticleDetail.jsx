import React, { useEffect, useState } from 'react';
import he from 'he';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaRegCalendarAlt,
  FaFacebook,
  FaInstagram,
  FaYoutube,
} from 'react-icons/fa';
import { useApi } from '../../context/ApiContext';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import SEO from '../../components/SEO/SEO';
import { getArticlePath, stripHtml } from '../../utils/articleUtils';

const DEFAULT_INSTRUCTOR_IMAGE = '/logo.png';

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getBlogBySlug, getBlogs } = useApi();
  const { t, i18n } = useTranslation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentArticles, setRecentArticles] = useState([]);

  const currentLang = (i18n?.language || 'en').split('-')[0];

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getBlogBySlug(slug);
        if (!isMounted) return;

        let decodedParam = slug;
        try {
          decodedParam = decodeURIComponent(slug);
        } catch {
          decodedParam = slug;
        }

        if (data.slug && decodedParam !== data.slug && String(data.id) === decodedParam) {
          navigate(getArticlePath(data), { replace: true });
          return;
        }

        setArticle({
          ...data,
          description: data.description ? he.decode(data.description) : '',
        });
      } catch (e) {
        if (!isMounted) return;
        setError(e?.message || t('articles.error'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (slug) fetchArticle();
    return () => {
      isMounted = false;
    };
  }, [slug, getBlogBySlug, navigate, t]);

  useEffect(() => {
    let isMounted = true;
    const fetchRecentArticles = async () => {
      try {
        const response = await getBlogs({ page: 1, per_page: 5 });
        const instructorsArray = response.data || response;
        
        const allBlogs = instructorsArray.flatMap(instructor => 
          (instructor.blogs || []).map(blog => ({
            ...blog,
            instructor_id: {
              id: instructor.id,
              name: instructor.name,
              image: instructor.image || DEFAULT_INSTRUCTOR_IMAGE,
            },
          }))
        );

        if (isMounted) setRecentArticles(allBlogs);
      } catch (e) {
        console.error("Failed to fetch recent articles", e);
      }
    };
    fetchRecentArticles();
    return () => { isMounted = false; };
  }, [getBlogs]);

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
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="spinner" size="lg" className="text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen p-8 text-center">
        <p className="mb-4 text-lg text-red-600">{error || t('articles.notFound')}</p>
        <Link to="/articles" className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-primary">
          <FaArrowLeft />
          {t('articles.backToArticles')}
        </Link>
      </div>
    );
  }

  const instructor = article.instructor || {};
  const seoTitle = article.meta_title || article.name;
  const seoDescription = article.meta_description || stripHtml(article.description).slice(0, 160);
  const imageAlt = article.alt_text || article.name;
  const canonicalUrl = `${window.location.origin}${getArticlePath(article)}`;

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
      <SEO
        title={seoTitle}
        description={seoDescription}
        image={article.image}
        url={canonicalUrl}
      />

      <article className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8 mt-4 sm:mt-8">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 transition hover:text-primary dark:text-gray-300"
        >
          <FaArrowLeft />
          {t('articles.backToArticles')}
        </Link>
        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl dark:text-white leading-tight">
          {article.name}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 py-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <FaRegCalendarAlt />
            <time>{formatDate(article.created_at)}</time>
          </div>

          {instructor.name && (
            instructor.id ? (
              <Link
                to={`/instructors/${instructor.id}`}
                className="flex items-center gap-2 text-sm transition hover:text-primary"
              >
                <img
                  src={instructor.image || DEFAULT_INSTRUCTOR_IMAGE}
                  alt={instructor.name}
                  className="object-cover w-8 h-8 rounded-full"
                  onError={(e) => { e.target.src = DEFAULT_INSTRUCTOR_IMAGE; }}
                />
                <span className="font-medium">{instructor.name}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <img
                  src={instructor.image || DEFAULT_INSTRUCTOR_IMAGE}
                  alt={instructor.name}
                  className="object-cover w-8 h-8 rounded-full"
                  onError={(e) => { e.target.src = DEFAULT_INSTRUCTOR_IMAGE; }}
                />
                <span className="font-medium">{instructor.name}</span>
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-8">
            {article.image && (
              <div className="overflow-hidden rounded-2xl shadow-sm bg-gray-50 dark:bg-gray-800 flex justify-center border border-gray-100 dark:border-gray-700">
                <img
                  src={article.image}
                  alt={imageAlt}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-2xl"
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            )}
            
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-a:text-primary prose-img:rounded-2xl prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.description }}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky p-6 space-y-8 bg-white border border-gray-100 shadow-sm top-24 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
              
              {instructor.name && (
                <div>
                  <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    {t('articles.instructor')}
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={instructor.image || DEFAULT_INSTRUCTOR_IMAGE}
                      alt={instructor.name}
                      className="object-cover w-14 h-14 border-2 rounded-full border-primary"
                      onError={(e) => { e.target.src = DEFAULT_INSTRUCTOR_IMAGE; }}
                    />
                    <div>
                      <div className="font-semibold">{instructor.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('articles.instructorCard')}
                      </div>
                    </div>
                  </div>

                  {(instructor.facebook || instructor.instagram || instructor.youtube) && (
                    <div className="flex gap-2 mt-4">
                      {instructor.facebook && (
                        <a href={instructor.facebook} target="_blank" rel="noreferrer" className="p-2 transition bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white">
                          <FaFacebook />
                        </a>
                      )}
                      {instructor.instagram && (
                        <a href={instructor.instagram} target="_blank" rel="noreferrer" className="p-2 transition bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white">
                          <FaInstagram />
                        </a>
                      )}
                      {instructor.youtube && (
                        <a href={instructor.youtube} target="_blank" rel="noreferrer" className="p-2 transition bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white">
                          <FaYoutube />
                        </a>
                      )}
                    </div>
                  )}

                  {instructor.id && (
                    <Link
                      to={`/instructors/${instructor.id}`}
                      className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 mt-4 text-sm font-medium text-white transition rounded-lg bg-primary hover:bg-primary/90"
                    >
                      <FaUser />
                      {t('articles.viewProfile')}
                    </Link>
                  )}
                </div>
              )}

              {recentArticles?.filter(a => a.id !== article?.id).length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    {t('articles.otherArticles', 'Other Articles')}
                  </p>
                  <div className="space-y-4">
                    {recentArticles.filter(a => a.id !== article?.id).slice(0, 10).map((relatedArt) => (
                      <Link 
                        key={relatedArt.id} 
                        to={getArticlePath(relatedArt)} 
                        className="flex items-center gap-3 group"
                      >
                        {relatedArt.image && (
                          <img 
                            src={relatedArt.image} 
                            alt={relatedArt.name} 
                            className="object-cover w-16 h-16 rounded-lg"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2">
                            {relatedArt.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(relatedArt.created_at)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
