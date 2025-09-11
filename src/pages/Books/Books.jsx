import   { useState,  } from "react";
import {   FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Books() {
  const navigate = useNavigate();

 

  const allBooks = [
    {
      id: 1,
      title: "Mastering React",
      description: "A complete guide to React.js and modern frontend development.",
      price: "$29.99",
      images: [
        "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg",
        "https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg",
        "https://images.pexels.com/photos/159751/books-bookstore-book-reading-159751.jpeg",
      ],
    },
    {
      id: 2,
      title: "JavaScript Essentials",
      description: "Learn core JavaScript concepts with hands-on examples.",
      price: "$19.99",
      images: [
        "https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg",
        "https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg",
        "https://images.pexels.com/photos/159832/book-open-pages-literature-159832.jpeg",
      ],
    },
    {
      id: 3,
      title: "CSS for Designers",
      description: "Master CSS and create stunning web designs with ease.",
      price: "$15.00",
      images: [
        "https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg",
        "https://images.pexels.com/photos/261909/pexels-photo-261909.jpeg",
        "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg",
      ],
    },
    {
      id: 4,
      title: "HTML & Web Basics",
      description: "The ultimate beginner’s guide to HTML and web development.",
      price: "$10.00",
      images: [
        "https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg",
        "https://images.pexels.com/photos/414102/pexels-photo-414102.jpeg",
        "https://images.pexels.com/photos/374016/pexels-photo-374016.jpeg",
      ],
    },
    {
      id: 5,
      title: "Node.js in Action",
      description: "Build powerful backend applications using Node.js.",
      price: "$25.00",
      images: [
        "https://images.pexels.com/photos/540518/pexels-photo-540518.jpeg",
        "https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg",
        "https://images.pexels.com/photos/4974915/pexels-photo-4974915.jpeg",
      ],
    },
    {
      id: 6,
      title: "Python Crash Course",
      description: "A fast-paced introduction to programming with Python.",
      price: "$30.00",
      images: [
        "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg",
        "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg",
        "https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg",
      ],
    },
    {
      id: 7,
      title: "Data Structures & Algorithms",
      description: "Learn DSA concepts with practical coding examples.",
      price: "$35.00",
      images: [
        "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg",
        "https://images.pexels.com/photos/590027/pexels-photo-590027.jpeg",
        "https://images.pexels.com/photos/590030/pexels-photo-590030.jpeg",
      ],
    },
    {
      id: 8,
      title: "Machine Learning 101",
      description: "Introduction to machine learning and AI concepts.",
      price: "$40.00",
      images: [
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
        "https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg",
        "https://images.pexels.com/photos/1181319/pexels-photo-1181319.jpeg",
      ],
    },
    {
      id: 9,
      title: "UI/UX Design Principles",
      description: "Design beautiful and user-friendly interfaces.",
      price: "$20.00",
      images: [
        "https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg",
        "https://images.pexels.com/photos/4348397/pexels-photo-4348397.jpeg",
        "https://images.pexels.com/photos/4348398/pexels-photo-4348398.jpeg",
      ],
    },
    {
      id: 10,
      title: "Database Systems",
      description: "Understand SQL and database management deeply.",
      price: "$27.00",
      images: [
        "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg",
        "https://images.pexels.com/photos/590021/pexels-photo-590021.jpeg",
        "https://images.pexels.com/photos/590023/pexels-photo-590023.jpeg",
      ],
    },
  ];

  const [visibleCount, setVisibleCount] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBooks = allBooks.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleBooks = filteredBooks.slice(0, visibleCount);

  return (
    <section className="min-h-screen px-4 py-12 transition-colors duration-300 md:px-10 lg:px-20 bg-background text-text">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-6 mb-10 md:flex-row">
          <h2 className="text-3xl font-bold md:text-4xl">Books Store</h2>

          {/* Search + Toggle */}
          <div className="flex items-center w-full gap-4 md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <FiSearch className="absolute text-text-secondary top-3 left-3" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border rounded-full bg-surface border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

 
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleBooks.map((book) => (
            <div
              key={book.id}
              className="flex flex-col overflow-hidden transition-all duration-300 border rounded-2xl bg-surface border-border hover:shadow-xl hover:-translate-y-1"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={book.images[0]}
                  alt={book.title}
                  className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="flex flex-col flex-1 p-5">
                <h3 className="mb-2 text-lg font-semibold">{book.title}</h3>
                <p className="mb-3 text-sm text-text-secondary line-clamp-3">
                  {book.description}
                </p>
                <p className="mb-4 font-semibold text-primary">{book.price}</p>

                {/* View Details Button */}
                <button
                  onClick={() => navigate(`/book/${book.id}`, { state: { book } })}
                  className="px-4 py-2 mt-auto font-medium text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {visibleCount < filteredBooks.length && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="px-8 py-3 font-medium text-white transition shadow rounded-xl bg-primary hover:shadow-lg"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
