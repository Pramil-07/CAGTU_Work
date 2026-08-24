"use client";
import Image from "next/image";

const Offer = () => {
  const offer = [
    {
      title: "SNACKS",
      description:
        "Crunchy, light, and tasty — our snacks are perfect for any time of the day. Made with care and full of flavor.",
      image: "../assets/offer1.png",
    },
    {
      title: "SWEETS",
      description:
        "Indulge in traditional and modern sweets made with love and premium ingredients. A perfect treat for every sweet tooth.",
      image: "../assets/offer2.png",
    },
    {
      title: "SAVOURY",
      description:
        "From spicy bites to cheesy delights, our savoury collection is sure to satisfy your cravings with every bite.",
      image: "../assets/offer3.png",
    },
  ];

  return (
    <div className="w-full">
      <h2 className="flex justify-center text-2xl md:text-4xl font-bold text-gray-800 text-center">
        WHAT WE OFFER
      </h2>

      <div className="flex flex-col  sm:flex-row sm:flex-wrap justify-between items-center mt-5 mb-5">
        {offer.map((o) => (
          <div
            key={o.title}
            className="bg-white min-h-[420px] max-h-[420px] rounded-2xl text-black shadow-md transition-transform transform cursor-pointer hover:-translate-y-2 hover:shadow-xl px-6 py-6 flex flex-col items-center text-center w-full sm:w-[45%] md:w-[30%]"
          >
            <Image
              src={o.image}
              alt={o.title}
              height={286}
              width={286}
              className="rounded-lg object-cover h-64 w-full"
            />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-4">
              {o.title}
            </h3>
            <p className="text-sm sm:text-md mt-2">{o.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Offer;
