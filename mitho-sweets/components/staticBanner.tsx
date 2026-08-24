'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const BannerSlider = () => {
    return (
        <div className="relative ml-8">
            <Swiper  
                spaceBetween={8}
                autoplay={{
                    delay: 7000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    el: '.custom-pagination',
                    clickable: true,
                }}
                navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
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
                className="mySwiper w-full"
            >
                {/* Slide 1: Kaju Katli */}
                <SwiperSlide className="cursor-pointer">
                    <BannerContent
                        badge="Traditional Sweet"
                        badgeColor="from-orange-100 to-red-100"
                        badgeTextColor="text-orange-800"
                        title="Kaju Katli"
                        titleGradient="from-orange-600 to-red-600"
                        subtitle="Rich and creamy Indian sweet made from premium cashews"
                        borderColor="border-orange-400"
                        description="Kaju Katli is a classic Indian sweet crafted from the finest cashews, delicately cooked with sugar and milk to achieve a perfect fudge-like consistency. Enhanced with aromatic cardamom and adorned with edible silver leaf (varak) for an elegant finish."
                        label="Premium Quality"
                        imageSrc="/assets/kaju_katli.png"
                        imageAlt="Kaju Katli Sweet"
                        imageBg="from-orange-200 to-red-200"
                    />
                </SwiperSlide>

                {/* Slide 2: Cham Cham */}
                <SwiperSlide className="cursor-pointer">
                    <BannerContent
                        badge="Bengali Delicacy"
                        badgeColor="from-pink-100 to-purple-100"
                        badgeTextColor="text-pink-800"
                        title="Cham Cham"
                        titleGradient="from-pink-600 to-purple-600"
                        subtitle="Traditional Bengali sweet made from fresh chenna"
                        borderColor="border-pink-400"
                        description="Cham Cham, also known as Chom Chom or Chomchom, is a beloved Bengali sweet crafted from fresh chenna (paneer). Features a delightfully soft, spongy texture that melts in your mouth."
                        label="Authentic Bengali"
                        imageSrc="/assets/Cham-Cham.png"
                        imageAlt="Cham Cham Sweet"
                        imageBg="from-pink-200 to-purple-200"
                    />
                </SwiperSlide>

                {/* Slide 3: Motichoor Laddu */}
                <SwiperSlide className="cursor-pointer">
                    <BannerContent
                        badge="Festival Special"
                        badgeColor="from-yellow-100 to-orange-100"
                        badgeTextColor="text-yellow-800"
                        title="Motichoor Laddu"
                        titleGradient="from-yellow-600 to-orange-600"
                        subtitle="Golden pearls of sweetness in perfect spheres"
                        borderColor="border-yellow-400"
                        description="Motichoor Laddu is a cherished sweet made from delicate boondi (fried gram flour pearls) soaked in aromatic sugar syrup, then lovingly shaped into perfect round laddus. Motichoor means crushed pearls - a perfect description of its texture."
                        label="Festival Favorite"
                        imageSrc="/assets/Motichoor-laddu.png"
                        imageAlt="Motichoor Laddu Sweet"
                        imageBg="from-yellow-200 to-orange-200"
                    />
                </SwiperSlide>
            </Swiper>

            {/* Navigation Buttons */}
            <div className="custom-pagination mt-2 flex justify-center" />
        </div>
    );
};

interface BannerContentProps {
    badge: string;
    badgeColor: string;
    badgeTextColor: string;
    title: string;
    titleGradient: string;
    subtitle: string;
    borderColor: string;
    description: string;
    label: string;
    imageSrc: string;
    imageAlt: string;
    imageBg: string;
}

const BannerContent = ({
                           badge,
                           badgeColor,
                           badgeTextColor,
                           title,
                           titleGradient,
                           subtitle,
                           borderColor,
                           description,
                           label,
                           imageSrc,
                           imageAlt,
                           imageBg,
                       }: BannerContentProps) => (
    <div className="pt-3 sm:pt-4 md:pt-5 pb-3 sm:pb-4 px-4 sm:px-5">
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 items-center text-center sm:text-left">
            {/* Text Section */}
            <div className="order-2 sm:order-1 space-y-3 sm:space-y-4">
                <div className={`inline-block px-3 py-2 bg-gradient-to-r ${badgeColor} rounded-full`}>
                    <span className={`text-sm font-medium ${badgeTextColor}`}>{badge}</span>
                </div>
                <h1 className={`text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent leading-tight`}>
                    {title}
                </h1>
                <h2 className={`text-base md:text-lg text-gray-600 font-light italic border-l-4 ${borderColor} pl-3`}>
                    {subtitle}
                </h2>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                    <p className="text-sm md:text-base leading-relaxed text-gray-700">
                        <span className="font-bold text-orange-700">{title}</span> {description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-gray-600">{label}</span>
                    </div>
                </div>
            </div>

            {/* Image Section */}
            <div className="order-1 sm:order-2 flex justify-center mb-4 md:mb-0">
                <div className="relative">
                    <div
                        className={`absolute inset-0 bg-gradient-to-r ${imageBg} rounded-full blur-xl opacity-30 scale-110`}/>
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
                        className="relative w-32 sm:w-40 md:w-64 lg:w-80 h-32 sm:h-40 md:h-64 lg:h-80 object-cover rounded-xl"
                        width={384}
                        height={384}
                    />
                </div>
            </div>
        </div>
    </div>
);

export default BannerSlider;
