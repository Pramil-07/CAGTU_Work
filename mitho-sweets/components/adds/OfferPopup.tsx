"use client";

import { useState, useEffect } from "react";
import { Box, Button, Flex } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import Image from "next/image";
import { useRouter } from "next/navigation";
import apiClient from "@/axiosConfig";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
// import { Center, Container } from "@mantine/core";
import ads from "@/images/ss-banner.jpg";
import dashainADs from "@/images/bannerdas.jpg";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface Stock {
    mrp: number;
    price: number;
}

interface OfferData {
    offer_type: string;
    offer_name: string | null;
    end_date: string;
    product: {
        images: {
            id : number;
            image: string;
        }[];
        thumbnail_image: string | null;
        name: string;
        stock: Stock;
        slug: string;
    };
}

interface OfferPopupProps {
    onClose: () => void;
}

const OfferPopup: React.FC<OfferPopupProps> = ({ onClose }) => {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [offerData, setOfferData] = useState<OfferData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        const fetchOfferData = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await apiClient.get("/offer/list/?is_featured=True");
                if (response.data.result.status === "success" && response.data.result.data.length > 0) {
                    const now = new Date().getTime();
                    const validOffers = response.data.result.data.filter((offer: OfferData) => {
                        const endTime = new Date(offer.end_date + "T23:59:59+05:45").getTime();
                        return endTime > now;
                    });
                    if (validOffers.length > 0) {
                        setOfferData(validOffers);
                    } else {
                        setError("No active featured offers available");
                    }
                } else {
                    setError("No featured offers available");
                }
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to fetch offers data");
            } finally {
                setLoading(false);
            }
        };

        fetchOfferData();
    }, []);

    useEffect(() => {
        if (offerData.length === 0 || activeSlide >= offerData.length) return;

        const endTime = new Date(offerData[activeSlide].end_date + "T23:59:59+05:45").getTime();
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });

            if (distance < 0) {
                clearInterval(timer);
                onClose();
            }
        }, 1000);

        const autoCloseTimer = setTimeout(() => {
            onClose();
        }, 55000); // close in 15 sec

        return () => {
            clearInterval(timer);
            clearTimeout(autoCloseTimer);
        };
    }, [offerData, activeSlide, onClose]);

    // Function to pad numbers with leading zeros
    const formatTime = (value: number) => value.toString().padStart(2, "0");

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    // if (loading) {
    //     return (
    //         <Container size="xl" py="xl">
    //             <Center style={{ minHeight: "100vh" }}>
    //                 <MithoSweetsLoader />
    //             </Center>
    //         </Container>
    //     );
    // }

    if (error || offerData.length === 0) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            // onClick={handleOverlayClick}
        >
            <div className="relative w-full max-w-3xl shadow-lg bg-white rounded-sm">
                <Carousel
                    slideSize="100%"
                    height={400}
                    slideGap="md"
                    withControls={false}
                    withIndicators
                    styles={{
                        indicators: {
                            bottom: '10px',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '5px',
                        },
                        indicator: {
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#aaadb1',
                            borderRadius: '50%',
                            '&[data-active]': {
                                backgroundColor: '#10b981',
                            },
                        },
                    }}
                    onSlideChange={setActiveSlide}
                >
                    {offerData.map((offer, index) => (
                        <Carousel.Slide key={index}>
                <Image
                                src={dashainADs || ads}
                    alt="Offer Background"
                    fill
                    className="object-fit-contain"
                    priority
                />

                <div className="absolute inset-0 z-0" />

                <div className="relative z-10 p-6">
                    <button
                        onClick={onClose}
                        className="absolute text-2xl top-1 right-3 text-red-500 hover:text-red-300"
                    >
                        ×
                    </button>
                                <h2 className="text-xl mt-7 font-bold text-gray-800">{offer.offer_type}</h2>
                    <p className="text-sm  mb-2">Limited quantities.</p>
                                <p>{offer.offer_name || offer.product.name}</p>
                    <p className="-mt-2 mb-3">Summer Collection New</p>
                    <p className="-mt-2 mb-3">Modern Design</p>
                    <p className="text-red-500 font-bold">
                                    ${Math.abs(offer.product.stock.price).toFixed(2)}{" "}
                        <span className="line-through font-semibold text-black ">
                                        ${offer.product.stock.mrp.toFixed(2)}
                        </span>
                    </p>
                    <p className="text-sm mt-3">Hurry Up! Offer End In:</p>
                    <Flex gap="xs" className="mt-1">
                        <Box className="flex flex-col items-center">
                            <Button
                                className="bg-green-500 text-white px-3 py-1 rounded relative"
                                style={{ overflow: "hidden" }}
                                onMouseEnter={(e) => {
                                    const span = e.currentTarget.querySelector("span");
                                    if (span) span.style.transform = "translateY(-5px)";
                                }}
                                onMouseLeave={(e) => {
                                    const span = e.currentTarget.querySelector("span");
                                    if (span) span.style.transform = "translateY(0)";
                                }}
                            >
                                <span
                                    className="inline-block transition-transform duration-300"
                                    style={{ transform: "translateY(0)", display: "block" }}
                                >
                                    {formatTime(timeLeft.days)}
                                </span>
                            </Button>
                            <span className="text-xs mt-2">Days</span>
                        </Box>
                        <span className="mt-1 font-semibold">:</span>
                        <Box className="flex flex-col items-center">
                            <Button
                                className="bg-green-500 text-white px-3 py-1 rounded relative"
                                style={{ overflow: "hidden" }}
                                onMouseEnter={(e) => {
                                    const span = e.currentTarget.querySelector("span");
                                    if (span) span.style.transform = "translateY(-5px)";
                                }}
                                onMouseLeave={(e) => {
                                    const span = e.currentTarget.querySelector("span");
                                    if (span) span.style.transform = "translateY(0)";
                                }}
                            >
                                <span
                                    className="inline-block transition-transform duration-300"
                                    style={{ transform: "translateY(0)", display: "block" }}
                                >
                                    {formatTime(timeLeft.hours)}
                                </span>
                            </Button>
                            <span className="text-xs mt-2">Hours</span>
                        </Box>
                        <span className="mt-1 font-semibold">:</span>
                        <Box className="flex flex-col items-center">
                            <Button
                                className="bg-green-500 text-white px-3 py-1 rounded relative"
                                style={{ overflow: "hidden" }}
                                onMouseEnter={(e) => {
                                    const span = e.currentTarget.querySelector("span");
                                    if (span) span.style.transform = "translateY(-5px)";
                                }}
                                onMouseLeave={(e) => {
                                    const span = e.currentTarget.querySelector("span");
                                    if (span) span.style.transform = "translateY(0)";
                                }}
                            >
                                <span
                                    className="inline-block transition-transform duration-300"
                                    style={{ transform: "translateY(0)", display: "block" }}
                                >
                                    {formatTime(timeLeft.minutes)}
                                </span>
                            </Button>
                            <span className="text-xs mt-2">Mins</span>
                        </Box>
                        <span className="mt-1 font-semibold">:</span>
                        <Box className="flex flex-col items-center">
                            <Button
                                className="bg-green-500 text-white px-3 py-1 rounded relative"
                                style={{ overflow: "hidden" }}
                                onMouseEnter={(e) => {
                                    const span = e.currentTarget.querySelector("span");
                                    if (span) span.style.transform = "translateY(-5px)";
                                }}
                                onMouseLeave={(e) => {
                                    const span = e.currentTarget.querySelector("span");
                                    if (span) span.style.transform = "translateY(0)";
                                }}
                            >
                                <span
                                    className="inline-block transition-transform duration-300"
                                    style={{ transform: "translateY(0)", display: "block" }}
                                >
                                    {formatTime(timeLeft.seconds)}
                                </span>
                            </Button>
                            <span className="text-xs mt-2 ">Sec</span>
                        </Box>
                    </Flex>
                    <Button
                        variant="outline"
                        className="mt-4 px-4 py-2 rounded flex items-center justify-center transition-all duration-300"
                        style={{ transform: "translateY(0)", transition: "transform 0.5s ease" }}
                        onMouseEnter={(e) => {
                            const button = e.currentTarget;
                            button.style.transform = "translateY(-5px)";
                            const arrow = button.querySelector("span");
                            if (arrow) {
                                arrow.style.transform = "translateX(0)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            const button = e.currentTarget;
                            button.style.transform = "translateY(0)";
                            const arrow = button.querySelector("span");
                            if (arrow) {
                                arrow.style.transform = "translateX(0)";
                            }
                        }}
                        onClick={() => router.push(`/product/${offerData[activeSlide]?.product?.slug || '/shop'}`)}                    >
                        Shop Now{" "}
                        <span
                            className="ml-2 transition-transform duration-300"
                            style={{ transform: "translateX(0)" }}
                        >
                            →
                        </span>
                    </Button>
                </div>
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </div>
        </div>
    );
};

export default OfferPopup;