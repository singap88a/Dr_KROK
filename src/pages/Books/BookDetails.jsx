import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiBook, FiUser, FiStar, FiGlobe, FiArrowLeft } from "react-icons/fi";

export default function BookDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const book = state?.book;

  const [mainImage, setMainImage] = useState(book?.images[0]);

  if (!book) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg">No book data available.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 mt-4 text-white rounded-lg bg-primary"
        >
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen px-4 py-12 transition-colors duration-300 md:px-10 lg:px-20 bg-background text-text">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-text-secondary hover:text-primary"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Images */}
          <div>
            <div className="w-full overflow-hidden border h-80 rounded-xl border-border">
              <img
                src={mainImage}
                alt={book.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex gap-4 mt-4">
              {book.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 border rounded-lg overflow-hidden cursor-pointer transition ${
                    mainImage === img ? "border-primary" : "border-border"
                  }`}
                >
                  <img
                    src={img}
                    alt={`thumb-${i}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="mt-3 text-lg text-text-secondary">
              {book.description}
            </p>

            {/* Icons Info */}
            <div className="grid grid-cols-2 gap-4 mt-6 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <FiBook className="text-primary" /> 350 Pages
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="text-primary" /> Author: John Doe
              </div>
              <div className="flex items-center gap-2">
                <FiStar className="text-primary" /> Rating: 4.7/5
              </div>
              <div className="flex items-center gap-2">
                <FiGlobe className="text-primary" /> Language: English
              </div>
            </div>

            <p className="mt-6 text-2xl font-semibold text-primary">
              {book.price}
            </p>

            {/* Buy Now */}
            <Link to="/buynow">
                        <button  className="px-8 py-3 mt-6 font-medium text-white transition rounded-xl bg-primary hover:shadow-lg hover:brightness-110">
              Buy Now
            </button>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
