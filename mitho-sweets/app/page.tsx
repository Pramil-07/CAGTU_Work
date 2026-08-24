"use client";
import Banner from "../components/Banner";
// import Testimonial from "../components/Testimonial";
// import Trending from "../components/Trending";
import OurStory from "../components/OurStory";
import Offer from "../components/Offer";
import Image from "next/image";
import CollectionSwiper from "../components/CollectionSwiper";
import PromoCards from "../components/PromoCards";
import Trending from "@/components/Trending";
import {useMaster} from "@/hooks/useMaster";
import {useEffect, useState} from "react";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import TopCategories from "@/components/TopCategories/TopCaregories";
import Features from "@/components/features/Features"
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; // Ensure this is present
import OfferPopup from "@/components/adds/OfferPopup";
// import CategorySection from "@/components/CategorySection";


const Page = () => {
    const { profiles} =useMaster();
    // const headerImg = profiles
    //     ?.flatMap(header => header.banners || [])
    //     .filter(banner => banner.banner_type === "HDR")
    // console.log("header console",headerImg)

    // const footerImg = profiles
    //     ?.flatMap(header => header.banners || [])
    //     .filter(banner => banner.banner_type === "FTR")
    // console.log("footer console",footerImg)
    const [showOffer, setShowOffer] = useState<boolean>(false);

    useEffect(() => {
        const hasPopupBeenShown = sessionStorage.getItem("offerPopupShown");

        if (!hasPopupBeenShown || hasPopupBeenShown === "false") {
            setShowOffer(true);
            sessionStorage.setItem("offerPopupShown", "true");
        }

        const handleBeforeUnload = () => {
            sessionStorage.setItem("offerPopupShown", "false");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const hdrBanners = profiles
        ?.flatMap(profile => profile.banners || [])
        .filter(banner => banner.banner_type === "HDR" && banner.header_banner_image);

    console.log("HDR banners:", hdrBanners);


    return (
      <div className="lg:flex flex-col justify-center page-container items-center">
          {/* Main Section */}
          {/* <div className="relative w-full h-[300px] md:h-[400px] xl:h-[500px]">
      <Image
        src={banner}
        alt="Mitho Sweets Banner"
        className="w-full h-full object-cover"
        width={200}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white text-center p-4">
        <h2 className="text-lg md:text-4xl font-bold">Authentic Nepali sweets and snacks</h2>
        <h3 className="text-md md:text-2xl mt-2">Welcome to Mitho Sweets</h3>
      </div>
    </div> */}

      {/* Swiper Slide Section */}
      {/*<div>*/}
          {showOffer && <OfferPopup onClose={() => setShowOffer(false)} />}
          <div className="flex w-full">
              <Banner />
        </div>
      {/*</div>*/}
      <div className="flex w-full  ">
          <TopCategories/>
      </div>
      <div className="flex w-full ">
        <Trending />
        {/* <Trending /> */}
      </div>
      {/* <div className="flex max-w-7xl h-66">
        <Image src={banner1} alt="banner image" />
      </div> */}
        <div className="flex w-full ">
        <PromoCards />
      </div>
        <div className="flex w-full ">
        <CollectionSwiper popular={true} />
      </div>
        <div className="flex w-full ">
        {/*<Offer />*/}
            <Features/>
      </div>
        <div className="flex w-full ">
            {profiles ? profiles
                ?.flatMap(profile => profile.banners || [])
                .filter(banner => banner.banner_type === "HDR" && banner.header_banner_image)
                .map(banner => (
                    <Image
                        key={banner.id}
                        src={banner.header_banner_image || ""}
                        alt={banner.title || "Header Banner"}
                        width={2000}
                        height={500}
                        className="object-cover w-full"
                    />
                )):
                (
                    <Image
                        src="/assets/banner.png"
                        alt={"Header Banner"}
                        width={2000}
                        height={500}
                        className="object-cover w-full"
                    />
                )
            }
        </div>
        <div className="flex w-full ">
        <CollectionSwiper popular={false} />
      </div>
        <div>
            {/*<CategorySection />*/}
        </div>
      {/* <div className="flex justify-center items-center w-full max-w-screen-xl mx-auto px-4">
        <Testimonial />
      </div> */}
        <div className="flex w-full ">
            {profiles ? profiles
                ?.flatMap(profile => profile.banners || [])
                .filter(banner => banner.banner_type === "FTR" && banner.footer_banner_image)
                .map(banner => (
                    <Image
                        key={banner.id}
                        src={banner.footer_banner_image || ""}
                        alt={banner.title || "Footer Banner"}
                        width={2000}
                        height={48}
                        className="object-cover w-full"
                    />
                )):
                (
                    <Image
                        src="/assets/banner1.png"
                        alt={"Header Banner"}
                        width={2000}
                        height={500}
                        className="object-cover w-full"
                    />
                )
            }
        </div>
        <div className="flex w-full ">
        <OurStory />
      </div>


    </div>
  );
};

export default Page;
