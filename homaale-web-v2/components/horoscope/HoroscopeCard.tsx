import { Box, Flex, Spoiler, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Image from "next/image";
import React from "react";

const HoroscopeCard = ({
    title,
    desc,
    icon,
}: {
    title: string;
    desc: string;
    icon: string;
}) => {
    const theme = useMantineTheme();
    const smallScreen = useMediaQuery("(max-width: 36em)");
    return (
        <Box
            sx={{
                border:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[6]
                        : "1px solid #ced4da",
                borderRadius: 4,
                padding: 24,
                cursor: "pointer",
                background:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[6]
                        : "inherit",
                "& p": {
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[0]
                            : theme.colors.homaaleSlate[6],
                },
            }}
        >
            <Flex align={"flex-start"} justify={"flex-start"}>
                <Image
                    src={icon}
                    alt={"rasifal-image"}
                    height={smallScreen ? 64 : 100}
                    width={smallScreen ? 64 : 100}
                    style={{ objectFit: "contain" }}
                />
                <Box ml={24}>
                    <Spoiler
                        maxHeight={120}
                        showLabel="See more"
                        hideLabel="Hide"
                    >
                        <h4>{title}</h4>
                        <Text component="p">{desc}</Text>
                    </Spoiler>
                </Box>
            </Flex>
        </Box>
    );
};

export default HoroscopeCard;
