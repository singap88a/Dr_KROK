
import { useState } from "react";
import { FiSearch, FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Books() {
  const navigate = useNavigate();

  const allBooks = [
    {
      id: 1,
      title: "Human Anatomy Atlas",
      description: "Comprehensive guide to human anatomy with detailed illustrations.",
      oldPrice: "$69.99",
      price: "$49.99",
      pdf: "/pdfs/anatomy.pdf",
      images: [
        "https://www.kenhub.com/thumbor/dy3RvPtDBA9vgcTJgsGUhjlf72w=/fit-in/800x1600/filters:watermark(/images/logo_url.png,-10,-10,0):background_color(FFFFFF):format(jpeg)/images/article/how-to-choose-the-best-anatomy-atlas/59oXLFGu4YXmcvD4h3Ehw_stacked-anatomy-atlases.jpg",
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1178682308i/821821.jpg",
        "https://www.mea.elsevierhealth.com/media/wysiwyg/UKMEAEU/LP-Grays/Grays-inside.png",
      ],
    },
    {
      id: 2,
      title: "Medical Physiology",
      description: "Learn how the human body functions at the cellular and organ level.",
      oldPrice: "$55.99",
      price: "$39.99",
      pdf: "/pdfs/physiology.pdf",
      images: [
        "https://m.media-amazon.com/images/I/71wQlwKF9dL._UF1000,1000_QL80_.jpg",
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1178682308i/821821.jpg",
        "https://www.mea.elsevierhealth.com/media/wysiwyg/UKMEAEU/LP-Grays/Grays-inside.png",
      ],
    },
    {
      id: 3,
      title: "Pathology Made Simple",
      description: "A practical guide to understanding human diseases and pathology.",
      oldPrice: "$49.99",
      price: "$29.99",
      pdf: "/pdfs/pathology.pdf",
      images: [
        "https://m.media-amazon.com/images/I/51FRvQRbvAL._UF1000,1000_QL80_.jpg",
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1178682308i/821821.jpg",
        "https://www.mea.elsevierhealth.com/media/wysiwyg/UKMEAEU/LP-Grays/Grays-inside.png",
      ],
    },
  ];

  const [visibleCount, setVisibleCount] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);

  const filteredBooks = allBooks.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleBooks = filteredBooks.slice(0, visibleCount);

  return (
    <section className="min-h-screen px-4 py-12 md:px-10 lg:px-20 bg-background text-text">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-6 mb-10 md:flex-row">
          <h2 className="text-3xl font-bold md:text-4xl">Medical Books Store</h2>

          {/* Search */}
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

        {/* Books Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleBooks.map((book) => (
            <div
              key={book.id}
              className="relative flex flex-col overflow-hidden transition-all duration-500 border group rounded-2xl bg-surface border-border hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Book Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={book.images[0]}
                  alt={book.title}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFavorites(prev => prev.includes(book.id) ? prev.filter(id => id !== book.id) : [...prev, book.id]);
                  }}
                  className="absolute p-1 transition rounded-full shadow-md top-3 right-3 bg-white/80 hover:bg-white"
                >
                  <FiHeart className={`text-xl ${favorites.includes(book.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Book Content */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="mb-2 text-lg font-semibold transition group-hover:text-primary">
                  {book.title}
                </h3>
                <p className="mb-3 text-sm text-text-secondary line-clamp-3">
                  {book.description}
                </p>

                {/* Price Section */}
                <div className="mb-4">
                  <span className="mr-2 text-gray-400 line-through">
                    {book.oldPrice}
                  </span>
                  <span className="font-semibold text-primary">{book.price}</span>
                </div>

                {/* Button */}
                <button
                  onClick={() =>
                    navigate(`/book/${book.id}`, { state: { book } })
                  }
                  className="px-4 py-2 mt-auto font-medium text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
