import { Box, Flex, Grid, Group, Skeleton } from "@mantine/core";
import React from "react";

export const SkeletonPaymentMethods = () => {
    return (
        <Grid gutter={30}>
            <Grid.Col md={6}>
                <Box
                    component="div"
                    sx={{
                        border: `1px solid rgba(0, 0, 0, 0.08)`,
                        borderRadius: 4,
                        padding: "16px 24px",
                        width: "100%",
                    }}
                >
                    <Skeleton height={8} width="50%" mb={12} />
                    <Skeleton height={6} width="20%" mb={8} />

                    <Group grow mb={24}>
                        <Box
                            sx={{
                                border: `1px solid rgba(0, 0, 0, 0.08)`,
                                borderRadius: 4,
                                padding: "12px",
                                position: "relative",
                            }}
                        >
                            <Flex>
                                <Skeleton height={50} circle />
                                <Box
                                    component="div"
                                    sx={{ width: "80%" }}
                                    ml={8}
                                >
                                    <Skeleton height={8} />
                                    <Skeleton
                                        height={8}
                                        mt={6}
                                        width="70%"
                                        radius="xl"
                                    />
                                </Box>
                            </Flex>
                        </Box>
                        <Box
                            sx={{
                                border: `1px solid rgba(0, 0, 0, 0.08)`,
                                borderRadius: 4,
                                padding: "12px",
                                position: "relative",
                            }}
                        >
                            <Flex>
                                <Skeleton height={50} circle />
                                <Box
                                    component="div"
                                    sx={{ width: "80%" }}
                                    ml={8}
                                >
                                    <Skeleton height={8} />
                                    <Skeleton
                                        height={8}
                                        mt={6}
                                        width="70%"
                                        radius="xl"
                                    />
                                </Box>
                            </Flex>
                        </Box>
                        <Box
                            sx={{
                                border: `1px solid rgba(0, 0, 0, 0.08)`,
                                borderRadius: 4,
                                padding: "12px",
                                position: "relative",
                            }}
                        >
                            <Flex>
                                <Skeleton height={50} circle />
                                <Box
                                    component="div"
                                    sx={{ width: "80%" }}
                                    ml={8}
                                >
                                    <Skeleton height={8} />
                                    <Skeleton
                                        height={8}
                                        mt={6}
                                        width="70%"
                                        radius="xl"
                                    />
                                </Box>
                            </Flex>
                        </Box>
                    </Group>
                    <Skeleton height={6} width="40%" mb={8} />

                    <Group grow>
                        <Box
                            sx={{
                                border: `1px solid rgba(0, 0, 0, 0.08)`,
                                borderRadius: 4,
                                padding: "12px",
                                position: "relative",
                            }}
                        >
                            <Flex>
                                <Skeleton height={50} circle mb={8} />
                                <Box
                                    component="div"
                                    sx={{ width: "80%" }}
                                    ml={8}
                                >
                                    <Skeleton height={8} />
                                    <Skeleton
                                        height={8}
                                        mt={6}
                                        width="70%"
                                        radius="xl"
                                    />
                                </Box>
                            </Flex>
                        </Box>
                        <Box
                            sx={{
                                border: `1px solid rgba(0, 0, 0, 0.08)`,
                                borderRadius: 4,
                                padding: "12px",
                                position: "relative",
                            }}
                        >
                            <Flex>
                                <Skeleton height={50} circle />
                                <Box
                                    component="div"
                                    sx={{ width: "80%" }}
                                    ml={8}
                                >
                                    <Skeleton height={8} />
                                    <Skeleton
                                        height={8}
                                        mt={6}
                                        width="70%"
                                        radius="xl"
                                    />
                                </Box>
                            </Flex>
                        </Box>
                    </Group>
                </Box>
            </Grid.Col>
            <Grid.Col md={4}>
                <Box
                    component="div"
                    sx={{
                        border: `1px solid rgba(0, 0, 0, 0.08)`,
                        borderRadius: 4,
                        padding: "16px 24px",
                        width: "100%",
                    }}
                >
                    <Skeleton height={8} width="50%" mb={12} />

                    <Flex mb={24}>
                        <Skeleton height={80} circle />
                        <Box component="div" sx={{ width: "80%" }} ml={8}>
                            <Skeleton height={8} width="70%" />
                            <Skeleton
                                height={6}
                                mt={8}
                                width="50%"
                                radius="xl"
                            />
                            <Flex justify={"flex-start"}>
                                <Skeleton
                                    height={6}
                                    mt={8}
                                    width="30%"
                                    radius="xl"
                                />
                                <Skeleton
                                    height={6}
                                    mt={8}
                                    width="30%"
                                    radius="xl"
                                    ml={16}
                                />
                            </Flex>
                        </Box>
                    </Flex>

                    <Flex mb={10}>
                        <Skeleton height={5} width="60%" mb={8} />
                        <Skeleton height={5} width="20%" mb={8} />
                    </Flex>
                    <Flex mb={10}>
                        <Skeleton height={5} width="60%" mb={8} />
                        <Skeleton height={5} width="20%" mb={8} />
                    </Flex>
                    <Flex mb={10}>
                        <Skeleton height={5} width="60%" mb={8} />
                        <Skeleton height={5} width="20%" mb={8} />
                    </Flex>

                    <Skeleton height={40} mt={6} radius="sm" />
                </Box>
            </Grid.Col>
        </Grid>
    );
};
