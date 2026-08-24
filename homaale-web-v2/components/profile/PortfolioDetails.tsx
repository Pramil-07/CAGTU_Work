import {
    AspectRatio,
    Box,
    Flex,
    Grid,
    Modal,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import React from "react";
import Slider from "react-slick";

import urls from "@/constants/urls";
import type { PortfolioDetailsValuesProps } from "@/types/profile/PortfolioDetailsProps";
import { axiosClient } from "@/utils/axiosClient";
import {useEntityServiceDetailStyles} from "@/styles/pages/EntityServiceDetailStyles";
interface PortfolioDetailsProps {
    opened: boolean;
    handleClose: () => void;
    setShowPortfolioDetails: Dispatch<SetStateAction<boolean>>;
    id?: number;
}

const PortfolioDetails = ({
    opened,
    handleClose,
    id,
}: PortfolioDetailsProps) => {
    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        arrows: false,
        adaptiveHeight: true,
        slidesToShow: 1,
        slidesToScroll: 1,
    };
    const theme = useMantineTheme();
    const {classes} = useEntityServiceDetailStyles();
    const { data: portfolioDetail } = useQuery(
        ["tasker-portfolio", id],
        async () => {
            try {
                const { data } =
                    await axiosClient.get<PortfolioDetailsValuesProps>(
                        `${urls.profile.portfolio}${id}`
                    );
                return data;
            } catch (error) {
                if (error instanceof AxiosError) {
                    const errors = Object.values(error.response?.data).join(
                        "\n"
                    );
                    throw new Error(errors);
                }
                throw new Error("Something went wrong");
            }
        },
        { enabled: !!id }
    );

    return (
        <>
            <Modal.Root
                opened={opened}
                onClose={handleClose}
                centered
                closeOnEscape={false}
                closeOnClickOutside={false}
                size={"lg"}
                padding={32}
            >
                <Modal.Overlay
                    sx={{
                        opacity: 0.55,
                        blur: 3,
                    }}
                />
                <Modal.Content w={200}>
                    <Modal.Header
                        sx={{
                            padding: "24px 32px",
                        }}
                    >
                        <Modal.Title>
                            <h4>{portfolioDetail?.title}</h4>
                        </Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <Text
                            component="p"
                            align="right"
                            color={"gray.6"}
                            mb={16}
                        >
                            Issued date:{" "}
                            {portfolioDetail?.issued_date &&
                                format(
                                    new Date(
                                        String(portfolioDetail?.issued_date)
                                    ),
                                    "dd MMMM yyyy"
                                )}
                        </Text>
                        <Text
                            component="div"
                            color="gray.7"
                            align="justify"
                            mb={16}
                            className={classes.description}
                            dangerouslySetInnerHTML={{ __html: portfolioDetail?.description || "" }}
                        />


                        {portfolioDetail?.files.length &&
                        portfolioDetail?.files?.length > 0 ? (
                            <>
                                <h4> Related Documents:</h4>
                                <Grid sx={{ gap: 30 }}>
                                    {portfolioDetail.files &&
                                        portfolioDetail.files.map(
                                            (file: any, i: number) => (
                                                <Grid.Col md={3} sm={4} key={i}>
                                                    <Flex
                                                        className="file"
                                                        direction={"column"}
                                                        justify={"center"}
                                                        align={"center"}
                                                    >
                                                        <a
                                                            target="_blank"
                                                            href={file.media}
                                                            rel="noreferrer"
                                                        >
                                                            <figure className="file-img">
                                                                <Image
                                                                    src={
                                                                        "/svgs/pdf.svg"
                                                                    }
                                                                    alt="document-type-icon"
                                                                    height={100}
                                                                    width={100}
                                                                />
                                                            </figure>
                                                        </a>
                                                        <Box className="file-name py-2 px-2">
                                                            {file.name.substring(
                                                                file.name.indexOf(
                                                                    "/media/"
                                                                ) + 7
                                                            )}
                                                        </Box>
                                                    </Flex>
                                                </Grid.Col>
                                            )
                                        )}
                                </Grid>
                            </>
                        ) : (
                            ""
                        )}

                        <Text
                            component="p"
                            color={"gray.7"}
                            align="justify"
                            mb={16}
                            mt={16}
                        >
                            <Text
                                component="a"
                                href={portfolioDetail?.credential_url}
                                target="_blank"
                                rel="noreferrer"
                                color={"blue"}
                            >
                                View More
                            </Text>
                        </Text>
                        <Box
                            sx={{
                                width: 210,
                                [`@media (min-width: 281px)`]: { width: 280 },
                                [`@media (min-width: ${theme.breakpoints.sm}px)`]:
                                    { width: 550 },
                            }}
                        >
                            {portfolioDetail &&
                            portfolioDetail?.images.length > 0 ? (
                                <Slider {...settings}>
                                    {portfolioDetail?.images.map((img: any) => (
                                        <AspectRatio
                                            ratio={16 / 9}
                                            mx="auto"
                                            key={img.id}
                                        >
                                            <Box w={"100%"}>
                                                <Image
                                                    src={img.media}
                                                    fill
                                                    alt={`image-${portfolioDetail?.images[0].media}`}
                                                    placeholder="blur"
                                                    blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                                                    style={{
                                                        objectFit: "contain",
                                                    }}
                                                    className="img"
                                                />
                                            </Box>
                                        </AspectRatio>
                                    ))}
                                </Slider>
                            ) : (
                                ""
                            )}

                            {/* <Slider {...settings}>
                                <div>
                                    <h1>hello</h1>
                                </div>
                                <div>
                                    <h1>hello2</h1>
                                </div>
                            </Slider> */}
                        </Box>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    );
};

export default PortfolioDetails;
