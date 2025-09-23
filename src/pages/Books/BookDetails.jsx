import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiBook, FiUser, FiStar, FiGlobe, FiArrowLeft, FiHeart, FiX } from "react-icons/fi";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import he from 'he';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoadingSpinner from "../../components/LoadingSpinner";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, toggleFavorite } = useApi();
  const { t, i18n } = useTranslation();
  const { isLoggedIn } = useUser();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [showPdf, setShowPdf] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await request(`books/${id}`);
        const bookData = response.data;
        bookData.description = he.decode(bookData.description);
        setBook(bookData);
        const images = Object.values(bookData.images || {});
        setMainImage(images[0]?.original_url || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const checkFavoriteStatus = async () => {
      try {
        const response = await request("favorites", { auth: true });
        const favorites = response.data || [];
        const isBookFavorite = favorites.some(fav => 
          fav.table_id === parseInt(id) && fav.type === 'book'
        );
        setIsFavorite(isBookFavorite);
      } catch (err) {
        console.error("Failed to check favorite status:", err);
      }
    };

    if (id) {
      fetchBookDetails();
      checkFavoriteStatus();
    }
  }, [id, request, i18n.language]);

  const handleViewPdf = () => {
    setShowPdf(true);
    setPdfLoadError(false);
  };

  const handleToggleFavorite = async () => {
    if (!book) return;
    if (!isLoggedIn) {
      toast.info(t('auth.login_required') || 'Please login to use favorites');
      navigate('/Login');
      return;
    }
    
    setFavoriteLoading(true);
    try {
      const response = await toggleFavorite(book.id, 'book');
      setIsFavorite(response.message === "Added to favorites");
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message || "Failed to update favorites");
    } finally {
      setFavoriteLoading(false);
    }
  };



  if (loading) {
    return (
      <section className="min-h-screen px-4 py-12 transition-colors duration-300 md:px-10 lg:px-20 bg-background text-text">
        <div className="max-w-6xl mx-auto">
          <LoadingSpinner
            variant="spinner"
            size="lg"
            className="text-primary"
          />
        </div>
      </section>
    );
  }

  if (error || !book) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg text-red-500">{error || t('books.book_not_found')}</p>
        <button
          onClick={() => navigate("/books")}
          className="px-6 py-2 mt-4 text-white rounded-lg bg-primary"
        >
          {t('books.back_to_books')}
        </button>
      </div>
    );
  }

  const images = Object.values(book.images || {});
  const pdfFiles = Object.values(book.book_pdf || {});
  const pdfUrl = pdfFiles.length > 0 ? pdfFiles[0].original_url : null;

  return (
    <section className="min-h-screen px-4 py-12 transition-colors duration-300 md:px-10 lg:px-20 bg-background text-text">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-text-secondary hover:text-primary"
        >
          <FiArrowLeft /> {t('books.back')}
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Images */}
          <div>
            <div className="relative w-full overflow-hidden border h-80 rounded-xl border-border">
              {/* Favorite Heart */}
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className="absolute z-20 p-3 transition-all duration-200 rounded-full shadow-lg opacity-100 top-4 right-4 bg-white/90 hover:bg-white disabled:opacity-50 group-hover:opacity-100"
              >
                <FiHeart 
                  className={`text-2xl transition-colors ${
                    isFavorite 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-gray-400 hover:text-red-500'
                  }`} 
                />
              </button>
              
              <img
                src={mainImage}
                alt={book.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex gap-4 mt-4">
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setMainImage(img.original_url)}
                  className={`w-20 h-20 border rounded-lg overflow-hidden cursor-pointer transition ${
                    mainImage === img.original_url ? "border-primary" : "border-border"
                  }`}
                >
                  <img
                    src={img.original_url}
                    alt={`thumb-${i}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold">{book.name}</h1>
            <div className="mt-3 text-lg text-text-secondary" dangerouslySetInnerHTML={{ __html: book.description }} />

            {/* Book Information */}
            <div className="grid grid-cols-1 gap-4 mt-6 text-sm text-text-secondary md:grid-cols-2">
              <div className="flex items-center gap-2">
                <FiBook className="text-primary" /> {t('books.pages')}: {book.pages_count}
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="text-primary" /> {t('books.author')}: {book.author}
              </div>
              <div className="flex items-center gap-2">
                <FiGlobe className="text-primary" /> {t('books.language')}: {book.language}
              </div>
              <div className="flex items-center gap-2">
                <FiGlobe className="text-primary" /> {t('books.category')}: {book.category?.name}
              </div>
              <div className="flex items-center gap-2">
                <FiGlobe className="text-primary" /> {t('books.quantity')}: {book.quantity}
              </div>
              <div className="flex items-center gap-2">
                <FiGlobe className="text-primary" /> {t('books.type')}: {book.type === 1 ? t('books.delivery') : t('books.pdf_only')}
              </div>
              {/* <div className="flex items-center gap-2">
                <FiGlobe className="text-primary" /> {t('books.status')}: {book.is_active ? t('books.active') : t('books.inactive')}
              </div> */}
              <div className="flex items-center gap-2">
                <FiGlobe className="text-primary" /> {t('books.created')}: {new Date(book.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mt-6">
              {book.discount > 0 && (
                <span className="text-lg text-gray-400 line-through">
                  ${parseFloat(book.price) + parseFloat(book.discount)}
                </span>
              )}
              <span className="text-2xl font-semibold text-primary">${book.price}</span>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <Link to="/buynow" state={{ book, bookType: book.type }}>
                <button className="px-8 py-3 font-medium text-white transition rounded-xl bg-primary hover:shadow-lg hover:brightness-110">
                  {t('books.buy_now')}
                </button>
              </Link>

              {pdfUrl && (
                <button
                  onClick={handleViewPdf}
                  className="px-8 py-3 font-medium transition border text-primary rounded-xl border-primary hover:bg-primary hover:text-white"
                >
                  {t('books.view_pdf')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simple PDF Viewer Modal */}
      {showPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative w-full h-full max-w-6xl mx-4 overflow-hidden bg-white rounded-lg">
            {/* Header with title and close button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 text-white bg-gray-800">
              <h3 className="text-lg font-medium">{book.name}</h3>
              <button 
                onClick={() => setShowPdf(false)}
                className="p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* PDF Container */}
            <div className="h-full pt-12 pb-4">
              {pdfLoadError ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="mb-4 text-red-500">{t('books.pdf_load_error')}</p>
                  <button 
                    onClick={() => setShowPdf(false)}
                    className="px-4 py-2 text-white rounded-lg bg-primary"
                  >
                    {t('books.close')}
                  </button>
                </div>
              ) : (
<iframe
  src={`${pdfUrl}#toolbar=0`}
  className="w-full h-full border-0"
  title="PDF Viewer"
/>

              )}
            </div>
            
            {/* Warning message */}
            <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-center text-white bg-gray-900">
              {t('books.pdf_view_only')}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}