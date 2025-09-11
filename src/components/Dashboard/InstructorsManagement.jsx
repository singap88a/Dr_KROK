import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const mockInstructors = [
  { id: 1, name: 'Dr. John Smith', email: 'john.smith@university.edu', specialization: 'Mathematics', courses: 5, rating: 4.8, status: 'Active' },
  { id: 2, name: 'Dr. Jane Doe', email: 'jane.doe@university.edu', specialization: 'Physics', courses: 3, rating: 4.9, status: 'Active' },
  { id: 3, name: 'Dr. Bob Johnson', email: 'bob.johnson@university.edu', specialization: 'Chemistry', courses: 4, rating: 4.7, status: 'Inactive' },
  { id: 4, name: 'Dr. Alice Brown', email: 'alice.brown@university.edu', specialization: 'Biology', courses: 6, rating: 4.6, status: 'Active' },
  { id: 5, name: 'Dr. Charlie Wilson', email: 'charlie.wilson@university.edu', specialization: 'History', courses: 2, rating: 4.5, status: 'Active' },
];

export default function InstructorsManagement() {
  const [instructors, setInstructors] = useState(mockInstructors);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    status: 'Active'
  });

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddInstructor = () => {
    setEditingInstructor(null);
    setFormData({
      name: '',
      email: '',
      specialization: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditInstructor = (instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      specialization: instructor.specialization,
      status: instructor.status
    });
    setShowModal(true);
  };

  const handleDeleteInstructor = (id) => {
    if (window.confirm('Are you sure you want to delete this instructor?')) {
      setInstructors(instructors.filter(instructor => instructor.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingInstructor) {
      setInstructors(instructors.map(instructor =>
        instructor.id === editingInstructor.id
          ? { ...instructor, ...formData }
          : instructor
      ));
    } else {
      const newInstructor = {
        id: Math.max(...instructors.map(i => i.id)) + 1,
        ...formData,
        courses: 0,
        rating: 0
      };
      setInstructors([...instructors, newInstructor]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Instructors Management
        </h2>
        <button
          onClick={handleAddInstructor}
          className="flex items-center px-4 py-2 text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-dark"
        >
          <FaPlus className="mr-2" />
          Add Instructor
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search instructors..."
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
                  Name
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Specialization
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Courses
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Rating
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
              {filteredInstructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-gray-100">
                    {instructor.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    {instructor.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    {instructor.specialization}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    {instructor.courses}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300">
                    ⭐ {instructor.rating}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      instructor.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {instructor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => handleEditInstructor(instructor)}
                      className="mr-3 text-primary hover:text-primary-dark"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteInstructor(instructor.id)}
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
                {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
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
                    {editingInstructor ? 'Update' : 'Add'}
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
