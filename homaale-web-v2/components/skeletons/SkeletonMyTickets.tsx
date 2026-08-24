import { Box, Flex, Skeleton } from "@mantine/core";
import React from "react";

import { useSupportStyles } from "@/styles/pages/SupportStyles";

const SkeletonMyTickets = () => {
    const { classes } = useSupportStyles();

    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <Flex
                    className={classes.myTickets}
                    align={"flex-start"}
                    mb={24}
                    key={index}
                >
                    <Flex justify={"start"}>
                        <Skeleton height={100} width={100} />

                        <Box ml={16}>
                            <Skeleton height={8} width={200} mb={12} />
                            <Skeleton height={8} width={180} mb={12} />
                            <Skeleton height={8} width={80} mb={12} />
                        </Box>
                    </Flex>
                    <Skeleton height={8} width={50} mb={12} />
                </Flex>
            ))}
        </>
    );
};

export default SkeletonMyTickets;
