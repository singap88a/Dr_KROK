import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiUser, FiPhone, FiMapPin, FiHome, FiCreditCard, FiRefreshCw } from "react-icons/fi";
import { FaCcVisa, FaCcMastercard, FaCcPaypal } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from 'react-i18next';
import CitySelector from "../../components/CitySelector";

export default function BuyNowPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { request } = useApi();
  const { userData, isLoggedIn } = useUser();
  const { t } = useTranslation();

  const book = state?.book;
  const bookType = state?.bookType; // 1 = delivery, 2 = PDF only

  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data for delivery books
  const [formData, setFormData] = useState({
    client_id: "",
    client_name: "",
    phone1: "",
    phone2: "",
    city: "",
    address: "",
    street: "",
    city_id: "",
    book_id: "",
    quantity: 1
  });

  // Payment method for PDF books
  const [selectedPayment, setSelectedPayment] = useState("");

  // Paint order data
  const [loadingPaintData, setLoadingPaintData] = useState(false);
  
  // Cities data
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (book?.images) {
      const images = Object.values(book.images);
      setMainImage(images[0]?.original_url || null);
    }
  }, [book]);

  // Set client_id and book_id from user data and book
  useEffect(() => {
    if (userData?.id) {
      setFormData(prev => ({
        ...prev,
        client_id: userData.id.toString()
      }));
    }
    if (book?.id) {
      setFormData(prev => ({
        ...prev,
        book_id: book.id.toString()
      }));
    }
  }, [userData, book]);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await request('cities');
        if (response && response.data) {
          setCities(response.data);
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
      }
    };
    fetchCities();
  }, [request]);

  // Fetch paint order data
  const fetchPaintOrderData = async () => {
    setLoadingPaintData(true);
    setError("");
    try {
      const response = await request('paint_order_data'); // Adjust endpoint as needed
      if (response && response.data) {
        // Populate form with paint order data
        setFormData(prev => ({
          ...prev,
          client_name: response.data.client_name || prev.client_name,
          phone1: response.data.phone1 || prev.phone1,
          phone2: response.data.phone2 || prev.phone2,
          city: response.data.city || prev.city,
          address: response.data.address || prev.address,
          street: response.data.street || prev.street
        }));
      }
    } catch (err) {
      // Handle 404 error gracefully - this endpoint may not exist
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        setError('Paint order data feature is not available at the moment. Please fill in your details manually.');
      } else {
        setError(err.message || 'Failed to load paint data');
      }
      console.error('Error fetching paint order data:', err);
    } finally {
      setLoadingPaintData(false);
    }
  };

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-center">
          <p className="text-lg text-red-500">{t('books.no_book_selected')}</p>
          <button
            onClick={() => navigate("/books")}
            className="px-6 py-2 mt-4 text-white rounded-lg bg-primary"
          >
            {t('books.back_to_books')}
          </button>
        </div>
      </div>
    );
  }

  const images = Object.values(book.images || {});
  const priceNumber = parseFloat(book.price) || 0;
  const discountAmount = parseFloat(book.discount) || 0;
  const finalPrice = priceNumber;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeliveryOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Require authentication to place an order
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      if (!isLoggedIn || !token) {
        setError("You must be logged in to place an order.");
        setLoading(false);
        setTimeout(() => navigate('/Login'), 1200);
        return;
      }

      // Prepare form data for multipart/form-data
      const formDataToSend = new FormData();
      // Backend expects client_id as part of the payload
      if (formData.client_id) {
        formDataToSend.append('client_id', formData.client_id);
      }
      formDataToSend.append('client_name', formData.client_name);
      formDataToSend.append('phone1', formData.phone1);
      formDataToSend.append('phone2', formData.phone2 || '');
      formDataToSend.append('city', formData.city);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('street', formData.street);
      formDataToSend.append('book_id', formData.book_id);
      formDataToSend.append('quantity', formData.quantity.toString());
      formDataToSend.append('city_id', formData.city_id);

      console.log('Sending order data:', {
        client_name: formData.client_name,
        phone1: formData.phone1,
        phone2: formData.phone2,
        city: formData.city,
        address: formData.address,
        street: formData.street,
        book_id: formData.book_id,
        quantity: formData.quantity,
        city_id: formData.city_id
      });

      const response = await request('palce_order', {
        method: 'POST',
        body: formDataToSend,
        auth: true,
        isFormData: true
      });

      console.log('Order response:', response);

      setSuccess(t('books.order_placed_successfully'));
      // Redirect to order confirmation or profile
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      console.error('Order error:', err);
      let errorMessage = err.message || t('books.order_failed');
      
      if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.message.includes('redirected')) {
        errorMessage = "Server redirected the request. This may be a server configuration issue.";
      } else if (err.message.includes('opaqueredirect')) {
        errorMessage = "Order may have been processed despite the redirect. Please check your profile for order status.";
        // Don't show this as an error, show as success with warning
        setSuccess("Order submitted successfully! Please check your profile for order status.");
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
        return;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfPurchase = async () => {
    if (!selectedPayment) {
      setError(t('books.select_payment_method'));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const orderData = {
        book_id: book.id,
        payment_method: selectedPayment,
        amount: finalPrice
      };

      await request('purchase_pdf', {
        method: 'POST',
        body: orderData,
        auth: true
      });

      setSuccess(t('books.purchase_successful'));
      // Redirect to download or profile
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      setError(err.message || t('books.purchase_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen px-4 py-10 bg-background text-text md:px-8">
      <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto lg:grid-cols-2">
        {/* LEFT - Product summary */}
        <aside className="order-2 lg:order-1">
          <div className="sticky space-y-6 top-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-4 text-text-secondary hover:text-primary"
            >
              <FiChevronLeft /> {t('books.back')}
            </button>

            <div className="overflow-hidden border shadow-sm rounded-2xl border-border bg-surface">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={book.name}
                  className="object-cover w-full h-96"
                />
              ) : (
                <div className="flex items-center justify-center w-full text-gray-500 bg-gray-200 h-96">
                  <div className="text-center">
                    <FiCreditCard className="w-16 h-16 mx-auto mb-2" />
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img.original_url)}
                    className={`w-20 h-16 overflow-hidden rounded-lg border ${
                      mainImage === img.original_url
                        ? "border-primary ring-2 ring-primary"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={img.original_url}
                      className="object-cover w-full h-full"
                      alt={`thumb-${i}`}
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 border rounded-2xl border-border bg-surface">
              <h1 className="text-2xl font-bold">{book.name}</h1>
              <p className="mt-1 text-sm text-text-secondary">by {book.author}</p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="flex items-center gap-2">
                    {discountAmount > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        ${(priceNumber + discountAmount).toFixed(2)}
                      </span>
                    )}
                    <span className="text-lg font-semibold text-primary">
                      ${finalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {bookType === 1 ? t('books.delivery_included') : t('books.pdf_download')}
                  </div>
                </div>

                <div className="text-sm text-text-secondary">
                  {book.pages_count} {t('books.pages')}
                </div>
              </div>

              <div className="mt-4 text-sm text-text-secondary">
                <p><strong>{t('books.language')}:</strong> {book.language}</p>
                <p><strong>{t('books.category')}:</strong> {book.category?.name}</p>
                <p><strong>{t('books.type')}:</strong> {bookType === 1 ? t('books.delivery') : t('books.pdf_only')}</p>
              </div>

              <div className="mt-4 leading-relaxed text-text-secondary"
                   dangerouslySetInnerHTML={{ __html: book.description }} />
            </div>
          </div>
        </aside>

        {/* RIGHT - Order form or payment */}
        <main className="order-1 lg:order-2">
          <div className="p-6 border shadow-md rounded-2xl border-border bg-surface">
            <h2 className="text-2xl font-bold">
              {bookType === 1 ? t('books.delivery_order') : t('books.purchase_pdf')}
            </h2>
            <p className="mt-1 text-text-secondary">
              {bookType === 1 ? t('books.fill_delivery_info') : t('books.select_payment_method')}
            </p>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 mt-4 text-red-600 border border-red-200 rounded-lg bg-red-50">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 mt-4 text-green-600 border border-green-200 rounded-lg bg-green-50">
                {success}
              </div>
            )}

            {/* Fetch Paint Data Button */}
            {bookType === 1 && (
              <div className="mt-4">
                <button
                  onClick={fetchPaintOrderData}
                  disabled={loadingPaintData}
                  className="flex items-center gap-2 px-4 py-2 text-sm transition border rounded-lg text-primary border-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiRefreshCw className={loadingPaintData ? 'animate-spin' : ''} />
                  {loadingPaintData ? 'Loading Paint Data...' : 'Load Paint Data'}
                </button>
                <p className="mt-1 text-xs text-text-secondary">
                  Optional: Load your previous order information
                </p>
              </div>
            )}

            {/* Order summary */}
            <div className="p-4 mt-6 border rounded-lg bg-background/60 border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-secondary">{book.name}</div>
                <div className="font-semibold">${finalPrice.toFixed(2)}</div>
              </div>
              {bookType === 1 && (
                <div className="flex items-center justify-between mt-2 text-sm text-text-secondary">
                  <div>{t('books.delivery')}</div>
                  <div>{t('books.free')}</div>
                </div>
              )}
              <div className="flex items-center justify-between mt-4 text-lg font-semibold">
                <div>{t('books.total')}</div>
                <div>${finalPrice.toFixed(2)}</div>
              </div>
            </div>

            {/* Delivery Form */}
            {bookType === 1 && (
              <form onSubmit={handleDeliveryOrder} className="mt-6 space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FiUser /> {t('books.client_name')} *
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('books.enter_client_name')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FiPhone /> {t('books.phone_number')} *
                  </label>
                  <input
                    type="tel"
                    name="phone1"
                    value={formData.phone1}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('books.enter_phone_number')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FiPhone /> {t('books.phone_number_2')} (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone2"
                    value={formData.phone2}
                    onChange={handleInputChange}
                    className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('books.enter_phone_number_2')}
                  />
                </div>

                <CitySelector
                  value={formData.city}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      city: e.target.value,
                      city_id: e.target.city_id ? e.target.city_id.toString() : ""
                    }));
                  }}
                  required
                  placeholder="Select City"
                />

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FiHome /> {t('books.address')} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('books.enter_address')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FiHome /> {t('books.street')} *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('books.enter_street')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter quantity"
                  />
                </div>

                {/* Hidden client_id field */}
                <input
                  type="hidden"
                  name="client_id"
                  value={formData.client_id}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 mt-6 font-medium text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('books.placing_order') : t('books.place_order')}
                </button>
              </form>
            )}

            {/* PDF Purchase */}
            {bookType === 2 && (
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-semibold">{t('books.select_payment_method')}</h3>

                <div className="space-y-3">
                  {[
                    { id: 'visa', name: 'Visa', icon: FaCcVisa, color: 'text-blue-600' },
                    { id: 'mastercard', name: 'Mastercard', icon: FaCcMastercard, color: 'text-red-500' },
                    { id: 'paypal', name: 'PayPal', icon: FaCcPaypal, color: 'text-sky-500' }
                  ].map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`w-full p-4 border rounded-lg flex items-center gap-3 transition ${
                          selectedPayment === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <IconComponent className={`text-2xl ${method.color}`} />
                        <span className="font-medium">{method.name}</span>
                        {selectedPayment === method.id && (
                          <div className="flex items-center justify-center w-4 h-4 ml-auto rounded-full bg-primary">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handlePdfPurchase}
                  disabled={loading || !selectedPayment}
                  className="w-full px-6 py-3 mt-6 font-medium text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('books.processing') : t('books.purchase_now')}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  );
}
