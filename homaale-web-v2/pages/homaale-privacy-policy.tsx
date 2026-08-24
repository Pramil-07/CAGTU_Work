import { useEffect, useState } from "react";
import { Box } from "@mantine/core";
import urls from "constants/urls";
import parse from "html-react-parser";
import Layout from "@/components/Layout/Layout";
import { usePrivacyPolicyStyles } from "@/styles/pages/PrivacyPolicyStyles";
import { axiosClient } from "@/utils/axiosClient";

const PrivacyPolicy = () => {
    const { classes } = usePrivacyPolicyStyles();
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        const fetchPrivacyPolicy = async () => {
            try {
                const { data } = await axiosClient.get<{ content: string }>(
                    urls.privacyPolicy
                );
                setContent(data.content);
            } catch (error) {
                console.error("Error fetching privacy policy:", error);
                setContent(""); // Handle the error case if needed
            }
        };

        fetchPrivacyPolicy();
    }, []); // Empty dependency array means this effect runs only once when the component mounts

    return (
        <Layout heading="Privacy Policy" currentTitle="privacy-policy">
            {content && (
                <Box className={classes.root} mt={48}>
                    {parse(`${content}`)}
                </Box>
            )}
        </Layout>
    );
};

export default PrivacyPolicy;
