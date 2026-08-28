import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaFacebookF, FaInstagram, FaYoutube, FaEnvelope, FaPhone,
  FaArrowLeft, FaTelegram, FaWhatsapp, FaBoxOpen, FaTshirt,
  FaBook, FaStar, FaShoppingCart, FaTag, FaSearch, FaFilter,
  FaMapMarkerAlt, FaCheckCircle, FaBriefcase, FaLayerGroup
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { toast } from "react-toastify";
import SEO from "../../components/SEO/SEO";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────────────────────────────────────
// Filter categories
// ─────────────────────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all", label: "All", icon: FaLayerGroup },
  { key: "tools", label: "Medical Tools", icon: FaBoxOpen },
  { key: "apparel", label: "Apparel", icon: FaTshirt },
  { key: "books", label: "Books & Booklets", icon: FaBook },
];

// ─────────────────────────────────────────────────────────────────────────────
// Avatar - Circular with gradient and border
// ─────────────────────────────────────────────────────────────────────────────
function Avatar({ name, image, size = 72 }) {
  const [imgError, setImgError] = React.useState(false);
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-teal-500 to-emerald-600",
    "from-sky-500 to-blue-600",
    "from-indigo-500 to-violet-600",
  ];
  const idx = (name?.charCodeAt(0) || 0) % gradients.length;

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shadow-md border-[3px] border-white dark:border-[#1c1c1e] ring-1 ring-gray-100 dark:ring-gray-800 flex-shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-gradient-to-br ${gradients[idx]} flex items-center justify-center shadow-md flex-shrink-0 border-[3px] border-white dark:border-[#1c1c1e] ring-1 ring-gray-100 dark:ring-gray-800`}
    >
      <span className="text-white font-black" style={{ fontSize: size * 0.42 }}>
        {name?.charAt(0)?.toUpperCase() || "?"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Price chip
// ─────────────────────────────────────────────────────────────────────────────
function Price({ price, discount, finalPrice, currency = "₴" }) {
  const hasDisc = Number(discount) > 0;
  const fp = Number(finalPrice || (hasDisc ? price * (1 - discount / 100) : price)).toFixed(0);
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-sm font-bold text-gray-900 dark:text-white">{currency}{fp}</span>
      {hasDisc && (
        <>
          <span className="text-xs text-gray-400 line-through">{currency}{Number(price).toFixed(0)}</span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1 py-0.5 rounded">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product card - Meta aesthetic
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({ item }) {
  const { t } = useTranslation();
  return (
    <Link
      to={item._route}
      className="group bg-white dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
        {item._image ? (
          <img
            src={item._image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            onError={(e) => { e.target.src = "/logo.png"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <item._icon size={28} />
          </div>
        )}

        {/* Badges */}
        {item.is_bestseller && (
          <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            <FaStar size={8} /> {t("merchantsPage.best")}
          </span>
        )}
        {item._outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">
              {t("merchantsPage.outOfStock")}
            </span>
          </div>
        )}

        {/* Category chip */}
        <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-white bg-primary/80 px-2 py-0.5 rounded-full">
          {item._type}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs font-medium text-gray-800 dark:text-gray-100 line-clamp-2 mb-2 leading-snug group-hover:text-primary transition-colors">
          {item.name}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <Price price={item.price} discount={item.discount} finalPrice={item.final_price} />
          <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <item._actionIcon size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Social link button (chip)
// ─────────────────────────────────────────────────────────────────────────────
function SocialBtn({ href, icon: Icon, label, color }) {
  if (!href) return null;
  const safe = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 hover:scale-105 ${color}`}
    >
      <Icon size={11} />
      {label}
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function MerchantDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { getMerchantById } = useApi();
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter / search state
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getMerchantById(id);
        setMerchant(data);
      } catch (err) {
        setError(err.message);
        toast.error(t("merchantsPage.failedToLoadDetails"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, getMerchantById]);

  // Build unified product list
  const allProducts = useMemo(() => {
    if (!merchant) return [];
    const tools = (merchant.medical_tools || []).map((p) => ({
      ...p,
      _category: "tools",
      _type: "Tool",
      _image: p.images?.[0]?.url || null,
      _icon: FaBoxOpen,
      _actionIcon: FaShoppingCart,
      _outOfStock: !p.in_stock,
      _route: `/store/medical-tools/${p.id}`,
    }));
    const apparel = (merchant.apparels || []).map((p) => ({
      ...p,
      _category: "apparel",
      _type: "Apparel",
      _image: p.main_image || null,
      _icon: FaTshirt,
      _actionIcon: FaShoppingCart,
      _outOfStock: false,
      _route: `/store/medical-clothes/${p.id}`,
    }));
    const books = (merchant.books || []).map((p) => ({
      ...p,
      _category: "books",
      _type: p.product_type === "booklet" ? "Booklet" : "Book",
      _image: p.image || null,
      _icon: FaBook,
      _actionIcon: FaTag,
      _outOfStock: false,
      _route: p.product_type === "booklet" ? `/store/booklets/${p.id}` : `/store/books/${p.id}`,
    }));
    return [...tools, ...apparel, ...books];
  }, [merchant]);

  // Filtered + searched list
  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const matchCat = activeFilter === "all" || p._category === activeFilter;
      const matchSearch =
        !searchTerm ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allProducts, activeFilter, searchTerm]);

  // Count per category
  const counts = useMemo(() => ({
    all: allProducts.length,
    tools: allProducts.filter((p) => p._category === "tools").length,
    apparel: allProducts.filter((p) => p._category === "apparel").length,
    books: allProducts.filter((p) => p._category === "books").length,
  }), [allProducts]);

  // ── Loading & Error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#111111] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#111111] flex items-center justify-center">
        <div className="text-center bg-white dark:bg-[#1c1c1e] p-10 rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-red-500 mb-4 text-sm">{t("merchantsPage.failedToLoadDetails")}</p>
          <Link to="/merchants" className="text-sm text-primary hover:underline">← {t("merchantsPage.allMerchants")}</Link>
        </div>
      </div>
    );
  }

  const {
    name, job_title, email, phone, gender,
    bio, years_of_experience, expertise,
    facebook, instagram, youtube, whatsapp, telegram,
  } = merchant;

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#111111] pb-16">
      <SEO
        title={`${name} – Merchant`}
        description={bio || `Explore products by ${name} on Dr. KROK.`}
        url={`/merchants/${id}`}
      />

      <div className="container mx-auto max-w-7xl px-4 pt-10">
        
        {/* Back Button */}
        <Link to="/merchants" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-6">
          <FaArrowLeft size={10} />
          {t("merchantsPage.allMerchants")}
        </Link>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* ═══════════════════════════════════════════════════════════════
              SIDEBAR (Sticky, Meta-style, compact)
          ═══════════════════════════════════════════════════════════════ */}
          <aside className="w-full lg:w-[300px] flex-shrink-0 lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
              
              {/* Top color strip */}
              <div className="h-1 bg-primary" />

              <div className="p-6">
                {/* Header (Avatar + Name) */}
                <div className="flex items-center gap-4 mb-5">
                  <Avatar name={name} image={merchant.image} size={68} />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight truncate">{name}</h1>
                    {job_title && (
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{job_title}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                {(years_of_experience || counts.all > 0) && (
                  <div className="flex gap-2 mb-5">
                    {years_of_experience && (
                      <div className="flex-1 flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 text-base font-black text-gray-900 dark:text-white">
                          <FaBriefcase size={12} className="text-gray-400 dark:text-gray-500" />
                          {years_of_experience}
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap mt-0.5">{t("merchantsPage.yearsExp")}</span>
                      </div>
                    )}
                    {counts.all > 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 text-base font-black text-gray-900 dark:text-white">
                          <FaBoxOpen size={12} className="text-gray-400 dark:text-gray-500" />
                          {counts.all}
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap mt-0.5">{t("merchantsPage.products")}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags (Gender, Expertise) */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {gender && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-full capitalize">
                      <FaCheckCircle size={9} className="text-primary" /> {gender}
                    </span>
                  )}
                  {expertise && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {expertise}
                    </span>
                  )}
                </div>

                {/* Contact Links */}
                <div className="space-y-3 mb-5">
                  {email && (
                    <a href={`mailto:${email}`} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition-colors truncate">
                      <FaEnvelope size={11} className="flex-shrink-0" />
                      <span className="truncate">{email}</span>
                    </a>
                  )}
                  {phone && (
                    <a href={`tel:${phone}`} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                      <FaPhone size={11} className="flex-shrink-0" />
                      <span>{phone}</span>
                    </a>
                  )}
                  {merchant.address && (
                    <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <FaMapMarkerAlt size={11} className="flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{merchant.address}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {bio && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">{t("merchantsPage.about")}</p>
                    <div
                      className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed prose prose-xs dark:prose-invert max-w-none line-clamp-6"
                      dangerouslySetInnerHTML={{ __html: bio }}
                    />
                  </div>
                )}

                {/* Social Chips */}
                {(facebook || instagram || youtube || telegram || whatsapp) && (
                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                    <SocialBtn href={facebook} icon={FaFacebookF} label="Facebook" color="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" />
                    <SocialBtn href={instagram} icon={FaInstagram} label="Instagram" color="bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400" />
                    <SocialBtn href={youtube} icon={FaYoutube} label="YouTube" color="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" />
                    <SocialBtn href={telegram} icon={FaTelegram} label="Telegram" color="bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400" />
                    <SocialBtn href={whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g,"")}` : null} icon={FaWhatsapp} label="WhatsApp" color="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" />
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ═══════════════════════════════════════════════════════════════
              MAIN (Products, Search, Filters)
          ═══════════════════════════════════════════════════════════════ */}
          <main className="flex-1 min-w-0">
            
            {/* Search and Filters */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-3 sm:p-4 mb-5 shadow-sm min-w-0 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
                
                {/* Search */}
                <div className="relative w-full md:flex-1 md:max-w-md">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    placeholder={t("merchantsPage.searchProducts")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm bg-[#f5f5f7] dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-1.5 overflow-x-auto pb-1 md:pb-0 hide-scrollbar w-full md:w-auto min-w-0">
                  {FILTERS.map((f) => {
                    const cnt = counts[f.key];
                    if (f.key !== "all" && cnt === 0) return null;
                    const active = activeFilter === f.key;
                    return (
                      <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key)}
                        className={`flex-1 md:flex-none justify-center md:justify-start whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-2 md:py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          active
                            ? "bg-primary text-white shadow-sm"
                            : "bg-[#f5f5f7] dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        <f.icon size={10} className={active ? "text-white" : "text-gray-400 dark:text-gray-500"} />
                        {t(`merchantsPage.filters.${f.key}`)}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ml-0.5 ${
                          active ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}>
                          {cnt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Results count indicator */}
            {!loading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 px-1">
                {t("merchantsPage.showingProducts", { count: filtered.length })}
                {searchTerm && <span className="text-gray-900 dark:text-white">{t("merchantsPage.forSearch", { term: searchTerm })}</span>}
              </p>
            )}

            {/* Products Grid */}
            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                  <ProductCard key={`${item._category}-${item.id}`} item={item} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 rounded-2xl p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <FaSearch className="text-gray-400 dark:text-gray-500" size={18} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {t("merchantsPage.noProductsFound")}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("merchantsPage.noProductsSearchDesc", { term: searchTerm || "..." })}
                </p>
                {(searchTerm || activeFilter !== "all") && (
                  <button
                    onClick={() => { setSearchTerm(""); setActiveFilter("all"); }}
                    className="mt-4 px-4 py-1.5 bg-primary/10 text-primary font-semibold text-xs rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    {t("merchantsPage.clearAllFilters")}
                  </button>
                )}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
