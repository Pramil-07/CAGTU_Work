import { Box, Button, Text, Title, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

const Empty = ({
    title,
    description,
    btnTitle,
    link,
}: {
    title: string;
    description: string;
    btnTitle?: string;
    link?: string;
}) => {
    const router = useRouter();
    const theme = useMantineTheme();
    const smallScreen = useMediaQuery("(max-width: 36em)");

    return (
        <Box
            sx={{
                marginInline: "auto",
                textAlign: "center",
            }}
        >
            <figure
                style={{
                    position: "relative",
                    width: !smallScreen ? 480 : 240,
                    height: !smallScreen ? 420 : 120,
                    marginInline: "auto",
                }}
            >
                <Image
                    src={"/images/empty/result-not-found-icon.svg"}
                    style={{ objectFit: "contain" }}
                    alt={"empty task"}
                    fill
                />
            </figure>
            <Title
                order={2}
                sx={{
                    fontWeight: 500,
                    fontSize: 24,
                    color: theme.colors[theme.primaryColor][4],
                }}
                mt={30}
                mb={8}
            >
                {title}
            </Title>
            <Text
                component="p"
                sx={{
                    fontSize: 16,
                    color: theme.colors.gray[6],
                }}
            >
                {description}
            </Text>

            {btnTitle && link && (
                <Button onClick={() => router.push(link)}>{btnTitle}</Button>
            )}
        </Box>
    );
};

export default Empty;
