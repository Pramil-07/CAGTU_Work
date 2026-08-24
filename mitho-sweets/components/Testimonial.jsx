"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { FreeMode, Pagination } from "swiper/modules";
import quote from "../images/quote.png";
import { Rating } from "@mantine/core";
const Testimonial = () => {
  const reviews = [
    {
      name: "Pramil Dhungana",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTThRKP_Ri1WG5CL_2a_cVnH401tUK5bwRuOA&s",
      rating: 5,
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed, eveniet, rem distinctio optio nisi illum nihil quisquam quae hic beatae iure voluptatum, quaerat itaque et.",
    },
    {
      name: "Utsav Guragain",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTThRKP_Ri1WG5CL_2a_cVnH401tUK5bwRuOA&s",
      rating: 5,
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed, eveniet, rem distinctio optio nisi illum nihil quisquam quae hic beatae iure voluptatum, quaerat itaque et.",
    },
    {
      name: "Nirman Subedi",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTePvPIcfgyTA_2uby6QSsAG7PDe0Ai1Pv9x6cpYZYRGyxKSufwKmkibEpGZDw1fw5JUSs&usqp=CAU",
      rating: 5,
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed, eveniet, rem distinctio optio nisi illum nihil quisquam quae hic beatae iure voluptatum, quaerat itaque et.",
    },
    {
      name: "Nishan Subedi",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWCAIYSZNHw_Ynhq-E1_iSnZQ4yem4hS7H5yxg58SdOvJTiDf255nUwNIdhw4AAEk9sj0&usqp=CAU",
      rating: 5,
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed, eveniet, rem distinctio optio nisi illum nihil quisquam quae hic beatae iure voluptatum, quaerat itaque et.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 my-5 shadow-xl ">
      <h2 className="text-center text-4xl font-bold mb-6 flex items-center justify-center space-x-3">
        <span className=" h-4 mb-2">WHAT PEOPLE SAY ABOUT US</span>
      </h2>
      <Image
        src={quote}
        alt="quote left"
        className="w-8 h-8"
        width={300}
        height={300}
      />

      <Swiper
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 30 },
          1024: { slidesPerView: 3, spaceBetween: 40 },
        }}
        spaceBetween={30}
        freeMode
        pagination={{ clickable: true }}
        modules={[FreeMode, Pagination]}
        className="w-full"
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className="dark:bg-gray-800 hover:shadow-xl transform hover:scale-[1.02] transition duration-300 p-8 h-full flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={review.image}
                  alt={review.name}
                  width={50}
                  height={50}
                  className="rounded-full object-cover border-2 border-[#772d2d]"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {review.name}
                  </h3>
                  <Rating value={3} />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                “{review.text}”
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="flex justify-end">
        <Image
          src={quote}
          alt="quote left"
          className="w-8 h-8 rotate-180"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
};

export default Testimonial;
