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
  FaHeartbeat,
  FaStethoscope,
  FaSyringe,
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
  const { t } = useTranslation();

  return (
    <div className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="relative overflow-hidden aspect-[16/9] bg-gray-100 dark:bg-gray-700">
        <Link to={route} className="block w-full h-full">
          <img
            src={course.image || "/logo.png"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = "/logo.png"; }}
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {isBestseller && (
          <span className="absolute top-3 left-3 z-10 flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-md shadow-sm">
            <FaStar size={10} /> Bestseller
          </span>
        )}
        {course.level && (
          <span className="absolute top-3 right-3 z-10 text-[11px] font-semibold text-white bg-primary px-2.5 py-1 rounded-md shadow-md capitalize border border-white/20">
            {course.level}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <Link to={route}>
          <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h4>
        </Link>
        <div className="flex items-center gap-1 mb-4">
          {rating > 0 && (
            <>
              <FaStar size={12} className="text-amber-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{rating.toFixed(1)}</span>
            </>
          )}
          {course.language && (
            <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
              {course.language}
            </span>
          )}
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
          <Price price={course.price} discount={course.discount} />
          <Link
            to={route}
            className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:opacity-90 transition-opacity shrink-0 shadow-sm"
          >
            {t("courses.viewDetails", "View Details")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Center Course Card ────────────────────────────────────────────────────────
function CenterCourseCard({ course }) {
  const { t } = useTranslation();
  return (
    <div className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="relative overflow-hidden aspect-[16/9] bg-gray-100 dark:bg-gray-700">
        <Link to={`/center-courses/${course.id}`} className="block w-full h-full">
          <img
            src={course.image || "/logo.png"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = "/logo.png"; }}
          />
        </Link>
        {course.is_bestseller && (
          <span className="absolute top-3 left-3 z-10 flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-md shadow-sm">
            <FaStar size={10} /> Bestseller
          </span>
        )}
        {course.status && (
          <span className={`absolute top-3 right-3 z-10 text-[11px] font-bold px-2 py-1 rounded-md shadow-md capitalize border border-white/20 ${
            course.status === "available" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-800"
          }`}>
            {course.status}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/center-courses/${course.id}`}>
          <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {course.title}
          </h4>
        </Link>
        <div className="space-y-2 mb-4">
          {course.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <FaMapMarkerAlt size={14} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{course.address}</span>
            </div>
          )}
          {course.start_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <FaCalendarAlt size={14} className="text-gray-400 flex-shrink-0" />
              {new Date(course.start_date).toLocaleDateString()}
            </div>
          )}
          {course.seats_left !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <FaUsers size={14} className="text-gray-400 flex-shrink-0" />
              {course.seats_left} seats left
            </div>
          )}
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
          <Price price={course.price} discount={course.discount} />
          <Link
            to={`/center-courses/${course.id}`}
            className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:opacity-90 transition-opacity shrink-0 shadow-sm"
          >
            {t("courses.viewDetails", "View Details")}
          </Link>
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
        <div className="overflow-hidden bg-white shadow-sm border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 mb-10">
          {/* Cover Area with Medical Pattern */}
          <div className="h-40 md:h-56 w-full relative overflow-hidden bg-primary">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"></div>
            
            {/* Medical Icons Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
              <FaHeartbeat className="absolute -bottom-4 -left-4 text-white text-8xl transform -rotate-12" />
              <FaStethoscope className="absolute top-4 left-1/4 text-white text-9xl transform rotate-12" />
              <FaSyringe className="absolute -top-10 right-1/4 text-white text-8xl transform rotate-45" />
              <FaHeartbeat className="absolute bottom-8 right-10 text-white text-7xl transform -rotate-6" />
            </div>
            
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          </div>
          
          <div className="px-6 md:px-10 pb-10 relative">
            {/* Avatar & Header */}
            <div className="flex flex-col md:flex-row md:items-end md:-mt-20 -mt-20 mb-8 gap-6 relative z-10">
              <img
                src={image || "/logo.png"}
                alt={name}
                className="object-cover w-36 h-36 border-4 border-white dark:border-gray-800 rounded-full shadow-md bg-white shrink-0 mx-auto md:mx-0"
                onError={(e) => { e.target.src = "/logo.png"; }}
              />
              <div className="flex-1 text-center md:text-left mb-2 md:pt-20 pt-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{name}</h1>
                <p className="text-gray-600 dark:text-gray-300 font-medium mt-1">
                  {job_title || t("instructors.jobTitle")}
                </p>
              </div>
              <div className="flex gap-3 justify-center md:justify-end shrink-0 mb-2 md:pt-20 pt-2">
                {telegram && (
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-opacity bg-primary rounded-lg hover:opacity-90 shadow-sm"
                  >
                    <FaTelegram size={16} />
                    {t("courses.askInstructor", "Ask the Instructor")}
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
              {/* Left sidebar info (Meta style intro) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Intro</h3>
                  
                  <div className="space-y-4 text-sm text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-3">
                      <FaUser className="text-gray-400 text-lg shrink-0" />
                      <span>{genderText}</span>
                    </div>
                    {years_of_experience && (
                      <div className="flex items-center gap-3">
                        <FaBriefcase className="text-gray-400 text-lg shrink-0" />
                        <span>{t("instructors.details.yearsOfExperience")}: <span className="font-semibold">{years_of_experience}</span></span>
                      </div>
                    )}
                    {totalCourses > 0 && (
                      <div className="flex items-center gap-3">
                        <FaVideo className="text-gray-400 text-lg shrink-0" />
                        <span>{totalCourses} Courses</span>
                      </div>
                    )}
                    {email && (
                      <a href={`mailto:${email}`} className="flex items-center gap-3 hover:underline">
                        <FaEnvelope className="text-gray-400 text-lg shrink-0" />
                        <span className="break-all">{email}</span>
                      </a>
                    )}
                    {phone && (
                      <a href={`tel:${phone}`} className="flex items-center gap-3 hover:underline">
                        <FaPhone className="text-gray-400 text-lg shrink-0" />
                        <span>{phone}</span>
                      </a>
                    )}
                  </div>
                  
                  {/* Social Media */}
                  {(facebook || instagram || youtube || whatsapp) && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {facebook && (
                          <a href={facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <FaFacebookF size={16} />
                          </a>
                        )}
                        {instagram && (
                          <a href={instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <FaInstagram size={16} />
                          </a>
                        )}
                        {youtube && (
                          <a href={youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <FaYoutube size={16} />
                          </a>
                        )}
                        {whatsapp && (
                          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="p-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <FaWhatsapp size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main content area */}
              <div className="lg:col-span-2 space-y-6">
                {(bio || expertise) ? (
                  <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-8">
                    {bio && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                          {t("instructors.details.bio")}
                        </h2>
                        <div
                          className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: bio }}
                        />
                      </div>
                    )}
                    
                    {expertise && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                          {t("instructors.details.expertise")}
                        </h2>
                        <div
                          className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: expertise }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                    <p className="text-gray-500">{t("instructors.details.noBio")}</p>
                  </div>
                )}
              </div>
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
