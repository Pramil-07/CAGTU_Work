import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { useMantineTheme } from "@mantine/core";
import { useMaster } from "@/hooks/useMaster";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import BannerSlider from "@/components/staticBanner";
const Banner = () => {
  const { profiles } = useMaster();
  const theme = useMantineTheme();

  // if (!profiles || profiles.length === 0) {
  //   console.warn("No profiles available.");
  //   return (
  //       // <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
  //         <MithoSweetsLoader/>
  //       // </div>
  //   );
  // }

  const carBanners = profiles
    ?.flatMap((profile) => profile.banners || [])
    ?.filter((banner) => banner.banner_type === "CAR");
  // console.log("Car Banners:", carBanners);

  const information = [
    { title: "Free Shipping", image: "/assets/f1.png", color: "text-red-500" },
    {
      title: "Online Order",
      image: "/assets/feature-2.png",
      color: "text-blue-500",
    },
    {
      title: "Save Money",
      image: "/assets/feature-3.png",
      color: "text-green-500",
    },
    {
      title: "Promotions",
      image: "/assets/feature-4.png",
      color: "text-yellow-500",
    },
    {
      title: "Happy Sell",
      image: "/assets/feature-5.png",
      color: "text-purple-500",
    },
    {
      title: "24/7 Support",
      image: "/assets/feature-6.png",
      color: "text-pink-500",
    },
  ];
  const getBackgroundClass = (colorClass) => {
    const colorMap = {
      "text-red-500": "bg-[#FDDDE4]", // Lighter shade for readability
      "text-blue-500": "bg-[#D1E8f2]",
      "text-green-500": "bg-[#CDEBBC]",
      "text-yellow-500": "bg-[#CDD4F8]",
      "text-purple-500": "bg-[#F6DBF6]",
      "text-pink-500": "bg-[#FFF2E5]",
    };
    return colorMap[colorClass] || "bg-gray-100";
  };

  return (
    <div className="relative w-full">
      <style jsx>{`
        .mySwiper .swiper-slide {
          opacity: 0 !important;
          transition: opacity 0.5s ease-in-out;
        }

        .mySwiper .swiper-slide-active {
          opacity: 1 !important;
        }

        .swiper-button-prev,
        .swiper-button-next {
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
          width: 28px !important;
          height: 28px !important;
          margin-top: -14px !important;
        }

        .relative:hover .swiper-button-prev,
        .relative:hover .swiper-button-next {
          opacity: 0.8;
        }

        .swiper-button-prev:after,
        .swiper-button-next:after {
          font-size: 14px !important;
          font-weight: bold;
        }

        .swiper-button-prev {
          left: 5px !important;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .swiper-button-next {
          right: 5px !important;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .swiper-button-prev:hover,
        .swiper-button-next:hover {
          background: rgb(236, 113, 113);
          transform: scale(1.1);
        }
        .custom-pagination {
          position: relative;
          bottom: 0;
          padding-bottom: 0.5rem;
        }
      `}</style>

      <div className="relative w-full overflow-hidden">
        {carBanners && carBanners?.length > 0 ? (
          <Swiper
            loop={true}
            spaceBetween={8}
            autoplay={{
              delay: 7000,
              disableOnInteraction: false,
            }}
            pagination={{
              el: ".custom-pagination",
              clickable: true,
            }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 8 },
              640: { slidesPerView: 1, spaceBetween: 12 },
              768: { slidesPerView: 1, spaceBetween: 16 },
              1024: { slidesPerView: 1, spaceBetween: 20 },
            }}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            className="mySwiper w-full "
          >
            {(carBanners ? carBanners : BannerContent)?.map((banner, index) => (
              <SwiperSlide key={index} className="cursor-pointer ">
                <div className="pb-3 pt-3 ml-12 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:grid sm:grid-cols-2 gap-3 sm:gap-4 items-center text-center sm:text-left px-2 sm:px-3 md:px-6">
                    <div className="order-2 sm:order-1 space-y-3 sm:space-y-4">
                      <div
                        className="inline-block px-2 sm:px-3 py-1 sm:py-2 rounded-full"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${theme.colors.brand[4]}, ${theme.colors.brand[8]})`,
                        }}
                      >
                        <span className="text-xs sm:text-sm font-medium text-white">
                          {banner.category_badge || "Feature"}
                        </span>
                      </div>

                      <h1
                        className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent leading-tight"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${theme.colors.brand[5]}, ${theme.colors.brand[9]})`,
                        }}
                      >
                        {banner.title || "Motichoor Laddu"}
                      </h1>

                      <h2
                        className="text-sm sm:text-base md:text-lg text-gray-600 font-light italic border-l-2 sm:border-l-4 pl-2 sm:pl-3"
                        style={{
                          borderLeftColor: theme.colors.brand[6],
                        }}
                      >
                        {banner.quotes || "Great Deals"}
                      </h2>
                      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-4 pl-11 rounded-lg">
                        <p className="text-xs sm:text-sm md:text-base leading-relaxed text-gray-700">
                          <span
                            className="font-bold bg-clip-text text-transparent"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${theme.colors.brand[5]}, ${theme.colors.brand[9]})`,
                            }}
                          >
                            {banner.title || "Motichoor Laddu"}
                          </span>
                          <span
                            className="ml-2"
                            style={{ display: "inline" }}
                            dangerouslySetInnerHTML={{
                              __html: (banner.description || "").replace(
                                /<(\/?)p>/g,
                                "<$1span>"
                              ),
                            }}
                          />
                        </p>

                        {/*<div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">*/}
                        {/*  <span className="text-xs sm:text-sm text-gray-600">Premium Quality</span>*/}
                        {/*</div>*/}
                      </div>
                    </div>
                    <div className="order-1 sm:order-2 flex justify-center mt-7">
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-full blur-xl opacity-30 scale-110"
                          style={{
                            backgroundImage: `linear-gradient(to right, ${theme.colors.brand[1]}, ${theme.colors.brand[5]})`,
                          }}
                        ></div>
                        <Image
                          src={banner.image || "/assets/logo-bg.png"}
                          alt={`${banner.title || "Banner"} Image`}
                          className="relative w-auto h-36 sm:h-40 md:h-64 lg:h-80 object-cover rounded-xl"
                          width={384}
                          height={384}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <BannerSlider />
        )}

        <div className="swiper-button-prev !text-black rounded-full px-2  left-1 sm:left-2 after:!text-xl sm:after:!text-lg "></div>
        <div className="swiper-button-next !text-black px-2 rounded-full right-1 sm:right-2 after:!text-xl sm:after:!text-lg "></div>
        <div className="custom-pagination flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-3" />
      </div>

      {/*<div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 justify-items-stretch gap-3">*/}
      {/*  {information.map((feature, index) => (*/}
      {/*      <div*/}
      {/*          key={index}*/}
      {/*          style={{}}*/}
      {/*          className="border rounded-sm p-5 sm:p-2 md:p-3 flex flex-col items-center hover:-translate-y-1 hover:shadow-sm transition-transform duration-10000 ease-in-out"*/}
      {/*      >*/}
      {/*        <Image*/}
      {/*            src={feature.image}*/}
      {/*            alt={feature.title}*/}
      {/*            width={152}*/}
      {/*            height={105}*/}
      {/*            className="w-26 h-26 object-cover"*/}
      {/*        />*/}
      {/*        <h3*/}
      {/*            className={`text-sm sm:text-base md:text-lg font-semibold px-3 py-1 rounded-sm mt-4  ${getBackgroundClass(feature.color)}`}*/}
      {/*            style={{ color: theme.colors.brand[5] }}*/}
      {/*        >*/}
      {/*          {feature.title}*/}
      {/*        </h3>*/}
      {/*      </div>*/}
      {/*  ))}*/}
      {/*</div>*/}
    </div>
  );
};

export default Banner;
