import { Flex, Grid } from "@mantine/core";
import React from "react";

import type { ExploreServicesProps } from "@/types/ExploreServicesProps";

import { ServiceCard } from "./cards/ServiceCard";
import ViewMore from "./common/ViewMore";

const ThreeCardsServicesBlock = ({
    data,
    sectionTitle,
    href,
}: {
    data: ExploreServicesProps["mostly_booked"];
    sectionTitle: string;
    href: string;
}) => {
    return (
        <>
            <Flex
                mb={10}
                align={{ base: "flex-start", sm: "center" }}
                direction={{ base: "column", sm: "row" }}
            >
                <h4>{sectionTitle}</h4>
                <ViewMore href={href} />
            </Flex>
            <Grid mb={24}>
                {data?.map((item, index) => (
                    <Grid.Col span={12} md={6} lg={6} xl={4} key={index}>
                        <ServiceCard service={item} />
                    </Grid.Col>
                ))}
            </Grid>
        </>
    );
};

export default ThreeCardsServicesBlock;
