import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiHeart, FiTruck, FiFileText, FiGrid, FiChevronLeft, FiChevronRight, FiFilter, FiChevronDown, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import SEO from "../../components/SEO/SEO";

export default function Books() {
  const navigate = useNavigate();
  const { request, getFavorites, toggleFavorite } = useApi();
  const { t, i18n } = useTranslation();
  const { isLoggedIn } = useUser();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "Delivery", "PDF"

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Category filtering state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await request('categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, [request]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const path = selectedCategory 
        ? `categories/${selectedCategory}/books?page=${page}` 
        : `books?page=${page}`;
      const response = await request(path, { useCache: false });
      setBooks(response.data || []);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request, selectedCategory]);

  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage, i18n.language, selectedCategory]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setIsCategoryMenuOpen(false);
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await getFavorites();
        const favoriteIds = (response.data || []).map(fav => fav.table_id);
        setFavorites(favoriteIds);
      } catch {
        console.error("Failed to fetch favorites");
      }
    };
    fetchFavorites();
  }, [getFavorites]);

  // Filter books by search term and type (client-side on current page data)
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase());

    const bType = book.type?.toLowerCase().trim();
    const fType = typeFilter.toLowerCase();

    const isDeliveryValue = bType === "delivery" || bType === t('books.delivery')?.toLowerCase().trim();
    const isPdfValue = bType === "pdf" || bType === "pdf only" || bType === t('books.pdf_only')?.toLowerCase().trim();

    let matchesType = false;
    if (fType === "all") {
      matchesType = true;
    } else if (fType === "delivery") {
      matchesType = isDeliveryValue;
    } else if (fType === "pdf") {
      matchesType = isPdfValue;
    } else if (fType === "bestseller") {
      matchesType = book.is_bestseller === true;
    }

    return matchesSearch && matchesType;
  });

  const handlePageChange = (newPage) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.total_pages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (bookId) => {
    if (!isLoggedIn) {
      toast.info(t('auth.login_required') || 'Please login to use favorites');
      navigate('/Login');
      return;
    }
    setFavoritesLoading(true);
    try {
      const response = await toggleFavorite(bookId, 'book');
      setFavorites(prev =>
        response.message === "Added to favorites"
          ? [...prev, bookId]
          : prev.filter(id => id !== bookId)
      );
      toast.success(response.message);
    } catch (err) {
      toast.error("Failed to update favorites");
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Generate page numbers to show (with ellipsis)
  const getPageNumbers = () => {
    if (!pagination) return [];
    const { total_pages, current_page } = pagination;
    const pages = [];
    const delta = 2;

    for (let i = 1; i <= total_pages; i++) {
      if (
        i === 1 ||
        i === total_pages ||
        (i >= current_page - delta && i <= current_page + delta)
      ) {
        pages.push(i);
      } else if (
        i === current_page - delta - 1 ||
        i === current_page + delta + 1
      ) {
        pages.push('...');
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <section className="min-h-screen px-4 py-12 md:px-10 lg:px-20 bg-background text-text">
        <div className="mx-auto max-w-7xl">
          <LoadingSpinner
            variant="spinner"
            size="lg"
            className="text-primary"
          />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen px-4 py-12 md:px-10 lg:px-20 bg-background text-text">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-red-500">{t('books.error')}: {error}</div>
        </div>
      </section>
    );
  }

  const pageNumbers = getPageNumbers();

  return (
    <section className="min-h-screen px-4 py-12 md:px-10 lg:px-20 bg-background text-text">
      <SEO 
        title="Medical Books & Study Materials | KROK"
        description="Browse our collection of medical books, KROK booklets, and study materials. Available in PDF and delivery formats for medicine, dentistry, and pharmacy students."
        keywords="KROK Booklets, KROK Database, KROK Study Materials, KROK PDF, Буклети КРОК, База КРОК, Матеріали КРОК, КРОК PDF, Буклеты КРОК, База КРОК, Материалы КРОК, KROK PDF"
      />
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-6 mb-10 md:flex-row">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold md:text-4xl">{t('books.medical_books_store')}</h2>
            
            {/* Category Filter Button */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 border rounded-lg bg-surface border-border text-text hover:border-primary hover:text-primary"
              >
                <FiFilter className={selectedCategory ? 'text-primary' : ''} />
                {selectedCategory 
                  ? (categories.find(c => c.id === selectedCategory)?.name || t('books.select_category'))
                  : t('books.select_category') || 'Filter by Category'}
                <FiChevronDown className={`transition-transform duration-300 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/5" 
                    onClick={() => setIsCategoryMenuOpen(false)}
                  />
                  <div className="absolute left-0 z-50 w-64 mt-2 overflow-hidden border shadow-xl rounded-xl bg-surface border-border top-full animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => handleCategoryChange(null)}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-background/50 ${!selectedCategory ? 'bg-primary/10 text-primary font-semibold' : 'text-text'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{t('books.all_categories') || 'All Categories'}</span>
                          {!selectedCategory && <FiGrid className="text-primary" />}
                        </div>
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.id)}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-background/50 ${selectedCategory === category.id ? 'bg-primary/10 text-primary font-semibold' : 'text-text'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{category.name}</span>
                            {selectedCategory === category.id && <FiGrid className="text-primary" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute text-text-secondary top-3 left-3" />
            <input
              type="text"
              placeholder={t('books.search_books')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm border rounded-full bg-surface border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setTypeFilter("all")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
              typeFilter === "all"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-surface border border-border text-text hover:border-primary hover:text-primary"
            }`}
          >
            <FiGrid className="text-lg" />
            {t('books.filter_all')}
          </button>
          <button
            onClick={() => setTypeFilter("Delivery")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
              typeFilter === "Delivery"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-surface border border-border text-text hover:border-primary hover:text-primary"
            }`}
          >
            <FiTruck className="text-lg" />
            {t('books.filter_delivery')}
          </button>
          <button
            onClick={() => setTypeFilter("PDF")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
              typeFilter === "PDF"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-surface border border-border text-text hover:border-primary hover:text-primary"
            }`}
          >
            <FiFileText className="text-lg" />
            {t('books.filter_pdf')}
          </button>
          <button
            onClick={() => setTypeFilter("bestseller")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
              typeFilter === "bestseller"
                ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/25"
                : "bg-surface border border-border text-text hover:border-yellow-500 hover:text-yellow-500"
            }`}
          >
            <FiStar className="text-lg" />
            {t('books.filter_bestseller', 'Bestsellers')}
          </button>
        </div>

        {/* Results Count */}
        {pagination && (
          <div className="mb-6 text-sm text-text-secondary">
            {t('books.showing_results', {
              shown: filteredBooks.length,
              total: pagination.total_items
            })}
            {' '}— {t('books.page_of', { current: pagination.current_page, total: pagination.total_pages }) || `Page ${pagination.current_page} of ${pagination.total_pages}`}
          </div>
        )}

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => {
              const price = parseFloat(book.price);
              const discountPercent = parseFloat(book.discount);
              const discountAmount = discountPercent > 0 ? (price * discountPercent / 100) : 0;
              const oldPrice = discountPercent > 0 ? price.toFixed(2) : null;
              const discountedPrice = discountPercent > 0 ? Math.max(0, price - discountAmount).toFixed(2) : price.toFixed(2);

              return (
                <div
                  key={book.id}
                  className="relative flex flex-col overflow-hidden transition-all duration-500 border group rounded-2xl bg-surface border-border hover:shadow-2xl hover:-translate-y-2"
                >
                  {/* Book Image */}
                  <div className="relative h-56 overflow-hidden">
                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <span className="absolute z-10 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg shadow-md top-3 right-3">
                        {discountPercent}%
                      </span>
                    )}

                    {/* Favorite Heart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(book.id);
                      }}
                      disabled={favoritesLoading}
                      className="absolute z-20 p-2 transition-all duration-200 rounded-full shadow-lg opacity-100 top-3 left-3 bg-white/90 hover:bg-white disabled:opacity-50 group-hover:opacity-100"
                    >
                      <FiHeart className={`text-xl transition-colors ${favorites.includes(book.id) ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                    </button>

                    <img
                      src={book.image}
                      alt={book.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Bestseller Badge */}
                    {book.is_bestseller && (
                      <div className="absolute z-10 bottom-3 right-3 flex items-center gap-1 px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded-lg shadow-md">
                        <FiStar className="text-xs" /> {t('books.bestseller', 'Bestseller')}
                      </div>
                    )}
                  </div>

                  {/* Book Content */}
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="mb-2 text-lg font-semibold transition group-hover:text-primary">
                      {book.name}
                    </h3>
                    <div
                      className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: book.description }}
                    />

                    {/* Price Section */}
                    <div className="mb-4">
                      {oldPrice && (
                        <span className="mr-2 text-gray-400 line-through">
                          ₴{oldPrice}
                        </span>
                      )}
                      <span className="font-semibold text-primary">₴{discountedPrice}</span>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => navigate(`/book/${book.id}`)}
                      className="px-4 py-2 mt-auto font-medium text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110"
                    >
                      {t('books.view_details')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <FiSearch className="mx-auto mb-4 text-5xl text-text-muted opacity-20" />
            <h3 className="text-xl font-semibold text-text-secondary">
              {t('books.no_books_found') || 'No books found'}
            </h3>
            <p className="mt-2 text-text-muted">
              {t('books.try_different_filter') || 'Try a different category or search term'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchTerm("");
                setTypeFilter("all");
              }}
              className="mt-6 text-primary hover:underline font-medium"
            >
              {t('books.reset_filters') || 'Reset all filters'}
            </button>
          </div>
        )}

        {/* Server-Side Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {/* Prev Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.prev_page_url}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-300 border rounded-full bg-surface border-border text-text hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronLeft />
              {t('books.prev') || 'Prev'}
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 py-2 text-text-secondary">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
                    page === currentPage
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-surface border border-border text-text hover:border-primary hover:text-primary'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.next_page_url}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-300 border rounded-full bg-surface border-border text-text hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('books.next') || 'Next'}
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
