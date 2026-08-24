import { Alert, Box, Flex } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { Filters } from "@/components/common/Filters";
import Layout from "@/components/Layout/Layout";
import ThreeCardsServicesBlock from "@/components/ThreeCardsServicesBlock";
import ThreeCardsTaskersBlock from "@/components/ThreeCardsTaskers";
import urls from "@/constants/urls";
import { useAppSelector } from "@/hooks";
import type { SearchProps } from "@/types/SearchProps";
import { axiosClient } from "@/utils/axiosClient";

const Search = () => {
    const { search } = useAppSelector((state) => state.filterReducer);

    const query = search.split("=").pop();
    const { data } = useQuery(["search", search], async () => {
        const { data } = await axiosClient.get<SearchProps>(
            `${urls.search}?q=${query}`
        );
        return data;
    });

    return (
        <Layout currentTitle={"search"}>
            <Filters search />
            <Box mt={24}>
                {data && data?.task?.length > 0 ? (
                    <ThreeCardsServicesBlock
                        data={data?.task}
                        sectionTitle="Tasks"
                        href={`/tasks?search=${query}`}
                    />
                ) : (
                    <Box mb={15}>
                        <h4>Tasks</h4>
                        <Alert color="blue">
                            <Flex gap={10} justify={"flex-start"}>
                                <IconAlertCircle size="1.2rem" />
                                {`Tasks search for "${query}" not found`}
                            </Flex>
                        </Alert>
                    </Box>
                )}
                {data && data?.service?.length > 0 ? (
                    <ThreeCardsServicesBlock
                        data={data?.service}
                        sectionTitle="Services"
                        href={`/services?search=${query}`}
                    />
                ) : (
                    <Box mb={15}>
                        <h4>Services</h4>
                        <Alert color="blue">
                            <Flex gap={10} justify={"flex-start"}>
                                <IconAlertCircle size="1.2rem" />
                                {`Services search for "${query}" not found`}
                            </Flex>
                        </Alert>
                    </Box>
                )}
                {data && data?.tasker?.length > 0 ? (
                    <ThreeCardsTaskersBlock
                        data={data?.tasker}
                        sectionTitle="Taskers"
                        href={`/tasker?search=${query}`}
                    />
                ) : (
                    <Box mb={15}>
                        <h4>Taskers</h4>
                        <Alert color="blue">
                            <Flex gap={10} justify={"flex-start"}>
                                <IconAlertCircle size="1.2rem" />
                                {`Taskers search for "${query}" not found`}
                            </Flex>
                        </Alert>
                    </Box>
                )}
            </Box>
        </Layout>
    );
};

export default Search;
