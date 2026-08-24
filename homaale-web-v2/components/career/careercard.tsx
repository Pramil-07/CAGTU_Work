import { Box, Flex } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

import { useCareerCardStyles } from "@/styles/components/CareerCardStyles";
import type { CareerValueProps } from "@/types/CareerListProps";

export const CareerCard = ({
    items,
}: {
    items: CareerValueProps["result"][0];
}) => {
    const { classes } = useCareerCardStyles();
    return (
        <Link href={`/career/${items?.id}`}>
            <Box className={classes.root}>
                <h4>{items.title}</h4>
                <Flex gap={16} mt={32} className="apply_section">
                    <p>Apply Here</p>
                    <IconArrowRight size={16} className="right_pointed_arrow" />
                </Flex>
            </Box>
        </Link>
    );
};
