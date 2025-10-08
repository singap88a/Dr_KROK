import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaEye, FaCalendarAlt, FaUser, FaBook } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyRatings = ({ user, onRatingsUpdate }) => {
  const { t } = useTranslation();
  const { isLoggedIn, userData } = useUser();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn && (userData || user)) {
      // Use ratings from user profile data
      const userRatings = (userData || user)?.ratings || [];
      console.log('MyRatings - User data:', userData || user);
      console.log('MyRatings - Ratings:', userRatings);
      setRatings(userRatings);
      setLoading(false);
    } else if (isLoggedIn) {
      // If logged in but no user data, try to fetch profile
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, userData, user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await fetch("https://dr-krok.com/api/profile/get-my-profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setRatings(data.data.ratings || []);
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        className={`text-lg ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Handle DD-MM-YYYY HH:MM AM/PM format
      const parts = dateString.split(' ');
      if (parts.length >= 2) {
        const datePart = parts[0]; // DD-MM-YYYY
        const timePart = parts[1]; // HH:MM
        const ampm = parts[2]; // AM/PM

        const [day, month, year] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');

        // Convert to 24-hour format
        let hour24 = parseInt(hours);
        if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
        if (ampm === 'AM' && hour24 === 12) hour24 = 0;

        const date = new Date(year, month - 1, day, hour24, minutes);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Fallback for other formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Function to add new rating to the list
  const addNewRating = (newRating) => {
    const updatedRatings = [newRating, ...ratings];
    setRatings(updatedRatings);
    if (onRatingsUpdate) {
      onRatingsUpdate(updatedRatings);
    }
  };

  // Expose the function to parent component
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    addNewRating
  }));

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-text">
            {t('auth.login_required') || 'Please login to view your ratings'}
          </h2>
          <Link
            to="/Login"
            className="px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
          >
            {t('auth.login.title') || 'Login'}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">
            {t('common.error') || 'Error'}
          </h2>
          <p className="mb-4 text-text-secondary">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
          >
            {t('common.retry') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="max-w-6xl px-4 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FaStar className="text-2xl text-primary" />
            </div>
            <div>
              <h1 className="mb-1 text-3xl font-bold text-text">
                {t('courses.myRatings') || 'My Ratings'}
              </h1>
              <p className="text-text-secondary">
                {t('courses.ratings') || 'Ratings'} ({ratings.length})
              </p>
            </div>
          </div>
        </div>

        {/* Ratings List */}
        {ratings.length === 0 ? (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <FaBook className="text-4xl text-gray-400" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-text">
                  {t('courses.noRatings') || 'No ratings yet'}
                </h3>
                <p className="leading-relaxed text-text-secondary">
                  {t('courses.noRatingsDescription') || 'You haven\'t rated any courses yet. Start exploring courses and share your feedback!'}
                </p>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center gap-3 px-8 py-4 font-semibold text-white transition-all duration-200 transform shadow-lg bg-primary rounded-xl hover:bg-primary/90 hover:shadow-xl hover:scale-105"
              >
                <FaBook />
                {t('courses.browseCourses') || 'Browse Courses'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="relative overflow-hidden transition-all duration-300 border shadow-md bg-surface border-border rounded-2xl hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
              >
                <div className="relative p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    {/* Course Image with enhanced styling */}
                    <div className="relative flex-shrink-0">
                      <div className="relative overflow-hidden shadow-sm w-28 h-28 bg-gradient-to-br from-accent to-border rounded-xl">
                        {rating.course?.image ? (
                          <img
                            src={rating.course.image}
                            alt={rating.course.title}
                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <FaBook className="text-3xl text-text-muted" />
                          </div>
                        )}
                      </div>
                      {/* Rating badge */}
                      <div className="absolute px-2 py-1 text-xs font-bold text-white rounded-full shadow-lg -top-2 -right-2 bg-primary">
                        {rating.rate_number}/5
                      </div>
                    </div>

                    {/* Rating Content with improved typography */}
                    <div className="flex-1 min-w-0">
                      {/* Header with title and date */}
                      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-bold leading-tight text-text">
                            {rating.course?.title || `Course #${rating.id}` || t('courses.unknownCourse') || 'Unknown Course'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-primary" />
                              {formatDate(rating.created_at)}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-accent text-text-secondary">
                              {t('courses.courseRated') || 'Rated'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Rating Stars with better styling */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex gap-1">
                          {renderStars(rating.rate_number)}
                        </div>
                        <span className="px-2 py-1 text-sm font-semibold rounded-md text-text bg-yellow-50 dark:bg-yellow-900/20">
                          {rating.rate_number} out of 5 stars
                        </span>
                      </div>

                      {/* Comment with quote styling */}
                      {rating.rate_comment && (
                        <div className="p-4 mb-4 border-l-4 rounded-lg bg-accent border-primary">
                          <p className="italic leading-relaxed text-text-secondary">
                            "{rating.rate_comment}"
                          </p>
                        </div>
                      )}

                      {/* Course Info with better layout */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {rating.course?.instructor && (
                          <Link
                            to={`/instructors/${rating.course.instructor.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 transition-colors rounded-lg dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          >
                            {rating.course.instructor.image && (
                              <img
                                src={rating.course.instructor.image}
                                alt={rating.course.instructor.name}
                                className="object-cover w-6 h-6 rounded-full"
                              />
                            )}
                            <span>{rating.course.instructor.name || rating.course.instructor}</span>
                          </Link>
                        )}
                        {rating.course?.category && (
                          <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 rounded-lg dark:text-green-300 bg-green-50 dark:bg-green-900/20">
                            <FaBook className="text-green-500" />
                            <span>
                              {typeof rating.course.category === 'string'
                                ? rating.course.category
                                : rating.course.category.name
                              }
                            </span>
                          </div>
                        )}
                        {!rating.course && (
                          <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-text-muted bg-accent">
                            <FaBook className="text-text-muted" />
                            <span>Course Information Not Available</span>
                          </div>
                        )}
                      </div>

                      {/* View Course Button */}
                      <div className="flex justify-end">
                        <Link
                          to={rating.course?.id ? `/courses/${rating.course.id}` : '/courses'}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 rounded-lg bg-primary hover:bg-secondary hover:shadow-lg hover:scale-105"
                        >
                          <FaEye />
                          <span>{t('courses.viewCourse') || 'View Course'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRatings;
