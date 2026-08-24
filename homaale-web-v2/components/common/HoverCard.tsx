import type { FlexProps } from "@mantine/core";
import { keyframes } from "@mantine/core";
import { Box, Flex, Text, Title, useMantineTheme } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import React, { useState } from "react";

import { useDark } from "@/utils/helpers";

import { MapModal } from "../MapModal";
import { useBrand } from "@/hooks/useBrand";

export const floatUp = keyframes({
    "0%": { transform: "translate3d(0, 0, 0)" },
    "50%": { transform: "translate3d(0, -0.3rem, 0)" },
    "100%": { transform: "translate3d(0, 0, 0)" },
});
export const floatSide = keyframes({
    "0%": { transform: "translate3d(0, 0, 0)" },
    "50%": { transform: "translate3d(0.3rem, 0, 0)" },
    "100%": { transform: "translate3d(0, 0, 0)" },
});

export const HoverTag = ({
    header,
    secondary,
    image,
    is_mobile = false,
    ...rest
}: {
    header: string;
    secondary?: string;
    image?: string;
    is_mobile?: boolean;
} & FlexProps) => {
    const theme = useMantineTheme();
    const dark = useDark();
    const brand =useBrand()

    const [open, setOpen] = useState(false);
    return (
        <>
            <Flex
                bg={brand==="cagtu"? (dark ? theme.colors.gray[8] : theme.colors.gray[4]):"white"}
                display={"flex"}
                pos={is_mobile ? "static" : "absolute"}
                gap={10}
                p={12}
                
                sx={{
                    boxShadow: "0px 0px 30px rgba(0, 0, 0, 0.08)",
                    borderRadius: 16,
                    animation: is_mobile
                        ? "none"
                        : `${
                              image ? floatSide : floatUp
                          } 3s ease-in-out infinite`,
                    cursor: image ? "default" : "pointer",
                    zIndex:50
                }}
                onClick={() => setOpen(image ? false : true)}
                {...rest}
            >
                <Box
                    bg={theme.colors[theme.primaryColor][4]}
                    p={6}
                    sx={{ borderRadius: 12 }}
                >
                    {image ? (
                        <Image
                            src={`https://openweathermap.org/img/wn/${image}@2x.png`}
                            alt="weather"
                            width={35}
                            height={35}
                        />
                    ) : (
                        <Image
                            src={`/svgs/tabler-icon-map-pin.svg`}
                            alt="location"
                            width={30}
                            height={30}
                        />
                    )}
                </Box>
                <Flex direction={"column"} align={"flex-start"}>
                    <Title
                        order={4}
                        weight={600}
                        size={14}
                        display={"flex"}
                        align={"center"}
                    >
                        {header}
                        {image && <>&#8451;</>}
                        {!image && (
                            <IconDotsVertical
                                size={16}
                                style={{ marginLeft: 5 }}
                            />
                        )}
                    </Title>
                    <Text
                        component="span"
                        m={0}
                        color={
                            dark
                                ? theme.colors.homaaleSlate[3]
                                : theme.colors.homaaleSlate[5]
                        }
                    >
                        {secondary ? secondary : format(new Date(), "PP")}
                    </Text>
                </Flex>
            </Flex>
            <MapModal opened={open} setOpened={setOpen} />
        </>
    );
};
