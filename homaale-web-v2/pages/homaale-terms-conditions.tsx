import { Box } from "@mantine/core";
import urls from "constants/urls";
import parse from "html-react-parser";
import type { FC} from "react";
import { useEffect, useState } from "react";

import Layout from "@/components/Layout/Layout";
import { useTermsConditionsStyles } from "@/styles/pages/TermsConditionsStyles";
import { axiosClient } from "@/utils/axiosClient";

const TermsConditions: FC = () => {
    const { classes } = useTermsConditionsStyles();
    const [content, setContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await axiosClient.get<{ content: string }>(
                    urls.termsandconditions
                );
                setContent(data.content);
            } catch (err) {
                setError("Failed to load terms and conditions.");
            }
        };
        fetchContent();
    }, []); // Empty dependency array to fetch only on initial mount
    return (
        <Layout heading="Terms & Conditions" currentTitle="terms-conditions">
            {error ? (
                <Box mt={48} className={classes.root}>
                    <p>{error}</p>
                </Box>
            ) : (
                <Box className={classes.root} mt={48}>
                    {content ? parse(content) : <p>Loading...</p>}
                </Box>
            )}
        </Layout>
    );
};
export default TermsConditions;
