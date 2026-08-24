import { Flex, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

const ViewMore = ({ href }: { href: string }) => {
    return (
        <Link href={href}>
            <Flex>
                <Text mr={4}>View More</Text>
                <IconArrowRight size={20} stroke={1.75} />
            </Flex>
        </Link>
    );
};

export default ViewMore;
