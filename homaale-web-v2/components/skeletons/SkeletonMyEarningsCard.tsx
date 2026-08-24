import { Box, Flex, Grid, Skeleton, useMantineTheme } from "@mantine/core";
import React from "react";

export const SkeletonEarningsCard = () => {
    const theme = useMantineTheme();
    return (
        <Grid gutter={30}>
            {Array.from({ length: 4 }).map((_, key) => (
                <Grid.Col md={3} key={key}>
                    <Flex
                        sx={{
                            padding: "24px ",
                            border:
                                theme.colorScheme === "dark"
                                    ? `1px solid ${theme.colors.gray[7]}`
                                    : `1px solid rgba(0, 0, 0, 0.08)`,
                            borderRadius: 4,
                            background:
                                theme.colorScheme === "dark"
                                    ? theme.colors.darkBackground[0]
                                    : "#00000008",
                        }}
                    >
                        <Box component="div">
                            <Skeleton height={8} width={100} />
                            <Skeleton height={8} width={70} mt={8} />
                        </Box>
                        <Skeleton circle height={42} />
                    </Flex>
                </Grid.Col>
            ))}
        </Grid>
    );
};
