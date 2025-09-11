import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const mockBooks = [
  { id: 1, title: 'Mathematics Fundamentals', author: 'John Smith', category: 'Mathematics', price: 29.99, status: 'Available' },
  { id: 2, title: 'Physics Principles', author: 'Jane Doe', category: 'Physics', price: 34.99, status: 'Available' },
  { id: 3, title: 'Chemistry Basics', author: 'Bob Johnson', category: 'Chemistry', price: 27.99, status: 'Out of Stock' },
  { id: 4, title: 'Biology Essentials', author: 'Alice Brown', category: 'Biology', price: 32.99, status: 'Available' },
  { id: 5, title: 'History of Science', author: 'Charlie Wilson', category: 'History', price: 24.99, status: 'Available' },
];

export default function BooksManagement() {
  const [books, setBooks] = useState(mockBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    price: '',
    status: 'Available'
  });

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBook = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      category: '',
      price: '',
      status: 'Available'
    });
    setShowModal(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      price: book.price,
      status: book.status
    });
    setShowModal(true);
  };

  const handleDeleteBook = (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setBooks(books.filter(book => book.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBook) {
      setBooks(books.map(book =>
        book.id === editingBook.id
          ? { ...book, ...formData }
          : book
      ));
    } else {
      const newBook = {
        id: Math.max(...books.map(b => b.id)) + 1,
        ...formData
      };
      setBooks([...books, newBook]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Books Management
        </h2>
        <button
          onClick={handleAddBook}
          className="flex items-center px-4 py-2 text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-dark"
        >
          <FaPlus className="mr-2" />
          Add Book
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Title
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Author
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Category
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Price
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-gray-100">
                    {book.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    {book.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    {book.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    ${book.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      book.status === 'Available'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => handleEditBook(book)}
                      className="mr-3 text-primary hover:text-primary-dark"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative p-5 mx-auto bg-white border rounded-md shadow-lg top-20 w-96 dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div className="flex justify-end pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {editingBook ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
