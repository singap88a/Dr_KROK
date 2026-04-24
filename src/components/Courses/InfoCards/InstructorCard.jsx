// LiveCourseLessons/InstructorCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";

export default function InstructorCard({ course, t }) {
  if (!course.instructor) return null;

  return (
    <div className="p-6 border rounded-lg bg-surface border-border">
      <h3 className="mb-4 text-lg font-semibold text-text">
        {t("courses.instructor", "Instructor")}
      </h3>

      <div className="flex items-start gap-4">
        <img
          src={course.instructor.image || "/placeholder-instructor.jpg"}
          alt={course.instructor.name}
          className="object-cover w-16 h-16 border-2 rounded-full border-primary"
        />

        <div className="flex-1">
          <h4 className="text-lg font-semibold text-text">
            {course.instructor.name}
          </h4>
          <p className="mb-2 font-medium text-primary">
            {course.instructor.job_title}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <FaGraduationCap />
              <span>
                {course.instructor.years_of_experience} {t("courses.yearsExp", "years experience")}
              </span>
            </div>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-text line-clamp-3">
            {course.instructor.bio}
          </p>

          <Link
            to={`/instructors/${course.instructor.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
          >
            {t("instructors.viewDetails", "View Details")}
          </Link>
        </div>
      </div>
    </div>
  );
}