import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";

function InstructorsCarousel() {
  const instructors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Data Science Expert",
      description:
        "Specialist in Machine Learning and AI with 10+ years of teaching experience.",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
      socials: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      id: 2,
      name: "Michael Lee",
      role: "Frontend Developer",
      description:
        "React.js and Next.js instructor, passionate about building scalable UI systems.",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      socials: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "UI/UX Designer",
      description:
        "Helping students master user-centered design with real-world projects.",
      img: "https://randomuser.me/api/portraits/women/68.jpg",
      socials: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      id: 4,
      name: "James Wilson",
      role: "Backend Engineer",
      description:
        "Specialist in Node.js, Express, and cloud infrastructure for scalable apps.",
      img: "https://randomuser.me/api/portraits/men/76.jpg",
      socials: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
  ];

  return (
    <section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Title */}
      <h2 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white">
        Meet Our Instructors
      </h2>
      <p className="mt-3 text-lg text-center text-gray-600 dark:text-gray-300">
        Learn from industry experts with years of real-world experience
      </p>

      {/* Carousel */}
      <div className="mx-auto mt-12 max-w-7xl">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={25}
          slidesPerView={1}
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          grabCursor={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="pb-12"
        >
          {instructors.map((ins) => (
            <SwiperSlide key={ins.id}>
              <div className="flex flex-col items-center h-full p-8 transition-transform duration-300 border border-gray-200 shadow-xl rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ">
                
                {/* Instructor Image */}
                <div className="flex justify-center">
                  <img
                    src={ins.img}
                    alt={ins.name}
                    className="object-cover border-4 border-white rounded-full shadow-lg w-28 h-28 dark:border-gray-700"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow mt-6 text-center">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {ins.name}
                  </h4>
                  <p className="mt-1 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
                    {ins.role}
                  </p>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    {ins.description}
                  </p>

                  {/* Socials */}
                  <div className="flex justify-center mt-6 space-x-3">
                    <a
                      href={ins.socials.linkedin}
                      className="flex items-center justify-center w-10 h-10 text-gray-500 transition bg-gray-100 rounded-full hover:bg-primary hover:text-white dark:bg-gray-700 dark:hover:bg-primary"
                    >
                      <FaLinkedin size={18} />
                    </a>
                    <a
                      href={ins.socials.twitter}
                      className="flex items-center justify-center w-10 h-10 text-gray-500 transition bg-gray-100 rounded-full hover:bg-primary hover:text-white dark:bg-gray-700 dark:hover:bg-primary"
                    >
                      <FaTwitter size={18} />
                    </a>
                    <a
                      href={ins.socials.github}
                      className="flex items-center justify-center w-10 h-10 text-gray-500 transition bg-gray-100 rounded-full hover:bg-primary hover:text-white dark:bg-gray-700 dark:hover:bg-primary"
                    >
                      <FaGithub size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default InstructorsCarousel;
