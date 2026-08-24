import { Box, Container, Flex, Grid } from "@mantine/core";
import type { NextPage } from "next";
import Image from "next/image";

import AboutCard from "@/components/Aboutus/AboutCard";
import Layout from "@/components/Layout/Layout";
import { aboutCardContent } from "@/staticData/aboutcard";
import { useAboutUsStyles } from "@/styles/pages/AboutUsStyles";

const AboutUs: NextPage = () => {
    const { classes } = useAboutUsStyles();
    return (
        <Layout heading="About Us" currentTitle="about-us">
            <Container size={1577}>
                <Flex justify={"center"} align={"start"} direction={"column"}>
                    <div className={classes.wrapper}>
                        <Image
                            className={classes.image}
                            src="/images/aboutusimages/aboutus1.png"
                            alt="Your Image"
                            width={1577}
                            height={468}
                        />
                        <div className={classes.textoverlay}>
                            BRIDGING GAP BETWEEN THE INDIVIDUALS FOR GROWTH.
                        </div>
                    </div>
                    <Container size={1326}>
                        <Flex
                            gap={44}
                            direction={{ base: "column", xs: "row" }}
                        >
                            <Box
                                sx={{
                                    position: "relative",
                                    display: "inlineBlock",
                                }}
                                className={classes.contentwrapper}
                            >
                                <Image
                                    className={classes.cardimage}
                                    src="/images/aboutusimages/about.png"
                                    alt=""
                                    width={534}
                                    height={346}
                                    style={{
                                        objectFit: "fill",
                                        borderRadius: 4,
                                    }}
                                />
                                <Flex
                                    className={classes.descdiv}
                                    justify={"center"}
                                    align={"center"}
                                >
                                    About Homaale
                                </Flex>
                            </Box>

                            <Box>
                                <h1 className={classes.heading}>
                                    We are an on demand app that connects
                                    customers with service providers.
                                </h1>
                                <p className={classes.description}>
                                    Homaale is a platform incepted with the idea
                                    of bridging the gap between individuals who
                                    need a certain task completed, and those who
                                    have the skills to get the very task
                                    completed within a given timeframe. The
                                    tasks one might need may range from anything
                                    between getting your room painted, or
                                    getting an entire software developed. In
                                    today’s fast paced environment, one might
                                    not have the time to manage their household
                                    errands as they might want to, or you might
                                    be an entrepreneur wanting to finish your
                                    project on a deadline, and this is exactly
                                    where Homaale is going to be your trusted
                                    partner for everything. Go through the app,
                                    search for the services you want to avail,
                                    and in a few clicks, your task will be
                                    completed within your desired timeframe.
                                </p>
                            </Box>
                        </Flex>
                        <Flex
                            gap={44}
                            mt={32}
                            mb={60}
                            direction={{ base: "column", xs: "row" }}
                        >
                            <Box>
                                <h1 className={classes.heading}>Our Purpose</h1>
                                <p className={classes.description}>
                                    Our Purpose is to serve the community by
                                    providing everyone the platform to showcase
                                    their skills, talents, and minimise the
                                    stress of job hunting for every individual.
                                    We cater to people from all walks of life,
                                    and we intend to be the best at what we do.
                                    We have diverse service categories to choose
                                    from. Go through our app, search for the
                                    services you need or want to provide,
                                    negotiate your task rate and get that work
                                    done.
                                </p>
                            </Box>
                            <Box
                                sx={{
                                    position: "relative",
                                    display: "inlineBlock",
                                }}
                                className={classes.contentwrapper}
                            >
                                <Image
                                    className={classes.cardimage}
                                    src="/images/aboutusimages/about1.png"
                                    alt=""
                                    width={534}
                                    height={346}
                                    style={{
                                        objectFit: "fill",
                                        borderRadius: 4,
                                    }}
                                />
                                <Flex
                                    className={classes.descdiv}
                                    justify={"center"}
                                    align={"center"}
                                >
                                    Our Purpose
                                </Flex>
                            </Box>
                        </Flex>
                        <h4>Our Scope</h4>
                        <Grid mb={120}>
                            {aboutCardContent &&
                                aboutCardContent.map((about) => {
                                    return (
                                        <Grid.Col md={4} key={about.id} mt={24}>
                                            <AboutCard
                                                cardImage={about.cardImage}
                                                cardTitle={about.cardTitle}
                                                cardDescription={
                                                    about.cardDescription
                                                }
                                            />
                                        </Grid.Col>
                                    );
                                })}
                        </Grid>
                        <h4>Our economic growth </h4>
                        <p className={classes.description}>
                            With the minimum charge for every task we take, our
                            vision is to provide a platform for all to make
                            their everyday work easier. The objective of Homaale
                            is to provide the businesses a platform to expand
                            their client reach in an easy way. Bearing in mind
                            that finding clients in this competitive world is
                            difficult, we believe that our platform will be a
                            solution to achieve your desired outcomes and boost
                            your economy.
                        </p>
                        <iframe
                            width="100%"
                            height={529}
                            src="https://www.youtube.com/embed/bJpC9AD-n7U"
                            style={{
                                border: "none",
                                borderRadius: 4,
                                marginTop: 32,
                            }}
                        ></iframe>
                    </Container>
                </Flex>
            </Container>
        </Layout>
    );
};

export default AboutUs;
