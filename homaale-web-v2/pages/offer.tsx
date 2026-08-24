import { AspectRatio, Box, Grid } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { isBefore } from "date-fns";
import Image from "next/image";
import { useEffect, useState } from "react";
import Slider from "react-slick";

import Layout from "@/components/Layout/Layout";
import OfferCard from "@/components/offer/OfferCard";
import urls from "@/constants/urls";
import { useOfferStyles } from "@/styles/pages/OfferStyles";
import type { OffersProps } from "@/types/OfferProps";
import { axiosClient } from "@/utils/axiosClient";
import HomaaleLoader from "@/components/common/HomaaleLoader";

const Offer: React.FC = () => {
    const { classes } = useOfferStyles();
    const [offers, setOffers] = useState<OffersProps | null>(null);
    const [offersWithRedeemPoints, setOffersWithRedeemPoints] = useState<OffersProps | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const BannerSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        arrows: false,
        adaptiveHeight: true,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    const settings = {
        infinite: false,
        dots: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        nextArrow: <IconChevronRight />,
        prevArrow: <IconChevronLeft />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const { data: fetchedOffers } = await axiosClient.get(urls.offer.all);
                const { data: fetchedOffersWithRedeemPoints } = await axiosClient.get(
                    `${urls.offer.all}?has_redeem_points=true`
                );

                setOffers(fetchedOffers);
                setOffersWithRedeemPoints(fetchedOffersWithRedeemPoints);
            } catch (err) {
                setError("Failed to load offers.");
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    width: "100%",
                }}
            >
                <HomaaleLoader />
            </Box>
        );
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <Layout currentTitle={"offers"} heading={"Offer"}>
            <Box component="section" className={classes.offer} id={"offer-section"}>
                <Slider {...BannerSettings}>
                    <AspectRatio
                        ratio={16 / 9}
                        sx={{ maxWidth: 1570, maxHeight: 600 }}
                        mx="auto"
                    >
                        <Image
                            src={"/images/placeholder/taskPlaceholder.png"}
                            fill
                            style={{ objectFit: "contain" }}
                            alt="servicecard-image"
                        />
                    </AspectRatio>
                    <AspectRatio
                        ratio={16 / 9}
                        sx={{ maxWidth: 1570, maxHeight: 600 }}
                        mx="auto"
                    >
                        <Image
                            src={"/images/placeholder/taskPlaceholder.png"}
                            fill
                            style={{ objectFit: "contain" }}
                            alt="servicecard-image"
                        />
                    </AspectRatio>
                </Slider>

                {offers && offers.result.length > 0 && (
                    <Box mt={48} w={"98%"}>
                        <h2>Deals Of The Day</h2>
                        <Slider {...settings}>
                            {offers.result
                                .filter((item) =>
                                    item?.end_date && isBefore(new Date(), new Date(item.end_date))
                                )
                                .map((item, index) => (
                                    <OfferCard key={index} offers={item} varient="daily" />
                                ))}
                        </Slider>
                    </Box>
                )}

                {offersWithRedeemPoints && offersWithRedeemPoints.result.length > 0 && (
                    <Box mt={30} w={"98%"}>
                        <h2>Coupons & Promocode</h2>
                        <Grid gutter={0}>
                            {offersWithRedeemPoints.result
                                .filter((item) => item.offer_type === "promo_code")
                                .map((item, index) => (
                                    <Grid.Col key={index} lg={3} xs={6}>
                                        <OfferCard offers={item} varient="promo" />
                                    </Grid.Col>
                                ))}
                        </Grid>
                    </Box>
                )}

                {offers && offers.result.length > 0 && (
                    <Box mt={30} w={"98%"}>
                        <h2>Top Discounts</h2>
                        <Slider {...settings}>
                            {offers.result
                                .filter((item) => item.offer_type === "basic")
                                .map((item, index) => (
                                    <OfferCard key={index} offers={item} varient="discount" />
                                ))}
                        </Slider>
                    </Box>
                )}
            </Box>
        </Layout>
    );
};

export default Offer;
