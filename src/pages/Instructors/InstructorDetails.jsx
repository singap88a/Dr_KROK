import React, { useState, useEffect } from "react";
import he from "he";
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
  FaStar,
  FaVideo,
  FaBroadcastTower,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { toast } from "react-toastify";

// ── Tiny price helper ─────────────────────────────────────────────────────────
function Price({ price, discount, currency = "₴" }) {
  const hasDisc = Number(discount) > 0;
  const final = hasDisc
    ? (Number(price) * (1 - Number(discount) / 100)).toFixed(0)
    : Number(price).toFixed(0);
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-sm font-bold text-primary">{currency}{final}</span>
      {hasDisc && (
        <>
          <span className="text-xs text-gray-400 line-through">{currency}{Number(price).toFixed(0)}</span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}

// ── Course Card (Video / Live) ────────────────────────────────────────────────
function CourseCard({ course, type = "video" }) {
  const route = type === "live" ? `/live-courses/${course.id}` : `/courses/${course.id}`;
  const isBestseller = course.is_bestseller;
  const rating = Number(course.avg_rating || 0);

  return (
    <Link
      to={route}
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative overflow-hidden aspect-video bg-gray-100 dark:bg-gray-700">
        <img
          src={course.image || "/logo.png"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = "/logo.png"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isBestseller && (
          <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            <FaStar size={8} /> Bestseller
          </span>
        )}
        {course.level && (
          <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-primary/80 px-2 py-0.5 rounded-full capitalize">
            {course.level}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {course.title}
        </h4>
        <div className="flex items-center gap-1 mb-3">
          {rating > 0 && (
            <>
              <FaStar size={10} className="text-amber-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{rating.toFixed(1)}</span>
            </>
          )}
          {course.language && (
            <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500">{course.language}</span>
          )}
        </div>
        <div className="mt-auto">
          <Price price={course.price} discount={course.discount} />
        </div>
      </div>
    </Link>
  );
}

// ── Center Course Card ────────────────────────────────────────────────────────
function CenterCourseCard({ course }) {
  return (
    <div className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="relative overflow-hidden aspect-video bg-gray-100 dark:bg-gray-700">
        <img
          src={course.image || "/logo.png"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = "/logo.png"; }}
        />
        {course.is_bestseller && (
          <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            <FaStar size={8} /> Bestseller
          </span>
        )}
        {course.status && (
          <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
            course.status === "available" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
          }`}>
            {course.status}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h4>
        <div className="space-y-1 mb-3">
          {course.address && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <FaMapMarkerAlt size={10} className="text-primary flex-shrink-0" />
              {course.address}
            </div>
          )}
          {course.start_date && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <FaCalendarAlt size={10} className="text-primary flex-shrink-0" />
              {new Date(course.start_date).toLocaleDateString()}
            </div>
          )}
          {course.seats_left !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <FaUsers size={10} className="text-primary flex-shrink-0" />
              {course.seats_left} seats left
            </div>
          )}
        </div>
        <div className="mt-auto">
          <Price price={course.price} discount={course.discount} />
        </div>
      </div>
    </div>
  );
}

// ── Courses Section ───────────────────────────────────────────────────────────
function CoursesSection({ title, icon: Icon, items = [], cardType = "video" }) {
  if (!items || items.length === 0) return null;
  const CardComp = cardType === "center" ? CenterCourseCard : CourseCard;
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary flex-shrink-0">
          <Icon size={14} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{items.length} course{items.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((course) => (
          cardType === "center"
            ? <CenterCourseCard key={course.id} course={course} />
            : <CourseCard key={course.id} course={course} type={cardType} />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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
        const decoded = {
          ...data,
          bio: data.bio ? he.decode(data.bio) : "",
          expertise: data.expertise ? he.decode(data.expertise) : "",
          // Support both old `courses` and new split structure
          video_courses: {
            ...data.video_courses,
            list: (data.video_courses?.list || data.courses || []).map((c) => ({
              ...c,
              description: c.description ? he.decode(c.description) : "",
            })),
          },
          live_courses: {
            ...data.live_courses,
            list: (data.live_courses?.list || []).map((c) => ({
              ...c,
              description: c.description ? he.decode(c.description) : "",
            })),
          },
          center_courses: {
            ...data.center_courses,
            list: data.center_courses?.list || [],
          },
        };
        setInstructor(decoded);
      } catch (err) {
        console.error("Error fetching instructor details:", err);
        setError(err.message);
        toast.error(t("instructors.error"));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInstructor();
  }, [id, getInstructorById, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">{t("instructors.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-8 text-center bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
          <p className="mb-4 text-red-500">{t("instructors.error")}</p>
          <Link to="/instructors" className="px-6 py-2 text-white rounded-lg bg-primary hover:bg-primary/90">
            {t("instructors.backToInstructors")}
          </Link>
        </div>
      </div>
    );
  }

  const {
    name, job_title, image, bio, years_of_experience, expertise,
    email, phone, gender,
    facebook, instagram, youtube, telegram, whatsapp,
    video_courses, live_courses, center_courses,
  } = instructor;

  const genderText = gender === "male" ? t("instructors.details.male") : t("instructors.details.female");
  const totalCourses =
    (video_courses?.list?.length || 0) +
    (live_courses?.list?.length || 0) +
    (center_courses?.list?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <Link
          to="/instructors"
          className="inline-flex items-center mb-6 text-gray-600 hover:text-primary dark:text-gray-300 gap-2 text-sm transition-colors"
        >
          <FaArrowLeft size={12} />
          {t("instructors.backToInstructors")}
        </Link>

        {/* ── Profile Card ── */}
        <div className="overflow-hidden bg-white shadow-2xl rounded-3xl dark:bg-gray-800 mb-10">
          <div className="flex flex-col lg:flex-row">
            {/* Left */}
            <div className="flex flex-col items-center justify-center w-full p-10 text-center bg-gradient-to-br from-primary/10 to-blue-50 dark:from-primary/20 dark:to-gray-800 lg:w-1/3 lg:text-left">
              <img
                src={image || "/logo.png"}
                alt={name}
                className="object-cover w-32 h-32 mb-6 border-4 border-white rounded-full shadow-xl md:w-44 md:h-44 dark:border-gray-700"
                onError={(e) => { e.target.src = "/logo.png"; }}
              />
              <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl">{name}</h1>
              <p className="mb-4 text-lg font-medium text-primary">
                {job_title || t("instructors.jobTitle")}
              </p>

              {/* Stats row */}
              <div className="flex gap-3 w-full max-w-xs mb-4">
                {years_of_experience && (
                  <div className="flex-1 text-center bg-white dark:bg-gray-700 rounded-xl py-2 border border-gray-100 dark:border-gray-600">
                    <div className="text-lg font-bold text-primary">{years_of_experience}</div>
                    <div className="text-[10px] text-gray-400">Yrs exp.</div>
                  </div>
                )}
                {totalCourses > 0 && (
                  <div className="flex-1 text-center bg-white dark:bg-gray-700 rounded-xl py-2 border border-gray-100 dark:border-gray-600">
                    <div className="text-lg font-bold text-primary">{totalCourses}</div>
                    <div className="text-[10px] text-gray-400">Courses</div>
                  </div>
                )}
              </div>

              {/* Gender & Experience chips */}
              <div className="flex flex-col w-full max-w-xs gap-3">
                <div className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-200">
                  <FaUser className="mr-2 text-primary" />
                  {genderText}
                </div>
                <div className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-200">
                  <FaBriefcase className="mr-2 text-primary" />
                  {t("instructors.details.yearsOfExperience")}: {years_of_experience}
                </div>
                {telegram && (
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-white transition-all transform bg-primary rounded-xl hover:bg-primary/90 hover:scale-105 shadow-lg shadow-primary/20 mt-2"
                  >
                    <FaTelegram size={18} />
                    {t("courses.askInstructor", "Ask the Instructor")}
                  </a>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="flex-1 p-10 space-y-8">
              {/* Bio */}
              <div>
                <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                  {t("instructors.details.bio")}
                </h2>
                <div
                  className="text-base leading-relaxed text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: bio || t("instructors.details.noBio") }}
                />
              </div>

              {/* Expertise */}
              {expertise && (
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                    {t("instructors.details.expertise")}
                  </h3>
                  <div
                    className="text-base leading-relaxed text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: expertise }}
                  />
                </div>
              )}

              {/* Contact Info */}
              <div>
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  {t("instructors.contact")}
                </h3>
                <div className="space-y-3">
                  {email && (
                    <a href={`mailto:${email}`} className="flex items-center p-3 text-gray-700 transition-colors rounded-xl bg-gray-50 hover:bg-primary hover:text-white dark:bg-gray-700 dark:text-gray-200">
                      <FaEnvelope className="mr-3" />{email}
                    </a>
                  )}
                  {phone && (
                    <a href={`tel:${phone}`} className="flex items-center p-3 text-gray-700 transition-colors rounded-xl bg-gray-50 hover:bg-primary hover:text-white dark:bg-gray-700 dark:text-gray-200">
                      <FaPhone className="mr-3" />{phone}
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
                      <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 text-gray-500 transition-all bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white">
                        <FaFacebookF size={18} />
                      </a>
                    )}
                    {instagram && (
                      <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 text-gray-500 transition-all bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white">
                        <FaInstagram size={18} />
                      </a>
                    )}
                    {youtube && (
                      <a href={youtube} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 text-gray-500 transition-all bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white">
                        <FaYoutube size={18} />
                      </a>
                    )}
                    {telegram && (
                      <a href={telegram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 text-gray-500 transition-all bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white">
                        <FaTelegram size={18} />
                      </a>
                    )}
                    {whatsapp && (
                      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 text-gray-500 transition-all bg-gray-100 rounded-full dark:bg-gray-700 hover:bg-primary hover:text-white">
                        <FaWhatsapp size={18} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Courses ── */}
        {totalCourses > 0 ? (
          <div>
            <h2 className="mb-8 text-3xl font-bold text-center text-gray-900 dark:text-white">
              {t("instructors.details.courses")}
            </h2>
            <CoursesSection
              title={video_courses?.title || "Video Courses"}
              icon={FaVideo}
              items={video_courses?.list}
              cardType="video"
            />
            <CoursesSection
              title={live_courses?.title || "Live Courses"}
              icon={FaBroadcastTower}
              items={live_courses?.list}
              cardType="live"
            />
            <CoursesSection
              title={center_courses?.title || "Center Courses"}
              icon={FaMapMarkerAlt}
              items={center_courses?.list}
              cardType="center"
            />
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">{t("instructors.details.noCourses")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstructorDetails;
