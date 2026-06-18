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
  const { getBlogBySlug } = useApi();
  const { t, i18n } = useTranslation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      {/* Hero banner */}
      {article.image && (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto mt-8 sm:mt-10 lg:mt-12 overflow-hidden rounded-3xl max-w-7xl h-64 sm:h-80 lg:h-96 shadow-lg">
            <img
              src={article.image}
              alt={imageAlt}
              className="object-cover w-full h-full"
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 mx-auto max-w-7xl sm:p-8">
              <Link
                to="/articles"
                className="inline-flex items-center gap-2 mb-4 text-sm text-white/80 transition hover:text-white"
              >
                <FaArrowLeft />
                {t('articles.backToArticles')}
              </Link>
              <h1 className="max-w-4xl text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                {article.name}
              </h1>
            </div>
          </div>
        </div>
      )}

      <article className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
        {!article.image && (
          <>
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 mb-6 text-sm text-gray-600 transition hover:text-primary dark:text-gray-300"
            >
              <FaArrowLeft />
              {t('articles.backToArticles')}
            </Link>
            <h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">{article.name}</h1>
          </>
        )}

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 py-4 mb-6 border-b border-gray-200 dark:border-gray-700">
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
          <div className="lg:col-span-8">
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-a:text-primary prose-img:rounded-2xl prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.description }}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky p-6 space-y-5 bg-white border border-gray-100 shadow-sm top-24 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
              {article.image && (
                <img
                  src={article.image}
                  alt={imageAlt}
                  className="object-cover w-full rounded-xl max-h-48"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

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

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  {t('articles.publishedOn')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(article.created_at)}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
