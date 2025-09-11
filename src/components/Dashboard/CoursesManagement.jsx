import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const mockCourses = [
  { id: 1, title: 'Introduction to Mathematics', instructor: 'Dr. John Smith', category: 'Mathematics', price: 49.99, status: 'Active', students: 120 },
  { id: 2, title: 'Advanced Physics', instructor: 'Dr. Jane Doe', category: 'Physics', price: 79.99, status: 'Active', students: 85 },
  { id: 3, title: 'Chemistry Fundamentals', instructor: 'Dr. Bob Johnson', category: 'Chemistry', price: 59.99, status: 'Inactive', students: 0 },
  { id: 4, title: 'Biology Essentials', instructor: 'Dr. Alice Brown', category: 'Biology', price: 54.99, status: 'Active', students: 95 },
  { id: 5, title: 'History of Science', instructor: 'Dr. Charlie Wilson', category: 'History', price: 39.99, status: 'Active', students: 67 },
];

export default function CoursesManagement() {
  const [courses, setCourses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    category: '',
    price: '',
    status: 'Active'
  });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      instructor: '',
      category: '',
      price: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      instructor: course.instructor,
      category: course.category,
      price: course.price,
      status: course.status
    });
    setShowModal(true);
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCourse) {
      setCourses(courses.map(course =>
        course.id === editingCourse.id
          ? { ...course, ...formData }
          : course
      ));
    } else {
      const newCourse = {
        id: Math.max(...courses.map(c => c.id)) + 1,
        ...formData,
        students: 0
      };
      setCourses([...courses, newCourse]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Courses Management
        </h2>
        <button
          onClick={handleAddCourse}
          className="flex items-center px-4 py-2 text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-dark"
        >
          <FaPlus className="mr-2" />
          Add Course
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search courses..."
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
                  Instructor
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Category
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Price
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Students
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
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-gray-100">
                    {course.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    {course.instructor}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    {course.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    ${course.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    {course.students}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="mr-3 text-primary hover:text-primary-dark"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
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
                {editingCourse ? 'Edit Course' : 'Add New Course'}
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
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({...formData, instructor: e.target.value})}
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
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
                    {editingCourse ? 'Update' : 'Add'}
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
