import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiBook, FiUser, FiStar, FiGlobe, FiArrowLeft, FiHeart, FiGrid, FiTag } from "react-icons/fi";
import { useApi } from "../../../context/ApiContext";
import { useUser } from "../../../context/UserContext";
import he from 'he';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoadingSpinner from "../../../components/Common/LoadingSpinner";
import PDFViewer from "../../../components/Books/PDFViewer";
import ErrorBoundary from "../../../components/Common/ErrorBoundary";

export default function StoreDetails({ productType, apiPath, checkoutRoute }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, toggleFavorite } = useApi();
  const { t, i18n } = useTranslation();
  const { isLoggedIn } = useUser();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [showPdf, setShowPdf] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const isBookType = productType === 'book' || productType === 'booklet';
  const favoriteType = productType === 'medical_clothes' ? 'apparel' : 
                       isBookType ? 'book' : productType;

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        let response;
        let itemData = null;
        
        try {
          response = await request(`${apiPath}/${id}`);
          // Handle different backend response structures
          if (response && Array.isArray(response.data)) {
              itemData = response.data.find(item => item.slug === id || String(item.id) === String(id));
          } else if (response && response.data) {
              itemData = response.data;
          } else if (response && !response.data && response.id) {
              itemData = response;
          }
        } catch (err) {
          console.warn("Failed to fetch specific item, trying to fetch the list as fallback", err);
        }

        // Fallback: If item not found (e.g. backend doesn't support fetching by slug yet)
        if (!itemData) {
            try {
                const listResponse = await request(apiPath);
                if (listResponse && Array.isArray(listResponse.data)) {
                    itemData = listResponse.data.find(item => item.slug === id || String(item.id) === String(id));
                } else if (Array.isArray(listResponse)) {
                    itemData = listResponse.find(item => item.slug === id || String(item.id) === String(id));
                }
            } catch (fallbackErr) {
                console.error("Fallback fetch failed", fallbackErr);
            }
        }

        if (!itemData) {
            throw new Error("Item not found");
        }
        if (itemData.description) {
            itemData.description = he.decode(itemData.description);
        }
        setItem(itemData);
        const images = Object.values(itemData.images || {});
        setMainImage(images[0]?.url || images[0]?.original_url || itemData.main_image || itemData.image || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const checkFavoriteStatus = async () => {
      if (!isLoggedIn) return;
      try {
        const response = await request("favorites", { auth: true });
        const favorites = response.data || [];
        const isItemFavorite = favorites.some(fav => 
          fav.table_id === parseInt(id) && fav.type === favoriteType
        );
        setIsFavorite(isItemFavorite);
      } catch (err) {
        console.error("Failed to check favorite status:", err);
      }
    };

    if (id) {
      fetchItemDetails();
      checkFavoriteStatus();
    }
  }, [id, request, i18n.language, isLoggedIn, apiPath, favoriteType]);

  const handleViewPdf = (url) => {
    setCurrentPdfUrl(url);
    setShowPdf(true);
  };

  const handleToggleFavorite = async () => {
    if (!item) return;
    if (!isLoggedIn) {
      toast.info(t('auth.login_required') || 'Please login to use favorites');
      navigate('/login');
      return;
    }
    
    setFavoriteLoading(true);
    try {
      const response = await toggleFavorite(item.id, favoriteType);
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
          <LoadingSpinner variant="spinner" size="lg" className="text-primary" />
        </div>
      </section>
    );
  }

  if (error || !item) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg text-red-500">{error || t('books.book_not_found')}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 mt-4 text-white rounded-lg bg-primary">
          {t('books.back')}
        </button>
      </div>
    );
  }

  const images = Object.values(item.images || {});
  const pdfFiles = Object.values(item.book_pdf || {});
  const previewPdfUrl = item.mini_book_pdf || null;

  return (
    <section className="min-h-screen px-4 py-12 transition-colors duration-300 md:px-10 lg:px-20 bg-background text-text">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-text-secondary hover:text-primary">
          <FiArrowLeft /> {t('books.back')}
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative w-full overflow-hidden border h-80 rounded-xl border-border bg-gray-100">
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className="absolute z-20 p-3 transition-all duration-200 rounded-full shadow-lg opacity-100 top-4 right-4 bg-white/90 hover:bg-white disabled:opacity-50 group-hover:opacity-100"
              >
                <FiHeart className={`text-2xl transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} />
              </button>
              
              <img
                src={mainImage}
                alt={item.name}
                className="object-cover w-full h-full"
                onError={(e) => { e.currentTarget.src = "/logo.png"; }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 mt-4 overflow-x-auto custom-scrollbar">
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setMainImage(img.url || img.original_url)}
                    className={`shrink-0 w-20 h-20 border rounded-lg overflow-hidden cursor-pointer transition ${mainImage === (img.url || img.original_url) ? "border-primary" : "border-border"}`}
                  >
                    <img src={img.url || img.original_url} alt={`thumb-${i}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <div 
              className={`mt-3 text-lg text-text-secondary ${!isExpanded ? 'line-clamp-4' : ''}`}
              dangerouslySetInnerHTML={{ __html: item.description }} 
            />
            {item.description && item.description.length > 200 && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="mt-2 font-medium underline text-primary hover:text-primary/80">
                {isExpanded ? "Show Less" : "Read More"}
              </button>
            )}

            {isBookType && (
              <div className="grid grid-cols-1 gap-4 mt-6 text-sm text-text-secondary md:grid-cols-2">
                {item.pages_count && (
                  <div className="flex items-center gap-2">
                    <FiBook className="text-primary" /> {t('books.pages')}: {item.pages_count}
                  </div>
                )}
                {item.author && (
                  <div className="flex items-center gap-2">
                    <FiUser className="text-primary" /> {t('books.author')}: {item.author}
                  </div>
                )}
                {item.language && (
                  <div className="flex items-center gap-2">
                    <FiGlobe className="text-primary" /> {t('books.language')}: {item.language}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FiGrid className="text-primary" /> {item.categories && item.categories.length > 1 ? t('books.categories') : t('books.category')}: {item.categories && item.categories.length > 0 ? item.categories.map(cat => cat.name).join(', ') : (item.category?.name || t('books.no_category'))}
                </div>
                {item.type && (
                  <div className="flex items-center gap-2">
                    <FiTag className="text-primary" /> {t('books.type')}: {(item.type?.toLowerCase().trim() === "delivery" || item.type?.toLowerCase().trim() === t('books.delivery')?.toLowerCase().trim()) ? t('books.delivery') : t('books.pdf_only')}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              {item.discount > 0 && (
                <span className="text-lg text-gray-400 line-through">₴{parseFloat(item.price).toFixed(2)}</span>
              )}
              <span className="text-2xl font-semibold text-primary">
                ₴{item.discount > 0 ? (parseFloat(item.price) - (parseFloat(item.price) * parseFloat(item.discount) / 100)).toFixed(2) : parseFloat(item.price || 0).toFixed(2)}
              </span>
              {item.discount > 0 && (
                <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">{parseFloat(item.discount)}% OFF</span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <Link to={checkoutRoute} state={{ item, itemType: item.type, productType }}>
                <button className="px-8 py-3 font-medium text-white transition rounded-xl bg-primary hover:shadow-lg hover:brightness-110">
                  {t('books.buy_now')}
                </button>
              </Link>

              {isBookType && previewPdfUrl && (
                <button
                  onClick={() => handleViewPdf(previewPdfUrl)}
                  className="px-8 py-3 font-medium transition border text-primary rounded-xl border-primary hover:bg-primary hover:text-white"
                >
                  {t('books.preview_pdf')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPdf && currentPdfUrl && isBookType && (
        <ErrorBoundary
          fallback={
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-white p-6">
              <p className="text-red-400 font-semibold mb-4 text-center">Failed to render book reader preview.</p>
              <button onClick={() => setShowPdf(false)} className="px-6 py-2.5 bg-primary text-white rounded-lg hover:opacity-95 font-semibold">
                Close Reader
              </button>
            </div>
          }
        >
          <PDFViewer key={currentPdfUrl} url={currentPdfUrl} onClose={() => setShowPdf(false)} fileName={item.name} />
        </ErrorBoundary>
      )}
    </section>
  );
}
