import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiMapPin,
  FiPhone,
  FiMail,
  FiShield,
  FiChevronLeft,
} from "react-icons/fi";
import { FaCcVisa, FaCcMastercard, FaCcPaypal } from "react-icons/fa";

// BuyNow.jsx
// - Tailwind CSS required
// - react-router-dom (useLocation/useNavigate)
// - react-icons (for icons)

export default function BuyNowPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Accept a `book` via router state (from Books -> navigate('/buy', { state: { book } }))
  // Fallback product if none provided (for testing)
  const sampleBook = {
    id: 999,
    title: "Mastering React — Deluxe Edition",
    author: "John Doe",
    price: "$29.99",
    description:
      "A complete, practical guide to modern React development with examples, best practices and real-world patterns.",
    images: [
      "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg",
      "https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg",
      "https://images.pexels.com/photos/159751/books-bookstore-book-reading-159751.jpeg",
    ],
    pages: 320,
    language: "English",
    category: "Programming",
    rating: 4.8,
  };

  const book = state?.book ?? sampleBook;

  // form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    country: "Egypt",
    city: "Cairo",
    addressLine: "",
    postal: "",
    payment: "cod", // 'cod' | 'credit' | 'paypal'
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [mainImage, setMainImage] = useState(book.images?.[0] || "");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setMainImage(book.images?.[0] ?? "");
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // format card number as groups of 4
    if (name === "cardNumber") {
      const digits = value.replace(/\D/g, "");
      const groups = digits.match(/.{1,4}/g);
      setForm((s) => ({ ...s, [name]: groups ? groups.join(" ") : digits }));
      return;
    }

    // expiry format MM/YY
    if (name === "cardExpiry") {
      const cleaned = value.replace(/[^0-9]/g, "").slice(0, 4);
      let formatted = cleaned;
      if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      setForm((s) => ({ ...s, [name]: formatted }));
      return;
    }

    if (name === "cardCvv") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setForm((s) => ({ ...s, [name]: digits }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));
  };

  const priceNumber = Number((book.price || "$0").replace(/[^0-9.]+/g, "")) || 0;
  const shipping = priceNumber > 50 ? 0 : 3.99;
  const tax = +(priceNumber * 0.05).toFixed(2);
  const total = +(priceNumber + shipping + tax).toFixed(2);

  const validate = () => {
    // simple required checks
    const required = ["name", "email", "phone", "addressLine", "city", "country"];
    for (const k of required) {
      if (!form[k] || form[k].trim() === "") return `${k} is required`;
    }
    // email simple
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Email is invalid";

    if (form.payment === "credit") {
      const digits = form.cardNumber.replace(/\s/g, "");
      if (digits.length < 13) return "Card number is too short";
      if (!/^[0-9]{3,4}$/.test(form.cardCvv)) return "CVV is invalid";
      if (!/^[0-9]{2}\/[0-9]{2}$/.test(form.cardExpiry)) return "Expiry invalid (MM/YY)";
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setProcessing(true);

    // simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      const orderId = Math.random().toString(36).slice(2, 9).toUpperCase();
      setSuccess({ orderId, amount: total });
    }, 1200);
  };

  const maskCard = (num = "") => {
    const digits = num.replace(/\s/g, "");
    if (!digits) return "•••• •••• •••• ••••";
    const last4 = digits.slice(-4);
    return `•••• •••• •••• ${last4}`.slice(-19);
  };

  return (
    <section className="min-h-screen px-4 py-10 bg-background text-text md:px-8">
      <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto lg:grid-cols-2">
        {/* LEFT - Product summary */}
        <aside className="order-2 lg:order-1">
          <div className="sticky space-y-6 top-6">
            <div className="overflow-hidden border shadow-sm rounded-2xl border-border bg-surface">
              <img
                src={mainImage}
                alt={book.title}
                className="object-cover w-full h-96"
              />
            </div>

            <div className="flex gap-3">
              {book.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-16 overflow-hidden rounded-lg border ${
                    mainImage === img ? "border-primary ring-2 ring-primary" : "border-border"
                  }`}
                >
                  <img src={img} className="object-cover w-full h-full" alt={`thumb-${i}`} />
                </button>
              ))}
            </div>

            <div className="p-6 border rounded-2xl border-border bg-surface">
              <h1 className="text-2xl font-bold">{book.title}</h1>
              <p className="mt-1 text-sm text-text-secondary">by {book.author}</p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-lg font-semibold text-primary">{book.price}</div>
                  <div className="text-xs text-text-secondary">incl. VAT when applicable</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-text-secondary">Rating</div>
                  <div className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary">{book.rating}★</div>
                </div>
              </div>

              <p className="mt-4 leading-relaxed text-text-secondary">{book.description}</p>

              <div className="grid grid-cols-2 gap-3 mt-6 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-primary" /> {book.pages} pages
                </div>
                <div className="flex items-center gap-2">
                  <FiShield className="text-primary" /> Secure purchase
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-primary" /> Support 24/7
                </div>
                <div className="flex items-center gap-2">
                  <FiMail className="text-primary" /> Digital receipt
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT - Checkout form */}
        <main className="order-1 lg:order-2">
          <div className="p-6 border shadow-md rounded-2xl border-border bg-surface">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-4 text-text-secondary"
            >
              <FiChevronLeft /> Back to store
            </button>

            <h2 className="text-2xl font-bold">Secure Checkout</h2>
            <p className="mt-1 text-text-secondary">Complete your purchase securely</p>

            {/* Order summary */}
            <div className="p-4 mt-6 border rounded-lg bg-background/60 border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-secondary">{book.title}</div>
                <div className="font-semibold">{book.price}</div>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-text-secondary">
                <div>Shipping</div>
                <div>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</div>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-text-secondary">
                <div>Tax</div>
                <div>${tax}</div>
              </div>
              <div className="flex items-center justify-between mt-4 text-lg font-semibold">
                <div>Total</div>
                <div>${total}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col">
                  <span className="text-sm text-text-secondary">Full name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="p-3 mt-2 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                    placeholder="Ahmed Ali"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-text-secondary">Email</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="p-3 mt-2 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                    placeholder="you@email.com"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col">
                  <span className="text-sm text-text-secondary">Phone</span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="p-3 mt-2 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                    placeholder="+20 1X XXX XXXX"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-text-secondary">WhatsApp</span>
                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    className="p-3 mt-2 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                    placeholder="Optional (same as phone)"
                  />
                </label>
              </div>

              <label className="flex flex-col">
                <span className="text-sm text-text-secondary">Address</span>
                <input
                  name="addressLine"
                  value={form.addressLine}
                  onChange={handleChange}
                  required
                  className="p-3 mt-2 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                  placeholder="Street, building, etc."
                />
              </label>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="flex flex-col">
                  <span className="text-sm text-text-secondary">Country</span>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="p-3 mt-2 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                  >
                    <option>Egypt</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Saudi Arabia</option>
                    <option>UAE</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-text-secondary">City</span>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="p-3 mt-2 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-text-secondary">Postal code</span>
                  <input
                    name="postal"
                    value={form.postal}
                    onChange={handleChange}
                    className="p-3 mt-2 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                    placeholder="Optional"
                  />
                </label>
              </div>

              {/* Payment Methods */}
              <div className="mt-2">
                <div className="mb-2 text-sm text-text-secondary">Payment method</div>
                <div className="flex flex-wrap gap-3">
                  <label className={`flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer ${form.payment === 'cod' ? 'border-primary bg-primary/5' : 'border-border'} `}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={form.payment === 'cod'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className="text-sm font-medium">Cash on Delivery</div>
                  </label>

                  <label className={`flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer ${form.payment === 'credit' ? 'border-primary bg-primary/5' : 'border-border'} `}>
                    <input
                      type="radio"
                      name="payment"
                      value="credit"
                      checked={form.payment === 'credit'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <FiShield /> <span className="text-sm font-medium">Credit / Debit Card</span>
                    </div>
                    <div className="flex items-center gap-2 ml-3 text-xl text-text-secondary">
                      <FaCcVisa /> <FaCcMastercard />
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer ${form.payment === 'paypal' ? 'border-primary bg-primary/5' : 'border-border'} `}>
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={form.payment === 'paypal'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <FaCcPaypal /> <span className="text-sm font-medium">PayPal</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Credit card fields (conditionally shown) */}
              {form.payment === "credit" && (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {/* Card preview */}
                  <div className="p-4 text-white rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase opacity-80">Secure</div>
                      <div className="flex items-center gap-2 text-2xl opacity-90">
                        <FaCcVisa /> <FaCcMastercard />
                      </div>
                    </div>

                    <div className="mt-6 text-lg font-medium tracking-wider">
                      {form.cardNumber ? maskCard(form.cardNumber) : "•••• •••• •••• ••••"}
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm opacity-90">
                      <div>
                        <div className="text-xs">Card holder</div>
                        <div className="font-medium">{form.cardName || "FULL NAME"}</div>
                      </div>
                      <div>
                        <div className="text-xs">Expires</div>
                        <div className="font-medium">{form.cardExpiry || "MM/YY"}</div>
                      </div>
                    </div>
                  </div>

                  <input
                    name="cardNumber"
                    value={form.cardNumber}
                    onChange={handleChange}
                    placeholder="Card number"
                    className="p-3 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      name="cardName"
                      value={form.cardName}
                      onChange={handleChange}
                      placeholder="Name on card"
                      className="p-3 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        name="cardExpiry"
                        value={form.cardExpiry}
                        onChange={handleChange}
                        placeholder="MMYY"
                        className="p-3 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                      />
                      <input
                        name="cardCvv"
                        value={form.cardCvv}
                        onChange={handleChange}
                        placeholder="CVV"
                        className="p-3 border rounded-lg outline-none border-border bg-background text-text focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex items-center justify-center border rounded-lg border-border bg-background text-text">CVV</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm button */}
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-3 font-semibold rounded-xl text-white ${processing ? 'bg-primary/60' : 'bg-primary hover:scale-[1.02]'} transition-transform`}
                >
                  {processing ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheck /> Confirm & Pay ${total}
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 text-xs text-text-secondary">
                By confirming you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy</span>. Secure payments powered by demo gateway.
              </div>
            </form>
          </div>

          {/* small notes */}
          <div className="mt-4 text-sm text-text-secondary">
            <div className="flex items-center gap-2"><FiShield className="text-primary" /> 30-day money-back guarantee</div>
            <div className="flex items-center gap-2 mt-2"><FiMail className="text-primary" /> Digital receipt sent to your email</div>
          </div>
        </main>
      </div>

      {/* success modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
          <div className="w-full max-w-lg p-6 text-center border rounded-2xl bg-surface border-border">
            <h3 className="text-2xl font-bold">Purchase Successful</h3>
            <p className="mt-2 text-text-secondary">Order <span className="font-semibold">#{success.orderId}</span> confirmed</p>
            <p className="mt-4 text-lg font-semibold">Amount: ${success.amount}</p>

            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => { setSuccess(null); navigate('/'); }} className="px-6 py-2 text-white rounded-lg bg-primary">Back to Store</button>
              <button onClick={() => { setSuccess(null); }} className="px-6 py-2 border rounded-lg border-border">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
