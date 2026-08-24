"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import trending from "@/app/trending";
import ProductDisplay from "@/components/ProductDisplay";
import React, {useEffect, useRef, useState} from "react";
import {useMantineTheme} from "@mantine/core";
import {IconButton} from "@mui/material";
import apiClient from "@/axiosConfig";
import { ProductProps } from "@/DataTypes/Products/ProductProps";
import NoDataPage from "@/components/Error/NoDataPage";

const CollectionSwiper = ({popular}:{popular:boolean}) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const theme = useMantineTheme();
    const [recommendProducts,setRecommendProducts]= useState<ProductProps["result"]>()

    useEffect(() => {
        const fetchRecommendProducts = async ()=>{
            const response = await apiClient.get( popular?"/product/popular-list/":"/product/recommend-list/")
            setRecommendProducts( popular?response.data.data :response.data.data)
            console.log("prod",response.data)
        }
        fetchRecommendProducts()
    }, []);
    console.log("recomprod2",recommendProducts)
    return (
        <div className="w-full mb-5 flex-col mt-8">
            <div className="flex md:justify-between justify-between md:gap-0 gap-8 items-center mb-4">
                <h2 className="md:text-2xl text-lg flex font-bold">
                    <span style={{color: theme.colors.brand[7]}}> {popular?"POPULAR":"RECOMMENDED"} </span>&nbsp; PRODUCTS</h2>

                {/* Custom Swiper navigation buttons */}
                <div className="flex space-x-2 text-xl gap-2">
                    <IconButton ref={prevRef} className="rounded-full border"
                            sx={{
                                color: theme.colors.brand[7],
                                backgroundColor: theme.colors.brand[2],
                                border: "1px solid",
                                padding: "4px",
                                "&:hover": {
                                    color: "white",
                                    backgroundColor: theme.colors.brand[5],
                                    borderColor: theme.colors.brand[5],
                                },
                            }}>
                        <FiArrowLeft />
                    </IconButton>
                    <IconButton ref={nextRef} className="rounded-full p-1 border"
                            sx={{
                                color: theme.colors.brand[7],
                                backgroundColor: theme.colors.brand[2],
                                border: "1px solid",
                                padding: "4px",
                                "&:hover": {
                                    color: "white",
                                    backgroundColor: theme.colors.brand[5],
                                    borderColor: theme.colors.brand[5],
                                },
                            }}>
                        <FiArrowRight />
                    </IconButton>
                </div>
            </div>

            <Swiper
                modules={[Autoplay, Navigation]}
                spaceBetween={20}
                slidesPerView={5}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                loop={true}
                // onBeforeInit={(swiper) => {
                //     swiper.params?.navigation?.prevEl = prevRef.current;
                //     swiper.params?.navigation?.nextEl = nextRef.current;
                // }}
                navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                }}
                breakpoints={{
                    0: {
                        slidesPerView: 2,
                        spaceBetween: 10,
                    },
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 15,
                    },
                    1024: {
                        slidesPerView: 5,
                        spaceBetween: 20,
                    },
                }}
            >
                {recommendProducts && recommendProducts?.length>0 ?(  recommendProducts?.map((product) => (
                    <SwiperSlide key={product.id}>
                        <ProductDisplay
                            key={product.id}
                            product={product}
                            border={false}
                            isWish={null}
                        />
                    </SwiperSlide>
                ))
                ):(
                    <NoDataPage msg={`No ${popular?"Popular":"Recommended"} Products Available`} height={"30vh"}/>
                )
                }
            </Swiper>
        </div>
    );
};

export default CollectionSwiper;
