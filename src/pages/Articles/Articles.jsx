 

import React, { useEffect, useMemo, useState } from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaStar } from 'react-icons/fa';
import { useApi } from '../../context/ApiContext';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/LoadingSpinner';

 

// ---------- Component ----------
export default function TrainerArticlesPage() {
  const { getBlogs, getInstructors } = useApi();
  const { t, i18n } = useTranslation();
  const [instructors, setInstructors] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});

  const currentLang = (i18n?.language || 'en').split('-')[0];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [inst] = await Promise.all([
          getInstructors()
        ]);
        if (!mounted) return;
        setInstructors(inst);

        const res = await getBlogs({ page: 1, per_page: 15 });
        if (!mounted) return;
        setBlogs(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || t('articles.error'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [getBlogs, getInstructors, t]);

  useEffect(() => {
    // reset expansion on language change to recompute truncation length if needed
    setExpanded({});
  }, [currentLang]);

  const filteredBlogs = useMemo(() => {
    if (!selectedInstructorId) return blogs;
    return blogs.filter(b => String(b.instructor_id?.id) === String(selectedInstructorId));
  }, [blogs, selectedInstructorId]);

  const selectedInstructor = useMemo(() => {
    return instructors.find(i => String(i.id) === String(selectedInstructorId)) || null;
  }, [instructors, selectedInstructorId]);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return div.textContent || div.innerText || '';
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
                onClick={() => setSelectedInstructorId(null)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${selectedInstructorId === null ? 'border border-primary dark:border-primary bg-primary/10 dark:bg-primary/30 shadow-sm' : 'border border-primary/20 dark:border-primary/70 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {t('articles.allInstructors')}
              </button>
              {instructors.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => setSelectedInstructorId(tr.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${String(selectedInstructorId) === String(tr.id) ? 'border border-primary dark:border-primary bg-primary/10 dark:bg-primary/30 shadow-sm' : 'border border-primary/20 dark:border-primary/70 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <img src={tr.image} alt={tr.name} className="object-cover w-12 h-12 border-2 border-white rounded-full shadow-sm" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold leading-tight">{tr.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{tr.job_title || t('instructors.noJobTitle')}</div>
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
              <div className="text-sm text-gray-500 dark:text-gray-400">{filteredBlogs.length} {t('articles.count')}</div>
            </div>

            {loading ? (
              <div className="p-6 text-center bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                <LoadingSpinner
                  variant="spinner"
                  size="lg"
                  className="text-primary"
                />
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600 bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl dark:border-gray-700">{t('articles.error')}</div>
            ) : !filteredBlogs.length ? (
              <div className="p-6 text-center bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl dark:border-gray-700">{t('articles.noArticles')}</div>
            ) : (
              <div className="grid gap-4">
                {filteredBlogs.map((b) => {
                  const text = stripHtml(b.description || '');
                  const isExpanded = !!expanded[b.id];
                  const maxChars = 200;
                  const showToggle = text.length > maxChars;
                  const display = isExpanded ? text : text.slice(0, maxChars) + (showToggle ? '...' : '');
                  const instr = b.instructor_id || {};
                  return (
                    <article key={b.id} className="p-4 overflow-hidden bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                      <h4 className="mb-2 text-lg font-semibold">{b.name}</h4>
                      <p className="mb-3 text-sm text-gray-600 whitespace-pre-line dark:text-gray-300">{display}</p>
                      {showToggle && (
                        <button onClick={() => toggleExpand(b.id)} className="mb-3 text-sm font-medium text-primary hover:underline">
                          {isExpanded ? t('articles.showLess') : t('articles.showMore')}
                        </button>
                      )}
                      {b.image && (
                        <img src={b.image} alt={b.name} className="object-cover w-full h-56 mb-3 rounded-lg" />
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <img src={instr.image} alt={instr.name} className="object-cover w-10 h-10 rounded-full" />
                        <div>
                          <div className="text-sm font-medium">{instr.name}</div>
                          {instr.job_title && <div className="text-xs text-gray-500 dark:text-gray-400">{instr.job_title}</div>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>

          <aside className="lg:col-span-3">
            {selectedInstructor ? (
              <div className="sticky p-6 bg-white border border-gray-100 shadow-lg dark:bg-gray-800 rounded-2xl dark:border-gray-700 top-6">
                <div className="flex items-center gap-4">
                  <img src={selectedInstructor.image} alt={selectedInstructor.name} className="object-cover w-20 h-20 border-2 rounded-full shadow-md border-primary" />
                  <div>
                    <div className="text-xl font-semibold">{selectedInstructor.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{selectedInstructor.job_title || t('instructors.noJobTitle')}</div>
                  </div>
                </div>

                <div className="grid gap-2 mt-4 text-sm">
                  {selectedInstructor.email && (
                    <div className="text-gray-600 dark:text-gray-300">{selectedInstructor.email}</div>
                  )}
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

 
