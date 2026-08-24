import {Box, Flex, Grid, useMantineTheme} from "@mantine/core";
import {IconArrowRight, IconChecklist, IconSearch, IconUserSearch,} from "@tabler/icons-react";
import type {NextPage} from "next";
import Image from "next/image";
import {useRouter} from "next/router";

import UserInfo from "@/components/common/UserInfo";
import Layout from "@/components/Layout/Layout";

import {useUserStatus} from "@/hooks/useUserStatus";
import {useMerchantStyles} from "@/styles/pages/MerchantStyles";
import {PostApply} from "@/components/merchant/PostApply";

const Clients: NextPage = () => {
    const { classes } = useMerchantStyles();
    const theme = useMantineTheme();
    const router = useRouter();

    const { checkStatus } = useUserStatus();

    return (
        <Layout currentTitle={"clients"}>
            {/* Find Career section  */}
            <section id="info_wrapper">
                <Flex gap={30} mb={80} className={classes.root}>
                    <div className="info_wrapper">
                        <h1>Find The Career You Deserve</h1>
                        <h2>CONNECTING YOU TO THE RIGHT SERVICE PROVIDERS</h2>
                        <h3>Hire the right professional for your tasks</h3>
                        <UserInfo
                            is_requested
                            icon={
                                <IconChecklist
                                    size={18}
                                    color={`${theme.colors.brand[3]}`}
                                />
                            }
                            info="Post a task"
                        />
                        <UserInfo
                            icon={
                                <IconSearch
                                    size={18}
                                    color={`${theme.colors.brand[3]}`}
                                />
                            }
                            info="Explore Services"
                            link="/explore/services"
                        />
                        <UserInfo
                            icon={
                                <IconUserSearch
                                    size={18}
                                    color={`${theme.colors.brand[3]}`}
                                />
                            }
                            info="Find Service Providers"
                            link="/explore/taskers"
                        />
                    </div>
                    <Image
                        src="/clients/client2.png"
                        width={762}
                        height={509}
                        alt="image-merchant"
                        className="first_merchant_image"
                    />
                </Flex>
            </section>
            {/*Post Task Section */}
            <section id="service_provider">
                <Flex
                    gap={32}
                    justify={"center"}
                    align={"center"}
                    className={classes.service_provider}
                    mb={80}
                >
                    <Image
                        src="/clients/client1.png"
                        width={692}
                        height={579}
                        alt="image-merchant"
                        className="second_merchant_image"
                    />
                    <div className="service_wrapper">
                        <h3>Post a task</h3>
                        <p>
                            Create a task that you need service on along with
                            the required details and images. Mention a fair
                            budget for it and post it. After you get applicants
                            for your task, view their profile and choose the
                            best one for you .Once the booking is confirmed,
                            make the payment and voila!!, the service provider
                            will work as per the details that you&apos;ve
                            provided.
                        </p>
                        <Box
                            className="wrapper_link"
                            onClick={() => {
                                if (checkStatus("kyc")) {
                                    router.push(
                                        {
                                            pathname: "/post/entity",
                                            query: {
                                                is_requested: true,
                                            },
                                        },
                                        "/post/entity"
                                    );
                                }
                            }}
                        >
                            Post a task
                            <IconArrowRight size={24} />
                        </Box>
                    </div>
                </Flex>
            </section>
            {/* Explore and Find Providers Section */}
            <section id="explore_find_section">
                <Grid mb={80}>
                    <Grid.Col md={6}>
                        <PostApply
                            link="/explore/services"
                            image="/merchant/merchant3.png"
                            title="Find desired services"
                            button="Explore services"
                            description="You can also explore the services and find the best one for you and negotiate on the price (if mentioned negotiable).Exploring and finding the services has never been this easy  as you can search and filter the services by budget, location and many more."
                        />
                    </Grid.Col>
                    <Grid.Col md={6}>
                        <PostApply
                            image="/merchant/merchant4.png"
                            button="Find providers"
                            link="/explore/taskers"
                            title="Hire services providers"
                            description="You can also directly look for the service providers depending upon the type of service you need you can always choose to hire a service provider viewing their profile, reviews, experiences and the service they provide."
                        />
                    </Grid.Col>
                </Grid>
            </section>
            {/* Content section */}
            <section id="content_section">
                <Box mt={80}>
                    <h2>Booking for services through Homaale.</h2>
                    <iframe
                        width="100%"
                        height={600}
                        src="https://www.youtube.com/embed/zLWm3KfaYSc"
                        style={{
                            border: "none",
                            borderRadius: 4,
                            marginTop: 32,
                        }}
                    ></iframe>
                </Box>
            </section>
        </Layout>
    );
};

export default Clients;
