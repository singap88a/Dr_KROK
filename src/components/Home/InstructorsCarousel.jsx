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
      img: "https://placehold.co/300x300?text=Sarah",
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
      img: "https://placehold.co/300x300?text=Michael",
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
      img: "https://placehold.co/300x300?text=Emily",
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
      img: "https://placehold.co/300x300?text=James",
      socials: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
  ];

  return (
    <section       className="relative py-10 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
      {/* Title */}
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Meet Our Instructors
      </h2>
      <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
        Learn from industry experts with years of real-world experience
      </p>

      {/* Carousel */}
      <div className="mx-auto mt-10 max-w-7xl">
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
              <div className="flex flex-col h-full p-6 transition-transform duration-300 bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:scale-105 hover:shadow-xl">
                {/* Instructor Image */}
                <div className="flex justify-center -mt-16">
                  <img
                    src={ins.img}
                    alt={ins.name}
                    className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-md dark:border-gray-700"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow mt-6 text-center">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {ins.name}
                  </h4>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {ins.role}
                  </p>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    {ins.description}
                  </p>

                  {/* Socials */}
                  <div className="flex justify-center mt-4 space-x-4">
                    <a
                      href={ins.socials.linkedin}
                      className="text-gray-500 transition hover:text-primary"
                    >
                      <FaLinkedin size={20} />
                    </a>
                    <a
                      href={ins.socials.twitter}
                      className="text-gray-500 transition hover:text-primary"
                    >
                      <FaTwitter size={20} />
                    </a>
                    <a
                      href={ins.socials.github}
                      className="text-gray-500 transition hover:text-primary"
                    >
                      <FaGithub size={20} />
                    </a>
                  </div>

                  {/* Button */}
                  <button className="px-4 py-2 mt-6 text-sm font-medium text-white transition rounded-lg bg-primary hover:bg-primary/90">
                    View Profile
                  </button>
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
