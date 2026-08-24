import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import { useState } from "react";
import {useRouter} from "next/navigation";


const PromoCards = () => {
  const router = useRouter()
  const cards = [
    {
      title: "Smart Offer",
      subtitle: "Save 20% on",
      description: "Kaju Katli",
      image: "../assets/card1.png",
    },
    {
      title: "Sale off",
      subtitle: "Great Summer",
      description: "Collection",
      image: "../assets/card2.png",
    },
    {
      title: "New Arrivals",
      subtitle: "Shop Today’s",
      description: "Deals & Offers",
      image: "../assets/card3.png",
    },
  ];
  const [hoveredIndex, setHoveredIndex] = useState(null);
  return (
      <div className="flex w-full flex-col md:flex-row md:gap-8 gap-2 justify-center">
        {cards.map((card, index) => (
            <div
                key={index}
                className="w-full max-w-[522px] h-40 relative mx-auto"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Background Image */}
              <Image
                  src={card.image}
                  alt="banner image"
                  fill
                  className={`object-cover w-full h-full transition-all duration-700 ease-in-out ${
                      hoveredIndex === index ? "brightness-75" : "brightness-100"
                  }`}
              />

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col justify-center p-4 text-white z-10">
                <h2 className="text-lg font-semibold">{card.title}</h2>
                <p className="text-sm mb-2">{card.description}</p>
                <div className="flex gap-2 items-center mt-4">
                  <button  onClick={()=>{router.push("/shop")}} className="flex gap-2 items-center">
                    Shop Now{" "}
                    <FiArrowRight
                        className={`transition-transform duration-700 ease-in-out ${
                            hoveredIndex === index ? "translate-x-1" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>
        ))}
      </div>
  );
};

export default PromoCards;