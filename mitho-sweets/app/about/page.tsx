"use client";
import React, { useState } from "react";
import StatCard from "./StatCard";
import Image from "next/image";
import { MdArrowForwardIos } from "react-icons/md";
import BreadCrumbs from "@/components/common/BreadCrumbs";
// import logo from "../../images/mithoSweetsBgRemoved.png";
import logo from "@/images/logo-bg.png"

const Page = () => {
  
const teamMembers = [
  {
    name: "John Doe",
    role: "Head Chef",
    image: "/team/john.jpg",
    alt: "John Doe",
  },
   {
    name: "Anish Rai",
    role: "Assistant Chef",
    image: "/team/anish.jpg",
    alt: "Anish Rai",
  },
  {
    name: "Jane Smith",
    role: "Fryer / Cooking Specialist",
    image: "/team/jane.jpg",
    alt: "Jane Smith",
  },
 
  {
    name: "Sita Lama",
    role: "Operations Head",
    image: "/team/sita.jpg",
    alt: "Sita Lama",
  },
]
  const timelineData = [
    {
      year: 2023,
      image: "../../assets/start1.jpg",
      description:
        "In 2023, we laid the foundation by collaborating with schools across Nepal to pilot our education tools. we laid the foundation by collaborating with schools across Nepal to pilot our education tools. we laid the foundation by collaborating with schools across Nepal to pilot our education tools.",
    },
    {
      year: 2024,
      image: "../../assets/start1.jpg",
      description:
        "In 2024, we laid the foundation by collaborating with schools across Nepal to pilot our education tools. we laid the foundation by collaborating with schools across Nepal to pilot our education tools. we laid the foundation by collaborating with schools across Nepal to pilot our education tools.",
    },
    {
      year: 2025,
      image: "../../assets/start1.jpg",
      description:
        "In 2025, we laid the foundation by collaborating with schools across Nepal to pilot our education tools. we laid the foundation by collaborating with schools across Nepal to pilot our education tools. we laid the foundation by collaborating with schools across Nepal to pilot our education tools.",
    },
  ];
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const selectedData = timelineData.find((item) => item.year === selectedYear)!;

  return (
    <div className=" text-gray-800 ">
      <div className="w-full bg-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-5">
          <BreadCrumbs
              currentTitle="About page"
              items={[{ name: "About", href: "/about" }]}
          />
        </div>
      </div>
      {/* 1. First Section */}
      <section className="flex flex-col py-16 text-center bg-[#fbfaf6]">
        <h1 className="text-md font-semibold mb-4">- OUR STORY -</h1>
        <div className="text-3xl text-gray-700 font-semibold mx-auto">
          <p className="">The Story Of Bringing Tradition</p>{" "}
          <p className="">To Your Door Step</p>{" "}
          <div className="flex justify-center">
            <Image
              src="../../assets/about1.png"
              alt="about image"
              className="w-full m-16 rounded-lg "
              height={200}
              width={200}
            />
          </div>{" "}
        </div>
      </section>

      {/* 2. Second Section */}
      <section className="flex flex-col justify-center py-16 px-6 md:px-16 bg-white">
        <h2 className="text-3xl font-semibold mb-6">
          <div className="flex justify-center items-center gap-3">
            <div>
              <Image src="../../assets/logo.png" alt="about image" height={60} width={60} />
            </div>
            <div className="relative">
              <div className="text-4xl">How It Started</div>
              <div className="absolute">
                <Image
                  src="../../assets/linedrawing.png"
                  alt="about image"
                  height={160}
                  width={160}
                />
              </div>
            </div>
          </div>
        </h2>

        {/* Timeline Sections */}
        <div className="flex flex-col md:flex-row gap-6 items-start justify-center mt-8">
          {/* Date selector */}
          <div className="flex md:flex-col gap-12">
            {timelineData.map((item) => (
              <button
                key={item.year}
                className={`px-4 py-2 rounded-md -rotate-90  font-medium ${
                  selectedYear === item.year
                    ? "bg-orange-500 text-white "
                    : "text-black  hover:bg-gray-200"
                }`}
                onClick={() => setSelectedYear(item.year)}
              >
                {item.year}
              </button>
            ))}
          </div>

          {/* Image */}
          <div className="">
            <Image
              src={selectedData.image}
              alt={`${selectedData.year} image`}
              width={300}
              height={150}
              className="rounded-lg shadow-md h-80"
            />
          </div>

          {/* Description */}
          <div className=" text-gray-700 flex flex-col w-1/2 ">
            <div className=" bg-orange-500 text-4xl font-semibold w-fit text-white px-5 py-2 rounded-lg mb-5">
            {selectedData.year}
            </div>
            <p className="text-2xl mt-6">{selectedData.description}</p>
          </div>
        </div>
      </section>

      {/* 3. Third Section*/}
      <section className="flex flex-col justify-center bg-[#fbfaf6] py-16 px-6 md:px-16">
        <div className="flex flex-col md:flex-row justify-center items-center gap-10">
          <div className="text-gray-700">
            <Image
              src="https://www.oorla.com/cdn/shop/files/Frame_1686556523_d04f5a57-58b9-45c8-9243-223debc0265e.png?v=1747818972&width=870"
              alt="about image"
              className="w-full h-96 rounded-lg"
              height={300}
              width={300}
            />
          </div>
          <div className="text-gray-700 max-w-2xl text-center md:text-left">
            <h2 className="text-4xl font-semibold mb-6">
              What makes Mitho Sweets special?
            </h2>
            <div className="flex flex-col">
              <div className="">
                Well, everything! We take pride in what we do and what we have
                achieved so far. It’s been more than three years now, and Oorla
                has delivered Nepal&#39;s authentic and signature snacks and sweets
                to 10+ countries and 20,000+ doors. As we always promise, we
                exist to spread the authentic tastes of India across the world.
                Mitho Sweets stands out for its authentic recipes, fresh
                ingredients, and a century-old tradition of delighting taste
                buds with every bite. From handcrafted barfis to rich gudpak,
                our sweets blend heritage with flavor.
              </div>
              <div className="flex mt-8 ">
                <StatCard end={10} label="Countries" />
                <StatCard end={20000} label="Doors" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Meet the Team */}
      <section className="py-16 px-6 md:px-16 bg-white">
            <h2 className="flex justify-center text-4xl font-semibold mb-6">
        Meet the Team
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
        {teamMembers.map(({ name, role, alt }) => (
          <div
            key={name}
            className="group bg-gray-50 rounded-xl p-6 flex flex-col items-center shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          >
            <Image
              src="https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133352080-stock-illustration-default-placeholder-profile-icon.jpg"
              alt={alt}
              height={100} width={100}
              className="rounded-full w-28 h-28 object-cover mb-5 ring-4 ring-orange-500 group-hover:ring-orange-600 transition-all duration-300"
            />
            <h4 className="font-semibold text-lg text-gray-900 mb-1">{name}</h4>
            <p className="text-orange-500 font-medium">{role}</p>
          </div>
        ))}
      </div>
    </section>

    

      {/* 6. Last Section */}
       <section className="flex flex-col justify-center bg-[#fbfaf6] py-16 px-6 md:px-16">
        <div className="flex flex-col md:flex-row justify-center items-center gap-10">
          <div className="text-gray-700">
            <Image
              src="https://c8.alamy.com/comp/C2J4YX/traditional-candy-store-or-sweet-shop-with-display-shelving-of-sweet-C2J4YX.jpg"
              alt="about image"
              className="w-full h-96 rounded-lg"
              height={300}
              width={300}
            />
          </div>
          <div className="text-gray-700 max-w-2xl text-center md:text-left">
                            <Image src={logo} alt="about image" height={60} width={60} />
            <h2 className="text-4xl font-semibold mb-2">
             Open For You To See How
            </h2>
            <h2 className="text-4xl font-semibold mb-6">
              Mitho Sweets Works</h2>
            <div className="flex flex-col">
              <div className="text-lg">
                See how your favorite Sweets & Savouries are carefully packed for freshness.
              </div>
              <div className="flex gap-2 mt-8 items-center font-semibold border-2 shadow-black shadow-md border-black w-fit px-3 py-2 rounded-lg">
                <button  className=" ">
                Coming Soon
              </button>
                 <div className=" ">
                <MdArrowForwardIos />

              </div>
              </div>
           
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Page;
