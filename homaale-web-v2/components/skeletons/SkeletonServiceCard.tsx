import { Box, Flex, Skeleton } from "@mantine/core";
import React from "react";

import { useEntityCardStyles } from "@/styles/components/EntityCardStyles";

export const SkeletonServiceCard = () => {
    const { classes } = useEntityCardStyles();
    return (
        <Box id={`task-card-${"id"}`} className={classes.root}>
            <Flex
                align={"flex-start"}
                direction={{ base: "column", md: "row" }}
                px={16}
            >
                <Box className={classes.image}>
                    <Skeleton height={120} />
                </Box>

                <Box style={{ width: "100%", marginLeft: 8 }}>
                    <Flex
                        justify={"space-between"}
                        align={"self-start"}
                        gap={20}
                    >
                        <Skeleton height={15} />
                        <Box
                            component="div"
                            sx={{ width: "100%", justifyContent: "flex-end" }}
                            className={classes.rightSection}
                        >
                            <Skeleton height={20} width={30} mr={15} />
                            <Skeleton height={20} width={30} />
                        </Box>
                    </Flex>
                    <Box className={classes.content} mb={20}>
                        <Skeleton height={10} width={"60%"} />
                        <Skeleton height={10} width={"30%"} my={10} />
                        <Skeleton height={10} width={"50%"} mt={20} />
                    </Box>
                </Box>
            </Flex>
            <Flex className={classes.bottomSection} gap={150} px={16}>
                <Skeleton height={10} />
                <Flex sx={{ width: "100%" }} gap={10}>
                    <Skeleton height={10} />
                    <Skeleton height={10} />
                </Flex>
            </Flex>
        </Box>
    );
};
