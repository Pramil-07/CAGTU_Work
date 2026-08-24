import { Box } from "@mantine/core";
import urls from "constants/urls";
import parse from "html-react-parser";
import { useEffect, useState } from "react";

import Layout from "@/components/Layout/Layout";
import { useDataDeletionStyles } from "@/styles/pages/DataDeletionStyles";
import { axiosClient } from "@/utils/axiosClient";

const DataDeletionPolicy = () => {
    const { classes } = useDataDeletionStyles();
    const [content, setContent] = useState<string>(""); // State to hold the fetched content
    const [error, setError] = useState<string | null>(null); // State to handle errors

    useEffect(() => {
        // Fetch data after the component mounts
        const fetchData = async () => {
            try {
                const { data } = await axiosClient.get<{ content: string }>(urls.dataDeletion);
                setContent(data.content); // Set the content from the fetched data
            } catch (error) {
                console.error("Failed to fetch data deletion policy:", error);
                setError("Failed to load data deletion policy.");
            }
        };

        fetchData();
    }, []); // Empty dependency array ensures this only runs once on mount

    return (
        <Layout heading="Data Deletion Policy" currentTitle="data-deletion-policy">
            <Box className={classes.root}>
                {error ? (
                    <Box>{error}</Box> // Display error message if fetch fails
                ) : (
                    <Box>{parse(content)}</Box> // Display fetched content if available
                )}
            </Box>
        </Layout>
    );
};

export default DataDeletionPolicy;
