import {
    AspectRatio,
    Box,
    Button,
    CopyButton,
    Flex,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import React, { useState } from "react";

import type { OffersProps } from "@/types/OfferProps";

import { RedeemModal } from "../Redeem/RedeemModal";

export type OfferCardProps = {
    varient: "daily" | "promo" | "discount";
    offers: OffersProps["result"][0];
};

const OfferCard = ({ varient, offers }: OfferCardProps) => {
    const [discountModal, setDiscountModal] = useState(false);
    const theme = useMantineTheme();
    const { title, code, description, image } =
        offers ?? ({} as OffersProps["result"][0]);

    return (
        <Box
            mx={15}
            mb={30}
            sx={{
                border:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : `0.1px solid rgba(0, 0, 0, 0.08)`,
                borderRadius: 4,
                "&:hover": {
                    border: `1px solid ${theme.colors[theme.primaryColor][4]}`,
                },

                "& h3": {
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.gray[2]
                            : theme.colors.homaaleSlate[8],
                    fontWeight: 500,
                    marginBottom: 8,
                },
            }}
        >
            <AspectRatio
                ratio={4 / 3}
                sx={{
                    maxWidth: "100%",
                }}
                mx="auto"
            >
                <Image
                    src={image ?? "/images/placeholder/taskPlaceholder.png"}
                    fill
                    alt="servicecard-image"
                    style={{
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        objectFit: "contain",
                    }}
                />
            </AspectRatio>
            <Box p={16}>
                <h3>{title}</h3>
                {varient === "promo" && (
                    <Text component="p" color={"gray.6"} lineClamp={2}>
                        {description}
                    </Text>
                )}
                {varient === "daily" && (
                    <Text component="p" color={"gray.6"}>
                        {description}
                    </Text>
                )}
                {varient === "discount" && (
                    <Text
                        component="p"
                        color={theme.colors.status[0]}
                        fw={700}
                        size={42}
                    >
                        25%{" "}
                        <Text
                            component="span"
                            color={theme.colors.status[0]}
                            fw={400}
                        >
                            OFF
                        </Text>
                    </Text>
                )}
                {varient === "promo" && (
                    <Flex
                        sx={{
                            border: `1px solid #ADB5BD`,
                            borderRadius: 4,
                        }}
                        mt={16}
                    >
                        <Text
                            component="span"
                            mx={"auto"}
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.gray[2]
                                    : theme.colors.homaaleSlate[5]
                            }
                        >
                            {code}
                        </Text>
                        <CopyButton value={code}>
                            {({ copied, copy }) => (
                                <Button
                                    color={copied ? "orange.4" : "dark"}
                                    onClick={copy}
                                >
                                    {copied ? <IconCheck width={32} /> : "Copy"}
                                </Button>
                            )}
                        </CopyButton>
                    </Flex>
                )}
                {varient === "discount" && (
                    <Flex mt={16}>
                        <Text
                            component="span"
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.gray[2]
                                    : theme.colors.homaaleSlate[5]
                            }
                            onClick={() => setDiscountModal(true)}
                            sx={{
                                cursor: "pointer",
                            }}
                        >
                            {"View detail >"}
                        </Text>
                        <Button color={"dark"}>Code</Button>
                    </Flex>
                )}
                {discountModal && (
                    <RedeemModal
                        opened={discountModal}
                        setOpened={setDiscountModal}
                        type="discount"
                        offers={offers}
                    />
                )}
            </Box>
        </Box>
    );
};

export default OfferCard;
