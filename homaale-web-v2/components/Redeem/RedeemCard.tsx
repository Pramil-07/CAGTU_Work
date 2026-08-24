import {
    AspectRatio,
    Box,
    Button,
    Flex,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { IconAward } from "@tabler/icons-react";
import Image from "next/image";
import React, { useState } from "react";

import { useRedeemCardStyles } from "@/styles/components/RedeemCardStyles";
import type { OffersProps } from "@/types/OfferProps";

import { RedeemModal } from "./RedeemModal";

const RedeemCard = ({ offers }: { offers: OffersProps["result"][0] }) => {
    const { id, title, image, description } =
        offers ?? ({} as OffersProps["result"][0]);
    const theme = useMantineTheme();
    const [redeemModal, setRedeemModal] = useState(false);
    const { classes } = useRedeemCardStyles();

    return (
        <>
            <Box className={classes.root} mx={15} mb={30}>
                {image && (
                    <AspectRatio
                        ratio={4 / 3}
                        sx={{
                            maxWidth: "100%",
                            objectFit: "fill",
                        }}
                    >
                        <Image
                            src={
                                image ??
                                "/images/placeholder/taskPlaceholder.png"
                            }
                            alt="redeem-image"
                            fill
                            style={{ objectFit: "contain" }}
                        />
                    </AspectRatio>
                )}

                <Box p={16}>
                    <Flex
                        mb={10}
                        justify={"flex-start"}
                        align={"center"}
                        gap={8}
                    >
                        <IconAward size={26} color={theme.colors.brand[3]} />
                        <h3>{title}</h3>
                    </Flex>
                    <Text sx={{ color: theme.colors.gray[5] }} lineClamp={2}>
                        {description}
                    </Text>
                    <Button
                        mt={18}
                        mb={16}
                        fullWidth
                        sx={{
                            background: theme.colors.gray[8],
                            fontStyle: "normal",
                            fontWeight: 400,
                            fontSize: 14,
                            border: `1px solid ${theme.colors.socialicons[9]}`,
                            "&:hover": {
                                border: "none",
                            },
                        }}
                        onClick={() => setRedeemModal(true)}
                    >
                        Redeem Now
                    </Button>
                </Box>
            </Box>
            {redeemModal && (
                <RedeemModal
                    type="redeem"
                    offersId={id}
                    opened={redeemModal}
                    setOpened={setRedeemModal}
                />
            )}
        </>
    );
};

export default RedeemCard;
