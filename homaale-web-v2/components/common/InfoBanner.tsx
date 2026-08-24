import { Box, Flex, Grid, MediaQuery, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconChecks } from "@tabler/icons-react";
import Image from "next/image";
import type { ReactNode } from "react";
import React from "react";

import { useInfoBannerStyles } from "@/styles/components/InfoBannerStyles";

export type InfoBannerProps = {
    SubHeader: string;
    Header: string;
    description: string;
    ImageSrc: string;
    list: string[];
    has_background?: boolean;
    bottomComp: ReactNode;
};

export const InfoBanner = ({
    Header,
    ImageSrc,
    SubHeader,
    bottomComp,
    description,
    has_background,
    list,
}: InfoBannerProps) => {
    const mediumScreen = useMediaQuery("(max-width: 1260px)");

    const { classes, cx } = useInfoBannerStyles();
    return (
        <Box
            className={cx(classes.root, {
                [classes.active]: has_background === true,
            })}
        >
            <Grid gutter={90}>
                <Grid.Col md={6}>
                    <h5>{SubHeader}</h5>
                    <h2>{Header}</h2>
                    <Text component="p" maw={535}>
                        {description}
                    </Text>
                    <ul>
                        {list.map((item, index) => (
                            <li key={index}>
                                <IconChecks size={30} /> {item}
                            </li>
                        ))}
                    </ul>
                    <Flex
                        gap={20}
                        align={{
                            base: " flex-start",
                            sm: "center",
                        }}
                        justify={"flex-start"}
                        direction={{ base: "column", sm: "row" }}
                    >
                        {bottomComp}
                    </Flex>
                </Grid.Col>
                <Grid.Col md={6}>
                    <MediaQuery
                        smallerThan="md"
                        styles={{
                            display: "none",
                        }}
                    >
                        <Image
                            src={ImageSrc}
                            height={582}
                            width={mediumScreen ? 460 : 570}
                            alt="info-banner"
                        />
                    </MediaQuery>
                </Grid.Col>
            </Grid>
        </Box>
    );
};
