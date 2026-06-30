import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiCheck, FiImage } from "react-icons/fi";
import { useApi } from "../../../context/ApiContext";
import { useUser } from "../../../context/UserContext";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoadingSpinner from "../../../components/Common/LoadingSpinner";
import ErrorBoundary from "../../../components/Common/ErrorBoundary";

function ImageZoom({ src, alt }) {
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${src})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%' // Zoom level
    });
  };

  return (
    <div 
      className="relative w-full h-96 md:h-[500px] overflow-hidden bg-white rounded-2xl group cursor-zoom-in border border-border"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setZoomStyle({ display: 'none' })}
    >
      <img src={src} alt={alt} className="object-cover w-full h-full" />
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={zoomStyle}
      />
    </div>
  );
}

export default function MedicalClothesDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, toggleFavorite } = useApi();
  const { t } = useTranslation();
  const { isLoggedIn } = useUser();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [showSizeChart, setShowSizeChart] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        let response;
        let itemData = null;

        try {
          response = await request(`apparels/${id}`);
          if (response && Array.isArray(response.data)) {
            itemData = response.data.find(item => item.slug === id || String(item.id) === String(id));
          } else if (response && response.data) {
            itemData = response.data;
          } else if (response && !response.data && response.id) {
            itemData = response;
          }
        } catch (err) {
          console.warn("Failed to fetch specific item, trying fallback", err);
        }

        // Fallback to fetching list
        if (!itemData) {
          try {
            const listResponse = await request(`apparels`);
            if (listResponse && Array.isArray(listResponse.data)) {
              itemData = listResponse.data.find(item => item.slug === id || String(item.id) === String(id));
            } else if (Array.isArray(listResponse)) {
              itemData = listResponse.find(item => item.slug === id || String(item.id) === String(id));
            }
          } catch (fallbackErr) {
            console.error("Fallback fetch failed", fallbackErr);
          }
        }

        if (itemData) {
          setItem(itemData);
          setActiveImage(itemData.main_image);
        } else {
          setError("Item not found");
        }
      } catch (err) {
        setError(err.message || "Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, request]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.info(t('auth.login_required'));
      navigate('/login');
      return;
    }
    try {
      const response = await toggleFavorite(item.id, "apparel");
      setIsFavorite(response.message === "Added to favorites");
      toast.success(response.message);
    } catch (err) {
      toast.error("Failed to update favorites");
    }
  };

  const handleBuyNow = () => {
    if (!selectedColor && item.colors?.length > 0) {
      toast.error(t('books.select_color_first', 'Please select a color first'));
      return;
    }
    if (!selectedSize && item.sizes?.length > 0) {
      toast.error(t('books.select_size_first', 'Please select a size first'));
      return;
    }

    navigate('/store/checkout', {
      state: {
        item: item,
        productType: 'medical_clothes',
        itemType: 1, // Delivery
        color: selectedColor,
        size: selectedSize
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg text-red-500">{error || "Item not found"}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 mt-4 text-white rounded-lg bg-primary">Back</button>
      </div>
    );
  }

  const allImages = [item.main_image, ...(item.gallery?.map(g => g.url) || [])].filter(Boolean);

  return (
    <ErrorBoundary>
      <section className="min-h-screen px-4 py-12 bg-background text-text md:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 text-text-secondary hover:text-primary transition-colors"
          >
            <FiArrowLeft /> {t('books.back', 'Back to Store')}
          </button>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Gallery Section */}
            <div className="flex flex-col gap-4">
              <ImageZoom src={activeImage} alt={item.name} />
              
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt="Thumbnail" className="object-cover w-full h-full bg-white" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold md:text-4xl">{item.name}</h1>
                <button
                  onClick={handleToggleFavorite}
                  className="p-3 transition-colors bg-white border shadow-sm rounded-xl border-border hover:border-red-200 hover:bg-red-50 group"
                >
                  <FiHeart className={`text-2xl ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-500'}`} />
                </button>
              </div>

              {item.brand && <p className="mb-4 text-lg text-primary">{item.brand}</p>}

              <div className="flex items-end gap-4 mb-6">
                <span className="text-4xl font-black text-primary">₴{item.final_price?.toFixed(2)}</span>
                {item.discount > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through mb-1">₴{item.price}</span>
                    <span className="px-2 py-1 mb-2 text-sm font-bold text-white bg-red-500 rounded-lg">
                      {item.discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="w-full h-px mb-6 bg-border" />

              {/* Colors */}
              {item.colors && item.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase text-text-secondary">{t('books.select_color', 'Select Color')}</h3>
                  <div className="flex flex-wrap gap-3">
                    {item.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-transform ${selectedColor === color ? 'border-primary scale-110 shadow-md' : 'border-gray-200 hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${color}`}
                      >
                        {selectedColor === color && <FiCheck className="mx-auto text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {item.sizes && item.sizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold uppercase text-text-secondary">{t('books.select_size', 'Select Size')}</h3>
                    {item.size_chart && (
                      <button 
                        onClick={() => setShowSizeChart(true)}
                        className="flex items-center gap-1 text-sm font-medium underline text-primary"
                      >
                        <FiImage /> {t('books.size_chart', 'Size Chart')}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {item.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] px-3 py-2 rounded-lg border-2 font-medium transition-all ${selectedSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-text hover:border-gray-400'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleBuyNow}
                disabled={!item.in_stock}
                className="w-full py-4 text-lg font-bold text-white transition-all rounded-xl bg-primary hover:bg-primary-focus hover:-translate-y-1 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {item.in_stock ? t('books.buy_now', 'Buy Now') : t('books.out_of_stock', 'Out of Stock')}
              </button>

              <div className="mt-10">
                <h3 className="mb-4 text-xl font-bold">{t('books.description', 'Description')}</h3>
                <div 
                  className="leading-relaxed prose prose-sm dark:prose-invert max-w-none text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Size Chart Modal */}
        {showSizeChart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSizeChart(false)}>
            <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setShowSizeChart(false)}
                className="absolute flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-100 rounded-full top-4 right-4 hover:bg-gray-200"
              >
                ✕
              </button>
              <img src={item.size_chart} alt="Size Chart" className="object-contain w-full h-full max-h-[80vh]" />
            </div>
          </div>
        )}
      </section>
    </ErrorBoundary>
  );
}
