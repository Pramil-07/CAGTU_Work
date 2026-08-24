import { Box, Flex, useMantineTheme } from "@mantine/core";
import { IconChecks } from "@tabler/icons-react";
import React from "react";

import { useCareerListingStyles } from "@/styles/components/CareerListingStyles";

export type CareerDescProps = {
    list: string[];
};

export const Careerlisting = ({ list }: CareerDescProps) => {
    const { classes } = useCareerListingStyles();
    const theme = useMantineTheme()
    return (
        <Box className={classes.listingwrapper}>
            <ul>
                {list.map((item, index) => (
                    <li key={index}>
                        <Flex justify={"center"} className={classes.body}>
                            <IconChecks color={theme.colors.brand[4]} size={20} />
                        </Flex>
                        <p>{item}</p>
                    </li>
                ))}
            </ul>
        </Box>
    );
};
