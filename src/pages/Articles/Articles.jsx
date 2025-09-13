// TrainerArticlesPage.jsx
// React + Tailwind component (single-file) for an Articles page with:
// - Left sidebar: list of trainers (photo, name, role). Clicking a trainer filters articles.
// - Center: list of articles stacked vertically: Title -> Description -> Image -> Link
// - Right sidebar: professional trainer card with details and social icons (react-icons)
// - Dark / Light mode toggle (uses Tailwind `dark` class on <html>)
// - Responsive and accessible

import React, { useEffect, useState } from 'react';
import { FaLinkedin, FaTwitter, FaGlobe, FaMoon, FaSun, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

// ---------- Sample data ----------
const SAMPLE_TRAINERS = [
  {
    id: 't1',
    name: 'Mona El-Sayed',
    role: 'Frontend Instructor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80',
    bio: 'Senior frontend developer with 8+ years building React apps and beautiful UIs.',
    location: 'Cairo, Egypt',
    rating: 4.8,
    social: { linkedin: '#', twitter: '#', website: '#' }
  },
  {
    id: 't2',
    name: 'Ahmed Naguib',
    role: 'Fullstack Trainer',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
    bio: 'Fullstack engineer focusing on Node.js, databases and scalable architecture.',
    location: 'Alexandria, Egypt',
    rating: 4.6,
    social: { linkedin: '#', twitter: '#', website: '#' }
  },
  {
    id: 't3',
    name: 'Rania Fathy',
    role: 'Data Science Coach',
    avatar: 'https://images.unsplash.com/photo-1545996124-1b0b9a2f8a6a?w=600&q=80',
    bio: 'Data scientist who loves turning raw data into actionable insights.',
    location: 'Giza, Egypt',
    rating: 4.9,
    social: { linkedin: '#', twitter: '#', website: '#' }
  }
];

const SAMPLE_ARTICLES = [
  {
    id: 'a1',
    trainerId: 't1',
    title: 'Modern React Patterns: Hooks & Beyond',
    cover: 'https://images.unsplash.com/photo-1526378726084-3f5f6b8c8f8a?w=1200&q=80',
    excerpt: 'Learn best practices for structuring hooks, custom hooks, and performance tips.',
    url: '#'
  },
  {
    id: 'a2',
    trainerId: 't1',
    title: 'Designing Accessible Components',
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
    excerpt: 'Accessibility-first approach to building UI components everyone can use.',
    url: '#'
  },
  {
    id: 'a3',
    trainerId: 't2',
    title: 'Scaling Node.js APIs',
    cover: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
    excerpt: 'Practical strategies for scaling your Node.js backend and database layers.',
    url: '#'
  },
  {
    id: 'a4',
    trainerId: 't3',
    title: 'Intro to Machine Learning Pipelines',
    cover: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1200&q=80',
    excerpt: 'From raw data to model deployment: production-ready ML pipelines.',
    url: '#'
  }
];

// ---------- Component ----------
export default function TrainerArticlesPage() {
  const [trainers] = useState(SAMPLE_TRAINERS);
  const [articles] = useState(SAMPLE_ARTICLES);
  const [selectedTrainerId, setSelectedTrainerId] = useState(trainers[0].id);
  const [query, setQuery] = useState('');
  const [dark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('ui-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('ui-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const filteredArticles = articles.filter(a => a.trainerId === selectedTrainerId &&
    (a.title.toLowerCase().includes(query.toLowerCase()) || a.excerpt.toLowerCase().includes(query.toLowerCase()))
  );

  const selectedTrainer = trainers.find(t => t.id === selectedTrainerId);

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
      <div className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">Trainers Articles</h1>
           <div className="flex items-center gap-3">
            <label htmlFor="search" className="sr-only">Search</label>
            <input
              id="search"
              placeholder="Search by title or content..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="hidden px-3 py-2 placeholder-gray-400 bg-white border border-gray-200 rounded-lg sm:inline-block dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left - Trainers list */}
          <aside className="p-3 bg-white border border-gray-100 shadow-sm lg:col-span-3 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
            <h2 className="mb-3 text-lg font-medium">Trainers</h2>
            <div className="space-y-3">
              {trainers.map(tr => (
                <button
                  key={tr.id}
                  onClick={() => setSelectedTrainerId(tr.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${selectedTrainerId === tr.id ? 'border border-primary dark:border-primary bg-primary/10 dark:bg-primary/30 shadow-sm' : 'border border-primary/20 dark:border-primary/70 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <img src={tr.avatar} alt={tr.name} className="object-cover w-12 h-12 border-2 border-white rounded-full shadow-sm" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold leading-tight">{tr.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{tr.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Center - Articles stacked */}
          <main className="lg:col-span-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Articles by {selectedTrainer.name}</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">{filteredArticles.length} Articles</div>
            </div>

            {!filteredArticles.length ? (
              <div className="p-6 text-center bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">No articles found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredArticles.map(a => (
                  <article key={a.id} className="p-4 overflow-hidden bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                    <h4 className="mb-2 text-lg font-semibold">{a.title}</h4>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">{a.excerpt}</p>
                    {a.cover && (
                      <img src={a.cover} alt={a.title} className="object-cover w-full h-56 mb-3 rounded-lg" />
                    )}
                    {a.url && (
                      <a href={a.url} className="inline-block font-medium text-primary dark:text-primary hover:underline">Read more</a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </main>

          {/* Right - Professional Trainer Card */}
          <aside className="lg:col-span-3">
            <div className="sticky p-6 bg-white border border-gray-100 shadow-lg dark:bg-gray-800 rounded-2xl dark:border-gray-700 top-6">
              <div className="flex items-center gap-4">
                <img src={selectedTrainer.avatar} alt={selectedTrainer.name} className="object-cover w-20 h-20 border-2 rounded-full shadow-md border-primary" />
                <div>
                  <div className="text-xl font-semibold">{selectedTrainer.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">{selectedTrainer.role}</div>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{selectedTrainer.bio}</p>

              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400"><FaMapMarkerAlt /> {selectedTrainer.location}</div>
                <div className="flex items-center gap-1 text-yellow-500"><FaStar /> {selectedTrainer.rating}</div>
              </div>

              <div className="flex gap-3 mt-4">
                <a href={selectedTrainer.social.linkedin} className="p-2 transition bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"><FaLinkedin /></a>
                <a href={selectedTrainer.social.twitter} className="p-2 transition bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"><FaTwitter /></a>
                <a href={selectedTrainer.social.website} className="p-2 transition bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"><FaGlobe /></a>
              </div>

              <button className="w-full py-2 mt-5 font-medium text-white transition-all rounded-lg bg-primary hover:shadow-lg">Book a Session</button>
            </div>
          </aside>
        </div>
      </div>

 
    </div>
  );
}

 
