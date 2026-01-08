import React, { useState, useEffect } from 'react';
import { FaStar, FaLock, FaUser } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import { useApi } from '../../context/ApiContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LeaveReview = ({ courseId, onReviewSubmitted, userHasReviewed = false, type = 'video_course' }) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useUser();
  const { submitCourseReview, getCourseAccess } = useApi();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(userHasReviewed);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    setHasReviewed(userHasReviewed);
  }, [userHasReviewed]);

  // Check course access when component mounts
  useEffect(() => {
    const checkAccess = async () => {
      if (isLoggedIn && courseId) {
        try {
          setCheckingAccess(true);
          const access = await getCourseAccess(courseId, type);
          setHasAccess(access);
        } catch (error) {
          console.error('Error checking course access:', error);
          setHasAccess(false);
        } finally {
          setCheckingAccess(false);
        }
      } else {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [courseId, type, isLoggedIn, getCourseAccess]);

  const handleRatingClick = (selectedRating) => {
    if (hasReviewed) return;
    setRating(selectedRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.info(t('auth.login_required') || 'Please login to leave a review');
      navigate('/login');
      return;
    }

    if (!hasAccess) {
      toast.error(t('courses.no_access_review') || 'You must be enrolled in this course to leave a review');
      return;
    }

    if (hasReviewed) {
      toast.info(t('courses.already_reviewed') || 'You have already reviewed this course');
      return;
    }

    if (rating === 0) {
      toast.error(t('courses.select_rating') || 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error(t('courses.comment_required') || 'Please write a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting review:', { courseId, rating, comment: comment.trim() });
      const response = await submitCourseReview(courseId, rating, comment.trim(), type);
      console.log('Review response:', response);

      if (response.success) {
        toast.success(t('courses.review_submitted') || 'Review submitted successfully!');
        setHasReviewed(true);
        setRating(0);
        setComment('');
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data);
        }
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || t('courses.review_failed') || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-1">
        <FaStar
          className={`text-3xl cursor-pointer transition-all duration-200 ${
            i < rating
              ? 'text-yellow-400'
              : hasReviewed
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
          } ${hasReviewed ? 'cursor-not-allowed' : 'hover:scale-110'}`}
          onClick={() => handleRatingClick(i + 1)}
        />
        <span className="text-xs font-medium text-text-muted">{i + 1}</span>
      </div>
    ));
  };

  // Don't return early for hasReviewed - show the form with disabled state

  // Show access restriction message if user doesn't have access
  if (isLoggedIn && !hasAccess && !checkingAccess) {
    return (
      <div className="p-6 transition-shadow duration-200 border shadow-sm bg-background border-border rounded-xl hover:shadow-md">
        <div className="p-4 mb-6 border border-orange-200 shadow-sm dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-900 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-full shadow-sm dark:bg-orange-900">
              <FaLock className="text-lg text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
              {t('courses.enrollment_required') || 'Enrollment Required'}
            </h4>
          </div>
          <p className="text-sm leading-relaxed text-orange-700 dark:text-orange-300">
            {t('courses.enrollment_required_message') || 'You must be enrolled in this course to leave a review. Please subscribe to the course first.'}
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <FaStar className="text-xl text-primary" />
          </div>
          <h3 className="text-xl font-bold text-text">
            {t('courses.leaveReview') || 'Leave a Review'}
          </h3>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate(type === 'live_course' ? `/live-courses/${courseId}/subscribe` : `/courses/${courseId}/subscribe`)}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-center gap-2">
              <FaUser />
              {t('courses.subscribe_to_review') || 'Subscribe to Leave Review'}
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 transition-shadow duration-200 border shadow-sm bg-background border-border rounded-xl hover:shadow-md">
      {/* Show success message if already reviewed */}
      {hasReviewed && (
        <div className="p-4 mb-6 border border-green-200 shadow-sm dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-full shadow-sm dark:bg-green-900">
              <FaStar className="text-lg text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
              {t('courses.course_rated')}
            </h4>
          </div>
          <p className="text-sm leading-relaxed text-green-700 dark:text-green-300">
            {t('courses.already_rated_message')}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <FaStar className="text-xl text-primary" />
        </div>
        <h3 className="text-xl font-bold text-text">
          {t('courses.leaveReview') || 'Leave a Review'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Stars */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-text-secondary">
            {t('courses.yourRating') || 'Your Rating'} *
          </label>
          <div className="flex gap-2">
            {renderStars()}
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-2 p-3 border border-yellow-200 rounded-lg dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900">
              <FaStar className="text-yellow-500 dark:text-yellow-400" />
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {rating === 1 && (t('courses.rating_poor') || 'Poor')}
                {rating === 2 && (t('courses.rating_fair') || 'Fair')}
                {rating === 3 && (t('courses.rating_good') || 'Good')}
                {rating === 4 && (t('courses.rating_very_good') || 'Very Good')}
                {rating === 5 && (t('courses.rating_excellent') || 'Excellent')}
              </p>
            </div>
          )}
        </div>

        {/* Comment */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-text-secondary">
            {t('courses.writeComment') || 'Write your comment'} *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('courses.writeComment') || 'Write your comment...'}
            className="w-full p-4 transition-all duration-200 border rounded-lg resize-none border-border focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-text-muted">
            <span className="text-text-secondary">
              {t('courses.comment_help') || 'Share your experience with this course'}
            </span>
            <span className={`font-medium ${comment.length > 450 ? 'text-orange-500' : 'text-text-muted'}`}>
              {comment.length}/500
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || hasReviewed || (isLoggedIn && (rating === 0 || !comment.trim()))}
          className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              {t('courses.submitting') || 'Submitting...'}
            </div>
          ) : hasReviewed ? (
            <div className="flex items-center justify-center gap-2">
              <FaStar />
              {t('courses.alreadyReviewed') || 'Already Reviewed'}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <FaStar />
              {t('courses.submitReview') || 'Submit Review'}
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default LeaveReview;
