import {Box, Flex, Grid, Space, useMantineTheme} from "@mantine/core";
import {IconBuildingStore, IconUsers} from "@tabler/icons-react";
import type {NextPage} from "next";
import Image from "next/image";

import UserInfo from "@/components/common/UserInfo";
import {useMerchantStyles} from "@/styles/pages/MerchantStyles";
import {PostApply} from "@/components/merchant/PostApply";


const Merchant: NextPage = () => {
    const {classes} = useMerchantStyles();
    const theme = useMantineTheme();
    return (
        <div>
            {/* Explore section  */}
            <section id="info_wrapper">
                <Flex gap={30} mb={80} className={classes.root}>
                    <div className="info_wrapper">
                        <h1>Get Started As A Merchant</h1>
                        <h2>
                            EXPLORE THE OPPURTUNITIES TO BLOOM YOUR BUSINESS
                        </h2>
                        <h3>Become a service provider in homaale</h3>
                        <UserInfo
                            icon={
                                <IconUsers
                                    size={18}
                                    color={`${theme.colors.brand[3]}`}
                                />
                            }
                            info="Join as an Individual/ Freelancer"
                            no_redirect
                        />
                        <UserInfo
                            icon={
                                <IconBuildingStore
                                    size={18}
                                    color={`${theme.colors.brand[3]}`}
                                />
                            }
                            info="Join as an Organization/ Merchant"
                            link="/merchantRegistration"
                        />
                    </div>
                    <Image
                        src="/merchant/merchant1.png"
                        width={762}
                        height={509}
                        alt="image-merchant"
                        className="first_merchant_image"
                    />
                </Flex>
            </section>
            {/* Service Provider Section */}
            <section id="service_provider">
                <Flex
                    gap={32}
                    justify={"center"}
                    align={"center"}
                    className={classes.service_provider}
                    mb={80}
                >
                    <Image
                        src="/merchant/merchant2.png"
                        width={692}
                        height={579}
                        alt="image-merchant"
                        className="second_merchant_image"
                    />
                    <div className="service_wrapper">
                        <h3>Starting as a service provider</h3>
                        <p>
                            A service provider can be an individual who chooses
                            to put forward their skills in our platform to earn
                            some stipend and experiences or an organisation who
                            signed up as a service provider to prosper their
                            business.
                        </p>
                        <Space h="md"/>
                        <p>
                            For the legal and security concerns you should fill
                            up your profile and get your KYC verified to book or
                            apply for any task on Homaale.
                        </p>
                    </div>
                </Flex>
            </section>
            {/* Post and Apply Section */}
            <section id="post_apply">
                <Grid mb={80}>
                    <Grid.Col md={6}>
                        <PostApply
                            is_requested={false}
                            image="/merchant/merchant3.png"
                            title="Post a Service"
                            button="Post your service"
                            description="Post a service you have expertise on. Put up a price as per your requirement on the project, or on an hourly basis. You can also add images of your experiences and service you provide for the better understanding of your clients. Once you complete filling up all the details and post it. Your service will be visible to all."
                        />
                    </Grid.Col>
                    <Grid.Col md={6} style={{display: "flex"}}>
                        <PostApply
                            is_requested
                            image="/merchant/merchant4.png"
                            button="Apply a task"
                            title="Apply for a task"
                            link="/tasks"
                            description="You can explore the tasks and depending upon the services you provide you can apply for the task feasible for you as per the detail provided in the task. You can also communicate with the client for more information regarding the tasks after you've applied for it."
                        />
                    </Grid.Col>
                </Grid>
            </section>
            {/* Content section */}
            <section id="content_section">
                <Box mt={80}>
                    <h2>How to earn money as a professional.</h2>
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
            </section>
        </div>
    );
};

export default Merchant;
