
import { useState, useEffect } from "react";
import { FiSearch, FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from 'react-i18next';

export default function Books() {
  const navigate = useNavigate();
  const { request } = useApi();
  const { t, i18n } = useTranslation();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);

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
    fetchBooks();
  }, [request, i18n.language]);

  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <section className="min-h-screen px-4 py-12 md:px-10 lg:px-20 bg-background text-text">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">{t('books.loading')}</div>
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

        {/* Books Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => {
            const price = parseFloat(book.price);
            const discountAmount = parseFloat(book.discount);
            const oldPrice = discountAmount > 0 ? (price + discountAmount).toFixed(2) : null;
            return (
              <div
                key={book.id}
                className="relative flex flex-col overflow-hidden transition-all duration-500 border group rounded-2xl bg-surface border-border hover:shadow-2xl hover:-translate-y-2"
              >
              {/* Book Image */}
              <div className="relative h-56 overflow-hidden">
                {/* Discount Badge */}
                {book.discount > 0 && (
                  <span className="absolute z-10 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg shadow-md top-3 right-3">
                    -{book.discount}%
                  </span>
                )}

                {/* Favorite Heart */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFavorites(prev => prev.includes(book.id) ? prev.filter(id => id !== book.id) : [...prev, book.id]);
                  }}
                  className="absolute p-1 transition rounded-full shadow-md top-3 left-3 bg-white/80 hover:bg-white"
                >
                  <FiHeart className={`text-xl ${favorites.includes(book.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
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
                  <p className="mb-3 text-sm text-text-secondary line-clamp-3">
                    {book.description}
                  </p>

                  {/* Price Section */}
                  <div className="mb-4">
                    {oldPrice && (
                      <span className="mr-2 text-gray-400 line-through">
                        ${oldPrice}
                      </span>
                    )}
                    <span className="font-semibold text-primary">${price.toFixed(2)}</span>
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
      </div>
    </section>
  );
}
