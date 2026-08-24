import {Flex, Grid} from "@mantine/core";
import React from "react";

import type {ExploreTaskersProps} from "@/types/ExploreTaskersProps";

import {TaskerCard} from "./common/TaskerCard";
import ViewMore from "./common/ViewMore";

const ThreeCardsTaskersBlock = ({
                                    data,
                                    sectionTitle,
                                    href,
                                }: {
    data: ExploreTaskersProps["top_tasker"];
    sectionTitle: string;
    href: string;
}) => {
    console.log("tasker data", data)
    return (
        <>
            <Flex
                mb={10}
                align={{base: "flex-start", sm: "center"}}
                direction={{base: "column", sm: "row"}}
            >
                <h4>{sectionTitle}</h4>
                <ViewMore href={href}/>
            </Flex>
            <Grid mb={24}>
                {data?.map((item, index) => (
                    <Grid.Col span={12} md={6} lg={6} xl={4} key={index}>
                        <TaskerCard tasker={item}/>
                    </Grid.Col>
                ))}
            </Grid>
        </>
    );
};

export default ThreeCardsTaskersBlock;
