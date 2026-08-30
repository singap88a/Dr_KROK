import React, { useState, useEffect, useCallback } from "react";
import { FiSearch, FiHeart, FiTruck, FiFileText, FiGrid, FiChevronLeft, FiChevronRight, FiFilter, FiChevronDown, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../context/ApiContext";
import { useUser } from "../../../context/UserContext";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoadingSpinner from "../../../components/Common/LoadingSpinner";
import SEO from "../../../components/SEO/SEO";
import FlashOfferBanner from "../../../components/Home/FlashOfferBanner";

export default function StoreList({
  productType,
  apiPath,
  title,
  detailsRoute,
  seoTitle,
  seoDesc,
  CardComponent
}) {
  const navigate = useNavigate();
  const { request, getFavorites, toggleFavorite } = useApi();
  const { t, i18n } = useTranslation();
  const { isLoggedIn } = useUser();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  const isBookType = productType === 'book' || productType === 'booklet';
  const favoriteType = productType === 'medical_clothes' ? 'apparel' :
    isBookType ? 'book' : productType;

  const fetchCategories = useCallback(async () => {
    if (!isBookType && productType !== 'medical_clothes' && productType !== 'medical_tool') return;
    try {
      const endpoint = productType === 'medical_clothes' ? 'categoryApparel' : 'categories';
      const response = await request(endpoint);
      setCategories(response.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, [request, productType, isBookType]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      let path = `${apiPath}?page=${page}`;
      if (isBookType) {
        path += `&product_type=${productType}`;
      }
      if (productType === 'book' && selectedCategory) {
        path = `categories/${selectedCategory}/${apiPath}?page=${page}&product_type=${productType}`;
      } else if (productType === 'medical_clothes' && selectedCategory) {
        path = `apparel-categories/${selectedCategory}/apparels?page=${page}`;
      } else if (productType === 'medical_tool' && selectedCategory) {
        path = `categories/${selectedCategory}/${apiPath}?page=${page}`;
      }

      const response = await request(path, { useCache: false });

      const newItems = response.data || [];
      let apiPagination = response.pagination;

      // Fallback for endpoints like medical-tools that do not return pagination object
      if (!apiPagination && Array.isArray(newItems)) {
        const perPage = 15; // default page size
        let totalItems = newItems.length;

        try {
          // Fetch with large limit just to get the total count for accurate pagination
          const countPath = path.split('?')[0] + '?limit=1000';
          const countRes = await request(countPath, { useCache: true });
          if (countRes && countRes.data && Array.isArray(countRes.data)) {
            totalItems = countRes.data.length;
          }
        } catch (e) {
          console.warn('Could not fetch total count for fallback pagination');
        }

        const totalPages = Math.ceil(totalItems / perPage) || 1;

        apiPagination = {
          current_page: page,
          total_pages: totalPages,
          total_items: totalItems,
          prev_page_url: page > 1 ? true : null,
          next_page_url: page < totalPages ? true : null,
        };
      }

      setItems(newItems);
      setPagination(apiPagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request, selectedCategory, productType, apiPath, isBookType]);

  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage, i18n.language, selectedCategory, productType, apiPath, fetchItems]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setIsCategoryMenuOpen(false);
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await getFavorites();
        const favoriteIds = (response.data || [])
          .filter(fav => fav.type === favoriteType)
          .map(fav => fav.table_id);
        setFavorites(favoriteIds);
      } catch {
        console.error("Failed to fetch favorites");
      }
    };
    fetchFavorites();
  }, [getFavorites, favoriteType]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!isBookType) return matchesSearch;

    let matchesCategory = true;
    if (productType === 'booklet' && selectedCategory) {
      matchesCategory = item.categories?.some(c => c.id === selectedCategory) || false;
    }

    const bType = item.type?.toLowerCase().trim();
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
      matchesType = item.is_bestseller === true;
    }

    return matchesSearch && matchesType && matchesCategory;
  });

  const handlePageChange = (newPage) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.total_pages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (itemId) => {
    if (!isLoggedIn) {
      toast.info(t('auth.login_required') || 'Please login to use favorites');
      navigate('/login');
      return;
    }
    setFavoritesLoading(true);
    try {
      const response = await toggleFavorite(itemId, favoriteType);
      setFavorites(prev =>
        response.message === "Added to favorites"
          ? [...prev, itemId]
          : prev.filter(id => id !== itemId)
      );
      toast.success(response.message);
    } catch (err) {
      toast.error("Failed to update favorites");
    } finally {
      setFavoritesLoading(false);
    }
  };

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
          <LoadingSpinner variant="spinner" size="lg" className="text-primary" />
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
        title={t(title) || seoTitle}
        description={seoDesc || "Browse our store."}
      />
      <div className="mx-auto max-w-7xl">
        {/* Dynamic Type-specific Flash Offer Banner */}
        <FlashOfferBanner type={productType} />

        <div className="flex flex-col items-center justify-between gap-6 mb-10 md:flex-row">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold md:text-4xl">
              {t(title)}
            </h2>

            <div className="flex flex-wrap gap-3">
              {(isBookType || productType === 'medical_clothes' || productType === 'medical_tool') && (
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
                      <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsCategoryMenuOpen(false)} />
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
              )}

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none flex items-center gap-2 px-4 py-2 pr-10 text-sm font-medium transition-all duration-300 border rounded-lg bg-surface border-border text-text hover:border-primary hover:text-primary focus:outline-none focus:border-primary"
                >
                  <option value="default">{t('books.sort_default', 'Sort: Default')}</option>
                  <option value="price_asc">{t('books.sort_price_asc', 'Price: Low to High')}</option>
                  <option value="price_desc">{t('books.sort_price_desc', 'Price: High to Low')}</option>
                  <option value="bestseller">{t('books.sort_bestseller', 'Bestsellers First')}</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
          </div>

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

        {productType === 'book' && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button onClick={() => setTypeFilter("all")} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${typeFilter === "all" ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-surface border border-border text-text hover:border-primary hover:text-primary"}`}>
              <FiGrid className="text-lg" /> {t('books.filter_all')}
            </button>
            <button onClick={() => setTypeFilter("Delivery")} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${typeFilter === "Delivery" ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-surface border border-border text-text hover:border-primary hover:text-primary"}`}>
              <FiTruck className="text-lg" /> {t('books.filter_delivery')}
            </button>
            <button onClick={() => setTypeFilter("PDF")} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${typeFilter === "PDF" ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-surface border border-border text-text hover:border-primary hover:text-primary"}`}>
              <FiFileText className="text-lg" /> {t('books.filter_pdf')}
            </button>
            <button onClick={() => setTypeFilter("bestseller")} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${typeFilter === "bestseller" ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/25" : "bg-surface border border-border text-text hover:border-yellow-500 hover:text-yellow-500"}`}>
              <FiStar className="text-lg" /> {t('books.filter_bestseller', 'Bestsellers')}
            </button>
          </div>
        )}

        {pagination && (
          <div className="mb-6 text-sm text-text-secondary">
            {t('books.showing_results', { shown: filteredItems.length, total: pagination.total_items })} — {t('books.page_of', { current: pagination.current_page, total: pagination.total_pages }) || `Page ${pagination.current_page} of ${pagination.total_pages}`}
          </div>
        )}

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {(() => {
              let displayedItems = [...filteredItems];
              if (sortBy === 'price_asc') {
                displayedItems.sort((a, b) => (parseFloat(a.final_price) || parseFloat(a.price) || 0) - (parseFloat(b.final_price) || parseFloat(b.price) || 0));
              } else if (sortBy === 'price_desc') {
                displayedItems.sort((a, b) => (parseFloat(b.final_price) || parseFloat(b.price) || 0) - (parseFloat(a.final_price) || parseFloat(a.price) || 0));
              } else if (sortBy === 'bestseller') {
                displayedItems.sort((a, b) => (b.is_bestseller === a.is_bestseller) ? 0 : b.is_bestseller ? 1 : -1);
              }

              return displayedItems.map((item) => (
                <CardComponent
                  key={item.id}
                  item={item}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  isLoadingFavorite={favoritesLoading}
                  detailsRoute={detailsRoute}
                />
              ));
            })()}
          </div>
        ) : (
          <div className="py-20 text-center">
            <FiSearch className="mx-auto mb-4 text-5xl text-text-muted opacity-20" />
            <h3 className="text-xl font-semibold text-text-secondary">{t('books.no_books_found') || 'No items found'}</h3>
            <p className="mt-2 text-text-muted">{t('books.try_different_filter') || 'Try a different search term'}</p>
            <button
              onClick={() => { setSelectedCategory(null); setSearchTerm(""); setTypeFilter("all"); }}
              className="mt-6 text-primary hover:underline font-medium"
            >
              {t('books.reset_filters') || 'Reset all filters'}
            </button>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.prev_page_url}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-300 border rounded-full bg-surface border-border text-text hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronLeft /> {t('books.prev') || 'Prev'}
            </button>

            {pageNumbers.map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 py-2 text-text-secondary">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${page === currentPage ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-surface border border-border text-text hover:border-primary hover:text-primary'}`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.next_page_url}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-300 border rounded-full bg-surface border-border text-text hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('books.next') || 'Next'} <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
