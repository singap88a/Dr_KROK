import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiBook, FiUser, FiStar, FiGlobe, FiArrowLeft, FiX } from "react-icons/fi";
import { useApi } from "../../context/ApiContext";
import he from 'he';
import { useTranslation } from 'react-i18next';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request } = useApi();
  const { t, i18n } = useTranslation();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [showPdf, setShowPdf] = useState(false);

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
    if (id) fetchBookDetails();
  }, [id, request, i18n.language]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg">{t('books.loading_book_details')}</p>
      </div>
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
            <div className="w-full overflow-hidden border h-80 rounded-xl border-border">
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
              <div className="flex items-center gap-2">
                <FiGlobe className="text-primary" /> {t('books.status')}: {book.is_active ? t('books.active') : t('books.inactive')}
              </div>
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
                  onClick={() => setShowPdf(true)}
                  className="px-8 py-3 font-medium transition border text-primary rounded-xl border-primary hover:bg-primary hover:text-white"
                >
                  {t('books.view_pdf')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Popup */}
      {showPdf && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-[90%] h-[80%] bg-white rounded-xl overflow-hidden shadow-xl">
            {/* Close Button */}
            <button
              onClick={() => setShowPdf(false)}
              className="absolute z-10 p-2 bg-gray-200 rounded-full top-3 right-3 hover:bg-gray-300"
            >
              <FiX className="text-xl text-gray-700" />
            </button>

            {/* PDF Info */}
            {pdfFiles.length > 0 && (
              <div className="absolute z-10 p-3 bg-white/90 top-3 left-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  {pdfFiles[0].file_name}
                </p>
                <p className="text-xs text-gray-500">
                  {(pdfFiles[0].size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            {/* PDF Viewer */}
            <iframe
              src={pdfUrl}
              title="Book PDF"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}
