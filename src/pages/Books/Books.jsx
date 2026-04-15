import { useState, useEffect } from "react";
import { FiSearch, FiHeart, FiTruck, FiFileText, FiGrid, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoadingSpinner from "../../components/LoadingSpinner";

const BOOKS_PER_PAGE = 12;

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
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await request("books");
        setBooks(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await getFavorites();
        const favoriteIds = (response.data || []).map(fav => fav.table_id);
        setFavorites(favoriteIds);
      } catch {
        console.error("Failed to fetch favorites");
      }
    };

    fetchBooks();
    fetchFavorites();
  }, [request, getFavorites, i18n.language]);

  // Filter books by search term and type
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const bType = book.type?.toLowerCase().trim();
    const fType = typeFilter.toLowerCase();
    
    // Check if it matches hardcoded EN keys or current translated values
    const isDeliveryValue = bType === "delivery" || bType === t('books.delivery')?.toLowerCase().trim();
    const isPdfValue = bType === "pdf" || bType === "pdf only" || bType === t('books.pdf_only')?.toLowerCase().trim();

    let matchesType = false;
    if (fType === "all") {
      matchesType = true;
    } else if (fType === "delivery") {
      matchesType = isDeliveryValue;
    } else if (fType === "pdf") {
      matchesType = isPdfValue;
    }

    return matchesSearch && matchesType;
  });

  // Get books to display based on showAll state
  const displayedBooks = showAll ? filteredBooks : filteredBooks.slice(0, BOOKS_PER_PAGE);
  const hasMoreBooks = filteredBooks.length > BOOKS_PER_PAGE;

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

  return (
    <section className="min-h-screen px-4 py-12 md:px-10 lg:px-20 bg-background text-text">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-6 mb-10 md:flex-row">
          <h2 className="text-3xl font-bold md:text-4xl">{t('books.medical_books_store')}</h2>

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
            onClick={() => { setTypeFilter("all"); setShowAll(false); }}
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
            onClick={() => { setTypeFilter("Delivery"); setShowAll(false); }}
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
            onClick={() => { setTypeFilter("PDF"); setShowAll(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
              typeFilter === "PDF"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-surface border border-border text-text hover:border-primary hover:text-primary"
            }`}
          >
            <FiFileText className="text-lg" />
            {t('books.filter_pdf')}
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-text-secondary">
          {t('books.showing_results', { shown: displayedBooks.length, total: filteredBooks.length })}
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayedBooks.map((book) => {
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

        {/* Show More / Show Less Button */}
        {hasMoreBooks && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-8 py-3 font-medium transition-all duration-300 border rounded-full bg-surface border-border text-text hover:border-primary hover:text-primary hover:shadow-lg"
            >
              {showAll ? (
                <>
                  <FiChevronUp className="text-xl" />
                  {t('books.show_less')}
                </>
              ) : (
                <>
                  <FiChevronDown className="text-xl" />
                  {t('books.show_more')}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
