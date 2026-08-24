import type { MantineNumberSize } from "@mantine/core";
import { CopyButton } from "@mantine/core";
import { AspectRatio } from "@mantine/core";
import { Button } from "@mantine/core";
import { Checkbox } from "@mantine/core";
import { Flex } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { Modal } from "@mantine/core";
import { IconAward, IconCheck } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import router from "next/router";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import React from "react";

import urls from "@/constants/urls";
import { useRedeemModalStyles } from "@/styles/components/RedeemModalStyles";
import type { OffersProps } from "@/types/OfferProps";
import type { OfferDetailProps } from "@/types/RedeemProps";
import { axiosClient } from "@/utils/axiosClient";

import { toast } from "../common/Toast";
export const RedeemModal = ({
    opened,
    setOpened,
    offersId,
    type,
    offers,
}: {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
    offersId?: number;
    type: "redeem" | "discount";
    offers?: OffersProps["result"][0];
}) => {
    const theme = useMantineTheme();
    const { classes } = useRedeemModalStyles();
    const [isChecked, setIsChecked] = useState(false);
    const handleOnClick = async () => {
        if (isChecked) {
            try {
                const data = await axiosClient.post(
                    `${urls.redeem.redeempoints}${offersId}/`
                );
                router.push("/profile?active_tab=rewards");
            } catch (error) {
                toast.error("Not enough reward points.");
            }
        }
    };

    const { data: OfferDetailData } = useQuery<OfferDetailProps>(
        ["offer-detail", offersId],
        async () => {
            try {
                const { data } = await axiosClient.get(
                    `${urls.offer.initial}${offersId}/`
                );
                return data;
            } catch (error) {
                console.log(
                    "🚀 ~ file: RedeemModal.tsx:40 ~ const{}=useQuery ~ error:",
                    error
                );
            }
        },
        { enabled: !!offersId }
    );
    const { end_date, image, redeem_points, entity_services } =
        OfferDetailData ?? ({} as OfferDetailProps);
    const {
        code: discount_code,
        end_date: discount_end_date,
        title: discount_title,
        description: discount_description,
        image: discount_image,
    } = offers ?? ({} as OffersProps["result"][0]);

    const entityServices = entity_services ?? [];
    const { title, created_by, description } =
        entityServices[0] ?? ({} as OfferDetailProps["entity_services"]);
    return (
        <Modal.Root
            className={classes.root}
            opened={opened}
            onClose={() => setOpened(false)}
            size="54rem"
            scrollAreaComponent={Modal.NativeScrollArea}
        >
            <Modal.Overlay
                sx={{
                    opacity: 0.55,
                    blur: 3,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[9]
                            : theme.colors.gray[4],
                }}
            />

            <Modal.Content
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
                p={
                    {
                        base: "5px",
                        sm: "10px ",
                        lg: "20px",
                    } as unknown as MantineNumberSize
                }
            >
                <Flex justify={"flex-end"}>
                    <Modal.CloseButton size={20} />
                </Flex>
                <Modal.Header sx={{ position: "relative" }}>
                    <Modal.Body
                        className="modal_body"
                        sx={{
                            padding: 0,
                            "& p": {
                                color: theme.colors.gray[7],
                                fontWeight: 400,
                                marginBottom: 16,
                                "& span": { color: theme.colors.gray[8] },
                            },
                        }}
                    >
                        {type === "redeem" && image && (
                            <AspectRatio
                                ratio={2}
                                sx={{
                                    maxWidth: "100%",
                                    objectFit: "fill",
                                    marginBottom: 24,
                                }}
                            >
                                <Image
                                    src={
                                        image ??
                                        "/images/placeholder/taskPlaceholder.png"
                                    }
                                    alt="redeem-image"
                                    fill
                                    style={{
                                        objectFit: "contain",
                                        borderRadius: "4px 4px 0px 0px",
                                    }}
                                />
                            </AspectRatio>
                        )}
                        {type === "discount" && discount_image && (
                            <AspectRatio
                                ratio={2}
                                sx={{
                                    maxWidth: "100%",
                                    objectFit: "fill",
                                    marginBottom: 24,
                                }}
                            >
                                <Image
                                    src={
                                        discount_image ??
                                        "/images/placeholder/taskPlaceholder.png"
                                    }
                                    alt="redeem-image"
                                    fill
                                    style={{
                                        objectFit: "contain",
                                        borderRadius: "4px 4px 0px 0px",
                                    }}
                                />
                            </AspectRatio>
                        )}
                        <Flex mb={8} className="modal_title">
                            {type === "redeem" && <h2>{title}</h2>}
                            {type === "discount" && <h2>{discount_title}</h2>}
                            {type === "redeem" && (
                                <Flex gap={8}>
                                    <IconAward
                                        size={24}
                                        color={theme.colors.brand[3]}
                                    />
                                    <h3>{redeem_points} RP</h3>
                                </Flex>
                            )}
                        </Flex>
                        {type === "redeem" && (
                            <Flex
                                className="modal_description"
                                gap={6}
                                mb={24}
                                justify={"flex-start"}
                            >
                                {created_by?.profile_image && (
                                    <Image
                                        src={
                                            created_by?.profile_image ??
                                            "/redeem/redeem.png"
                                        }
                                        alt="redeem-image"
                                        height={24}
                                        width={24}
                                        style={{
                                            objectFit: "cover",
                                            borderRadius: 50,
                                        }}
                                    />
                                )}
                                {created_by?.full_name}
                            </Flex>
                        )}

                        <Flex
                            direction={"column"}
                            justify={"start"}
                            align={
                                "flex-start                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          "
                            }
                            mb={32}
                            className="footer_titles"
                        >
                            {type === "redeem" && description && (
                                <h3
                                    style={{
                                        fontWeight: 400,
                                        color: theme.colors.gray[6],
                                        fontSize: 16,
                                        marginBottom: 24,
                                    }}
                                >
                                    {parse(description)}
                                </h3>
                            )}
                            {type === "discount" && discount_description && (
                                <h3
                                    style={{
                                        fontWeight: 400,
                                        color: theme.colors.gray[6],
                                        fontSize: 16,
                                        marginBottom: 24,
                                    }}
                                >
                                    {parse(discount_description)}
                                </h3>
                            )}
                            {type === "redeem" && (
                                <h4>
                                    You are about to redeem your{" "}
                                    {created_by?.full_name}
                                    voucher. Please confirm below to proceed.
                                </h4>
                            )}

                            {type === "redeem" && end_date && (
                                <h5>
                                    Expires On{" "}
                                    {format(new Date(end_date), "LLL d yyyy")}
                                </h5>
                            )}
                            {type === "discount" && discount_end_date && (
                                <h5>
                                    Expires On{" "}
                                    {format(
                                        new Date(discount_end_date),
                                        "LLL d yyyy"
                                    )}
                                </h5>
                            )}
                            {type === "redeem" && (
                                <Checkbox
                                    label={
                                        <>
                                            I agree to the{" "}
                                            <Link
                                                style={{
                                                    color: theme.colors
                                                        .status[0],
                                                }}
                                                href="/homaale-terms-conditions"
                                            >
                                                Term&apos;s & conditions
                                            </Link>
                                        </>
                                    }
                                    mb={10}
                                    onChange={() => setIsChecked(!isChecked)}
                                />
                            )}
                        </Flex>
                        {type === "redeem" && (
                            <Button
                                onClick={handleOnClick}
                                sx={{
                                    background: isChecked
                                        ? theme.colors.brand[4]
                                        : theme.colors.white[0],
                                    border: isChecked
                                        ? "none"
                                        : "1px solid rgba(0, 0, 0, 0.45)",
                                    borderRadius: 4,
                                    color: isChecked
                                        ? "#F8FAFF"
                                        : "rgba(0, 0, 0, 0.4)",
                                    fontSize: 16,
                                    fontWeight: 400,
                                    padding: "10px 86px",
                                }}
                            >
                                Redeem Now
                            </Button>
                        )}
                        {type === "discount" && (
                            <Flex
                                justify={"space-between"}
                                align={"center"}
                                className="discount_code"
                            >
                                <h3>{discount_code}</h3>
                                <CopyButton value={discount_code as string}>
                                    {({ copied, copy }) => (
                                        <Button
                                            sx={{
                                                background:
                                                    theme.colors.brand[3],
                                                border: "none",
                                                borderRadius: 4,
                                                fontSize: 16,
                                                fontWeight: 400,
                                                padding: "10px 86px",
                                                color: theme.colors.white[0],
                                            }}
                                            onClick={copy}
                                        >
                                            {copied ? (
                                                <IconCheck width={32} />
                                            ) : (
                                                "Copy Code"
                                            )}
                                        </Button>
                                    )}
                                </CopyButton>
                            </Flex>
                        )}
                    </Modal.Body>
                </Modal.Header>
            </Modal.Content>
        </Modal.Root>
    );
};
