import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { FaCcVisa, FaCcMastercard, FaCcPaypal } from "react-icons/fa";

export default function BuyNowPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const sampleBook = {
    id: 999,
    title: "Mastering React — Deluxe Edition",
    author: "John Doe",
    price: "$29.99",
    images: [
      "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg",
      "https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg",
      "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg",
    ],
    pages: 320,
    language: "English",
    category: "Programming",
    rating: 4.8,
  };

  const book = state?.book ?? sampleBook;
  const [mainImage, setMainImage] = useState(book.images?.[0] || "");

  useEffect(() => {
    setMainImage(book.images?.[0] ?? "");
  }, [book]);

  const priceNumber = Number((book.price || "$0").replace(/[^0-9.]+/g, "")) || 0;
  const shipping = priceNumber > 50 ? 0 : 3.99;
  const tax = +(priceNumber * 0.05).toFixed(2);
  const total = +(priceNumber + shipping + tax).toFixed(2);

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
                    mainImage === img
                      ? "border-primary ring-2 ring-primary"
                      : "border-border"
                  }`}
                >
                  <img
                    src={img}
                    className="object-cover w-full h-full"
                    alt={`thumb-${i}`}
                  />
                </button>
              ))}
            </div>

            <div className="p-6 border rounded-2xl border-border bg-surface">
              <h1 className="text-2xl font-bold">{book.title}</h1>
              <p className="mt-1 text-sm text-text-secondary">by {book.author}</p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-lg font-semibold text-primary">
                    {book.price}
                  </div>
                  <div className="text-xs text-text-secondary">
                    incl. VAT when applicable
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-text-secondary">Rating</div>
                  <div className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary">
                    {book.rating}★
                  </div>
                </div>
              </div>

              <p className="mt-4 leading-relaxed text-text-secondary">
                {book.description}
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT - Simple checkout with wallets */}
        <main className="order-1 lg:order-2">
          <div className="p-6 border shadow-md rounded-2xl border-border bg-surface">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-4 text-text-secondary"
            >
              <FiChevronLeft /> Back to store
            </button>

            <h2 className="text-2xl font-bold">Checkout</h2>
            <p className="mt-1 text-text-secondary">
              Select a payment method to continue
            </p>

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

            {/* Payment method logos */}
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                Available Payment Options
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-4xl text-text-secondary">
                <FaCcVisa className="text-blue-600" />
                <FaCcMastercard className="text-red-500" />
                <FaCcPaypal className="text-sky-500" />
                <img
                  src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/GooglePayLogo.width-500.format-webp.webp"
                  alt="Google Pay"
                  className="object-contain h-10 w-14"
                />
                <img
                  src="https://download.logo.wine/logo/Apple_Pay/Apple_Pay-Logo.wine.png"
                  alt="Apple Pay"
                  className="object-contain h-10 w-14"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
