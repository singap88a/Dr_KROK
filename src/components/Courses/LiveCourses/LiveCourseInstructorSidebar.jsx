import React from "react";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUniversity,
  FaEnvelope,
  FaPhone,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTelegram,
  FaWhatsapp,
} from "react-icons/fa";

export default function LiveCourseInstructorSidebar({ course, t }) {
  if (!course.instructor) return null;

  return (
    <div className="sticky self-start top-24">
      <div className="p-6 border rounded-lg shadow-sm border-border bg-surface h-fit">
        <img
          src={
            course.instructor?.image ||
            "https://randomuser.me/api/portraits/men/10.jpg"
          }
          alt={
            course.instructor?.name || t("courses.instructor", "Instructor")
          }
          className="object-cover w-24 h-24 mx-auto mb-4 rounded-full"
        />
        <h3 className="text-lg font-bold text-center">
          {course.instructor?.name || t("courses.instructor", "Instructor")}
        </h3>
        <p className="mb-2 text-sm text-center text-text-muted">
          {course.instructor?.job_title || t("courses.jobTitle", "Job Title")}
        </p>
        <p className="mb-4 text-sm font-medium text-center text-primary">
          {t("courses.expertise", "Expertise")}:{" "}
          {course.instructor?.expertise ||
            t("courses.noExpertise", "Not specified")}
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {course.instructor?.years_of_experience && (
            <li className="flex items-center gap-2">
              <FaChalkboardTeacher className="text-primary" />
              {course.instructor.years_of_experience}{" "}
              {t("courses.yearsOfExperience", "Years of Experience")}
            </li>
          )}
          {course.instructor?.bio && (
            <li className="flex items-start gap-2">
              <FaUserGraduate className="mt-1 text-primary" />{" "}
              {course.instructor.bio}
            </li>
          )}
          {course.university?.name && (
            <li className="flex items-center gap-2">
              <FaUniversity className="text-primary" />{" "}
              {course.university.name}
            </li>
          )}
          {course.instructor?.email && (
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-primary" />
              <a
                href={`mailto:${course.instructor.email}`}
                className="hover:text-secondary"
              >
                {course.instructor.email}
              </a>
            </li>
          )}
          {course.instructor?.phone && (
            <li className="flex items-center gap-2">
              <FaPhone className="text-primary" />
              <a
                href={`tel:${course.instructor.phone}`}
                className="hover:text-secondary"
              >
                {course.instructor.phone}
              </a>
            </li>
          )}
        </ul>
        {/* Social Links */}
        <div className="flex justify-center gap-4 mt-4 text-xl text-primary">
          {course.instructor?.facebook && (
            <a
              href={course.instructor.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary"
            >
              <FaFacebook />
            </a>
          )}
          {course.instructor?.instagram && (
            <a
              href={course.instructor.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary"
            >
              <FaInstagram />
            </a>
          )}
          {course.instructor?.youtube && (
            <a
              href={course.instructor.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary"
            >
              <FaYoutube />
            </a>
          )}
          {course.instructor?.telegram && (
            <a
              href={course.instructor.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary"
            >
              <FaTelegram />
            </a>
          )}
          {course.instructor?.whatsapp && (
            <a
              href={course.instructor.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary"
            >
              <FaWhatsapp />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
