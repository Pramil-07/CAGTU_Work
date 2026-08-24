import { Alert, Box, Flex, Grid, Tabs, useMantineTheme } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import {
    IconArrowNarrowRight,
    IconClipboardCheck,
    IconFileDescription,
    IconReportMoney,
    IconUserCheck,
    IconUsers,
} from "@tabler/icons-react";
import type { GetStaticProps } from "next";
import Image from "next/image";

import { CareerCard } from "@/components/career/careercard";
import { HiringComponent } from "@/components/career/hiringcomponent";
import { Careerlisting } from "@/components/common/form/careerlisting";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import { useCareerStyles } from "@/styles/pages/CareerStyles";
import type { CareerValueProps } from "@/types/CareerListProps";
import { axiosClient } from "@/utils/axiosClient";
import { useBrandData } from "@/brand/BrandContext";
import {useEffect, useState} from "react";

const Career = () => {
    const [scroll, scrollTo] = useWindowScroll();
    const { classes } = useCareerStyles();
    const theme = useMantineTheme();
    const {brandData}= useBrandData();
    const [careerData, setCareerData] = useState<CareerValueProps | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCareerData = async () => {
            setIsLoading(true);
            try {
                const { data } = await axiosClient.get<CareerValueProps>(urls.carrer.list);
                setCareerData(data);
            } catch (err: any) {
                console.error('Error fetching career data:', err);
                setCareerData(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCareerData();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    const { result } = careerData ?? { result: [] };

    return (
        <Layout heading="Career" currentTitle={"career"}>
            <Grid className={classes.firstboxwrapper}>
                <Grid.Col md={6}>
                    <h3>Find the career you deserve</h3>
                    <h4>Discover your career opportunities with {brandData.name}!</h4>
                    <p>
                        Creating job opportunities for you to grow in a
                        competitive world. {brandData.name} is always ready to welcome
                        talents who can help us grow and achieve higher
                        milestones
                    </p>
                    <Flex
                        align={"center"}
                        gap={15}
                        className="job_wrapper"
                        onClick={() => scrollTo({ y: 1400 })}
                    >
                        <h4>View Job Opening</h4>
                        <IconArrowNarrowRight
                            size={24}
                            color={`${theme.colors.white[0]}`}
                        />
                    </Flex>
                </Grid.Col>
                <Image
                    src="/images/logo/Image.png"
                    alt="category-img"
                    height={471}
                    width={761}
                    className="career_first_image"
                />
            </Grid>
            <Grid px={12} mb={120} mt={100} className={classes.expert_section}>
                <h1>Work with experts.</h1>
                <Image
                    className="career_image"
                    src="/careerimages/career1.svg"
                    height={316}
                    width={629}
                    alt="career_image"
                    style={{ objectFit: "cover", borderRadius: 4 }}
                />
                <Grid.Col
                    md={4}
                    style={{
                        fontSize: 24,
                        fontWeight: 400,
                        color: `${theme.colors.gray[6]}`,
                    }}
                >
                    Work in an environment of experts and grow your career with
                    them. Boost your skills and excel with us.
                </Grid.Col>
            </Grid>
            <h1
                style={{
                    fontWeight: 600,
                    fontSize: 24,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.gray[5]
                            : theme.colors.gray[8],
                    marginTop: 100,
                    marginBottom: 44,
                }}
            >
                How We Hire
            </h1>
            <Box>
                <Flex
                    gap={96}
                    mb={100}
                    direction={{ base: "column", md: "row" }}
                    align={"flex-start"}
                >
                    <HiringComponent
                        title={"Application Submission"}
                        desc={
                            "Go through the job description and apply for the best suited vacancy for you."
                        }
                        icon={IconFileDescription}
                    />
                    <HiringComponent
                        title={"Application Review"}
                        desc={
                            "After we have received the application we review your documents and the description provided by you."
                        }
                        icon={IconClipboardCheck}
                    />
                    <HiringComponent
                        title={"Interview"}
                        desc={
                            "As per the job profile, you shall go through different rounds of interview."
                        }
                        icon={IconUsers}
                    />
                    <HiringComponent
                        title={"Selection"}
                        desc={
                            "The best candidate for the job and company shall be selected."
                        }
                        icon={IconUserCheck}
                    />
                    <HiringComponent
                        title={"Offer"}
                        desc={
                            "The selected candidate will receive the offer letter from us."
                        }
                        icon={IconReportMoney}
                    />
                </Flex>
            </Box>

            <Grid>
                <Grid.Col md={4} className={classes.benefit_section}>
                    <h2>Benifits & Perks</h2>
                    <p>
                        “{brandData.name} is always ready to welcome talents who can help
                        us grow and achieve higher milestones.”
                    </p>
                </Grid.Col>
                <Grid.Col md={4}>
                    <Careerlisting
                        list={[
                            "Competitive salary",
                            "Working Environment",
                            "Medical Insurance",
                            "Paid Leaves",
                        ]}
                    />
                </Grid.Col>
                <Grid.Col md={4}>
                    <Careerlisting
                        list={[
                            "Maternity Leaves",
                            "Social Security Fund",
                            "5 working days",
                        ]}
                    />
                </Grid.Col>
            </Grid>
            <section className={classes.jobopening}>
                <h2>Job Openings</h2>
                <Tabs keepMounted={false} defaultValue="All Category">
                    <Tabs.List className={classes.tab} mb={40}>
                        <Tabs.Tab value="All Category">
                            <h5>All Category</h5>
                        </Tabs.Tab>
                        <Tabs.Tab value="Design">
                            <h5>Design</h5>
                        </Tabs.Tab>
                        <Tabs.Tab value="Technology">
                            <h5>Technology</h5>
                        </Tabs.Tab>
                        <Tabs.Tab value="Business">
                            <h5>Business</h5>
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="All Category">
                        <Grid>
                            {result && result.length > 0 ? (
                                result?.map((items, key) => (
                                    <Grid.Col md={3} key={key}>
                                        <CareerCard items={items} />
                                    </Grid.Col>
                                ))
                            ) : (
                                <Alert>We currently have no openings!</Alert>
                            )}
                        </Grid>
                    </Tabs.Panel>
                    <Tabs.Panel value="Design">
                        <Alert>We currently have no openings!</Alert>
                    </Tabs.Panel>
                    <Tabs.Panel value="Technology">
                        <Alert>We currently have no openings!</Alert>
                    </Tabs.Panel>
                    <Tabs.Panel value="Business">
                        <Alert>We currently have no openings!</Alert>
                    </Tabs.Panel>
                </Tabs>
            </section>
        </Layout>
    );
};

export default Career;
// export const getStaticProps: GetStaticProps = async () => {
//     try {
//         const { data: careerData } = await axiosClient.get(urls.carrer.list);
//         if (careerData.error) throw new Error(careerData.error.message);
//         return {
//             props: {
//                 careerData,
//             },
//             revalidate: 10,
//         };
//     } catch (err: any) {
//         return {
//             props: {
//                 careerData: [],
//             },
//             revalidate: 10,
//         };
//     }
// };
