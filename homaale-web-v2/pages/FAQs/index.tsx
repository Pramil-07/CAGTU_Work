import {
    Accordion,
    Box,
    Flex,
    Grid,
    Tabs,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useQuery } from '@tanstack/react-query';
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { FaqsQuestions } from "@/components/FAQS/faqsquestions";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import { useFAQSStyles } from "@/styles/pages/FAQsStyles";
import type { FAQTopicValueProps, FAQValueProps } from "@/types/FaqsProps";
import { axiosClient } from "@/utils/axiosClient";

const fetchFaqData = async (): Promise<FAQValueProps> => {
    const { data } = await axiosClient.get(`${urls.support.faq}`);
    return data || { result: [] };
};

const fetchFaqTopicData = async (): Promise<FAQTopicValueProps> => {
    const { data } = await axiosClient.get(`${urls.support.faqTopic}`);
    return data || { result: [] };
};

const FAQ = () => {
    const { classes } = useFAQSStyles();
    const theme = useMantineTheme();
    const [tabId, setTabId] = useState<null | string>("0");
    const router = useRouter();

    const { data: faqData = { result: [] }, error: faqError } = useQuery(['faqData'], fetchFaqData);
    const { data: faqTopicData = { result: [] }, error: faqTopicError } = useQuery(['faqTopicData'], fetchFaqTopicData);


    // if (faqLoading || faqTopicLoading) return <div>Loading...</div>;
    if (faqError || faqTopicError) return <div>Error loading data</div>;

    return (
        <Layout currentTitle={"FAQs"} heading={"Frequently Asked Questions"} breadCrumbsItems={[{name:"Help & Support",href:""}]}>
            <Box mt={50}>
                <h2
                    style={{
                        color:
                            theme.colorScheme === "dark"
                                ? theme.colors.gray[5]
                                : theme.colors.gray[8],
                    }}
                >
                    Mostly Asked FAQs
                </h2>
                <Grid mb={80} mt={22}>
                    {Array.isArray(faqData?.result) && faqData.result.length > 0 ? (
                        faqData.result.map((item, index) => (
                            <Grid.Col key={index} md={6}>
                                <FaqsQuestions faqs={item} />
                            </Grid.Col>
                        ))
                    ) : (
                        <Text>No FAQs available at the moment</Text>
                    )}
                </Grid>
                <h2>Topics</h2>
                <Box mt={50}>
                    <Tabs
                        value={tabId}
                        onTabChange={setTabId}
                        orientation="vertical"
                        className={classes.topic}
                        unstyled
                    >
                        <Tabs.List mt={24} mb={24}>
                            {Array.isArray(faqTopicData?.result) && faqTopicData?.result?.length > 0
                                ? faqTopicData?.result?.map((value, index) => {
                                    return (
                                        <Tabs.Tab
                                            value={index.toString()}
                                            key={index}
                                            className={classes.tabs_list}
                                        >
                                            <Text component="h3">
                                                {value?.topic}
                                            </Text>
                                        </Tabs.Tab>
                                    );
                                })
                                : ( <Text>No FAQ topics available</Text> )}
                        </Tabs.List>
                        {faqTopicData?.result.map((value, index) => {
                            return (
                                <Tabs.Panel
                                    key={index}
                                    className={classes.tabs_content}
                                    value={index.toString()}
                                >
                                    {faqData?.result
                                        ?.filter(
                                            (item) =>
                                                item.topic.topic === value.topic
                                        )
                                        .map((value, index) => (
                                            <Accordion key={index}>
                                                <Accordion.Item
                                                    mb={20}
                                                    value={value?.title}
                                                    className="accordion_item"
                                                >
                                                    <Accordion.Control
                                                        p={0}
                                                        mb={24}
                                                        className="control"
                                                    >
                                                        <h4>{value?.title}</h4>
                                                    </Accordion.Control>
                                                    {value?.content && (
                                                        <Accordion.Panel>
                                                            <p
                                                                style={{
                                                                    marginBottom: 16,
                                                                }}
                                                            >
                                                                {parse(
                                                                    value?.content
                                                                )}
                                                            </p>
                                                        </Accordion.Panel>
                                                    )}
                                                </Accordion.Item>
                                            </Accordion>
                                        ))}
                                </Tabs.Panel>
                            );
                        })}
                    </Tabs>
                </Box>
                <Box mt={80}>
                    <h2
                        style={{
                            color:
                                theme.colorScheme === "dark"
                                    ? theme.colors.gray[5]
                                    : theme.colors.gray[8],
                        }}
                    >
                        Learn More About Homaale
                    </h2>
                    <iframe
                        width="100%"
                        height={600}
                        src="https://www.youtube.com/embed/bJpC9AD-n7U"
                        style={{
                            border: "none",
                            borderRadius: 4,
                            marginTop: 32,
                        }}
                    ></iframe>
                </Box>
            </Box>
            {!router.query.mobile_app ? (
                <Grid mt={80} className={classes.description}>
                    <Grid.Col md={6}>
                        <h3>Create A Support Ticket</h3>
                        <h4>Didn&apos;t find answers you were looking for?</h4>
                        <Link href="/contact-us">
                            <Flex
                                align={"center"}
                                gap={15}
                                className="contact-us"
                                justify={"center"}
                            >
                                <h4>Contact Us</h4>
                                <IconArrowNarrowRight
                                    size={24}
                                    color={
                                        theme.colorScheme === "dark"
                                            ? theme.colors.gray[5]
                                            : `${theme.colors.white[0]}`
                                    }
                                />
                            </Flex>
                        </Link>
                    </Grid.Col>
                    <Image
                        height={506}
                        width={646}
                        src="/FAQS/faqs.png"
                        alt="image-faqs"
                        className="image-faq"
                    />
                </Grid>
            ) : (
                ""
            )}
        </Layout>
    );
};

export default FAQ;
