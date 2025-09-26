import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTelegram,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaArrowLeft,
  FaUser,
  FaBriefcase,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { toast } from "react-toastify";

function InstructorDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { getInstructorById } = useApi();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        const data = await getInstructorById(id);
        setInstructor(data);
      } catch (err) {
        console.error("Error fetching instructor details:", err);
        setError(err.message);
        toast.error(t("instructors.error"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInstructor();
    }
  }, [id, getInstructorById, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {t("instructors.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-8 text-center bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
          <p className="mb-4 text-red-500">{t("instructors.error")}</p>
          <Link
            to="/instructors"
            className="px-6 py-2 text-white rounded-lg bg-primary hover:bg-primary/90"
          >
            {t("instructors.backToInstructors")}
          </Link>
        </div>
      </div>
    );
  }

  const {
    name,
    job_title,
    image,
    bio,
    years_of_experience,
    expertise,
    email,
    phone,
    gender,
    facebook,
    instagram,
    youtube,
    telegram,
    whatsapp,
    courses,
  } = instructor;

  const genderText =
    gender === "male"
      ? t("instructors.details.male")
      : t("instructors.details.female");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <Link
          to="/instructors"
          className="inline-flex items-center mb-6 text-gray-600 hover:text-primary dark:text-gray-300"
        >
          <FaArrowLeft className="mr-2" />
          {t("instructors.backToInstructors")}
        </Link>

        {/* Instructor Card */}
        <div className="overflow-hidden bg-white shadow-2xl rounded-3xl dark:bg-gray-800">
          <div className="flex flex-col lg:flex-row">
            {/* Left */}
            <div className="flex flex-col items-center justify-center w-full p-10 text-center bg-gradient-to-br from-primary/10 to-blue-50 dark:from-primary/20 dark:to-gray-800 lg:w-1/3 lg:text-left">
              <img
                src={image || "/placeholder-avatar.jpg"}
                alt={name}
                className="object-cover w-32 h-32 mb-6 border-4 border-white rounded-full shadow-xl md:w-44 md:h-44 dark:border-gray-700"
                onError={(e) => {
                  e.target.src = "/placeholder-avatar.jpg";
                }}
              />
              <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl">
                {name}
              </h1>
              <p className="mb-4 text-lg font-medium text-primary">
                {job_title || t("instructors.jobTitle")}
              </p>

              {/* Gender & Experience */}
              <div className="flex flex-col w-full max-w-xs gap-3 mt-4">
                <div className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-200">
                  <FaUser className="mr-2 text-primary" />
                  {genderText}
                </div>
                <div className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-200">
                  <FaBriefcase className="mr-2 text-primary" />
                  {t("instructors.details.yearsOfExperience")}:{" "}
                  {years_of_experience}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex-1 p-10 space-y-8">
              {/* Bio */}
              <div>
                <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                  {t("instructors.details.bio")}
                </h2>
                <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  {bio || t("instructors.details.noBio")}
                </p>
              </div>

              {/* Expertise */}
              {expertise && (
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                    {t("instructors.details.expertise")}
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    {expertise}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div cl>
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  {t("instructors.contact")}
                </h3>
                <div className="space-y-3 ">
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center p-3 text-gray-700 transition-colors rounded-xl bg-gray-50 hover:bg-primary hover:text-white dark:bg-gray-700 dark:text-gray-200"
                    >
                      <FaEnvelope className="mr-3" />
                      {email}
                    </a>
                  )}
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center p-3 text-gray-700 transition-colors rounded-xl bg-gray-50 hover:bg-primary hover:text-white dark:bg-gray-700 dark:text-gray-200"
                    >
                      <FaPhone className="mr-3" />
                      {phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Social Media */}
              {(facebook || instagram || youtube || telegram || whatsapp) && (
                <div>
                  <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                    {t("instructors.details.socialMedia")}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {facebook && (
                      <a
                        href={facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 text-gray-500 transition-all bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"
                      >
                        <FaFacebookF size={18} />
                      </a>
                    )}
                    {instagram && (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 text-gray-500 transition-all bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"
                      >
                        <FaInstagram size={18} />
                      </a>
                    )}
                    {youtube && (
                      <a
                        href={youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 text-gray-500 transition-all bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"
                      >
                        <FaYoutube size={18} />
                      </a>
                    )}
                    {telegram && (
                      <a
                        href={telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 text-gray-500 transition-all bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"
                      >
                        <FaTelegram size={18} />
                      </a>
                    )}
                    {whatsapp && (
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 text-gray-500 transition-all bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white"
                      >
                        <FaWhatsapp size={18} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="mt-12">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900 dark:text-white">
            {t("instructors.details.courses")}
          </h2>
          {courses && courses.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="overflow-hidden transition-all duration-300 bg-white border shadow-md group rounded-2xl hover:shadow-xl dark:bg-gray-800"
                >
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={course.image || "/placeholder-course.jpg"}
                      alt={course.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "/placeholder-course.jpg";
                      }}
                    />
                    <div className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary">
                      {course.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-primary">
                        {course.discount > 0 ? (
                          <>
                            <span className="text-gray-500 line-through">
                              ${course.price}
                            </span>
                            <span className="ml-2">
                              $
                              {(
                                course.price *
                                (1 - course.discount / 100)
                              ).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span>${course.price}</span>
                        )}
                      </div>
                      <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-primary">
                        {course.level}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {t("instructors.details.noCourses")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorDetails;
