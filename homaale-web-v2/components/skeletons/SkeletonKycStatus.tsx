import { Box, Flex, Grid, Skeleton } from "@mantine/core";
import React from "react";

import { useKycStyles } from "@/styles/components/KycStyles";

export const SkeletonKycStatus = () => {
    const { classes, theme } = useKycStyles();

    return (
        <Box className={classes.wrapper}>
            <Flex
                sx={{
                    [theme.fn.smallerThan("md")]: {
                        flexDirection: "column",
                        alignItems: "start",
                    },
                }}
            >
                <Flex
                    align={"flex-start"}
                    gap={16}
                    sx={{
                        flexWrap: "wrap",
                    }}
                >
                    <Skeleton height={80} width={80} />
                    <Box>
                        <Skeleton height={8} width={150} mb={8} />
                        <Skeleton height={8} width={150} mb={8} />
                        <Skeleton height={8} width={150} />
                    </Box>
                </Flex>
                <Box
                    sx={{
                        textAlign: "right",
                        [theme.fn.smallerThan("md")]: {
                            display: "none",
                        },
                    }}
                >
                    <Flex>
                        <Skeleton height={8} width={150} mb={8} />
                    </Flex>
                    <Skeleton height={8} width={150} mb={8} />
                    <Skeleton height={8} width={150} />
                </Box>
            </Flex>
            <Skeleton height={4} width={"100%"} mt={16} />
            <Grid mt={4} mb={4} className="basic-details">
                <Grid.Col md={4} xs={12}>
                    <Skeleton height={8} width={150} />
                    <Skeleton height={6} width={100} mt={8} />
                </Grid.Col>
                <Grid.Col md={4} xs={12}>
                    <Skeleton height={8} width={150} />
                    <Skeleton height={6} width={120} mt={8} />
                </Grid.Col>
                <Grid.Col md={4} xs={12}>
                    <Skeleton height={8} width={150} />
                    <Skeleton height={6} width={90} mt={8} />
                </Grid.Col>
            </Grid>
        </Box>
    );
};
