import {Box, Button, Grid, Image} from "@mantine/core";
import {format} from "date-fns";
import parse from "html-react-parser";
import type {GetStaticPaths, GetStaticProps} from "next";
import Link from "next/link";

import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import {useCareerDetailsStyles} from "@/styles/pages/CareerDetailsStyles";
import type {
    CareerDetailsData,
    CareerValueProps,
} from "@/types/CareerListProps";
import {axiosClient} from "@/utils/axiosClient";

const CareerDeatils = ({career}: { career: CareerDetailsData }) => {
    const {classes} = useCareerDetailsStyles();
    const {
        location,
        designation,
        description,
        title,
        no_of_opening,
        deadline,
    } = career ?? ({} as CareerDetailsData);
    return (
        <Layout
            title="Career"
            breadCrumbsItems={[{name: "career", href: "/career"}]}
            currentTitle={career?.title}
        >
            <Box className={classes.root}>
                <h2>{title}</h2>
                <h3>
                    Location:{"  "}
                    <span>{location}</span>
                </h3>
                <h3>
                    WorkType:{"  "}
                    <span>{designation}</span>
                </h3>
                <h3>
                    No. of Opening:{"  "}
                    <span> {no_of_opening}</span>
                </h3>
                {deadline && (
                    <h3>
                        Deadline:{"  "}
                        <span>{format(new Date(deadline), "PP")}</span>
                    </h3>
                )}
                <Grid mt={35}>
                    <Grid.Col md={8} mb={66}>
                        <h2>What’s the job?</h2>
                        {description ? <p>{parse(description)}</p> : ""}
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Image
                            className="career-image"
                            alt="career-image"
                            height={382}
                            width="100%"
                            src="/careerimages/careerdesc.png"
                        />
                    </Grid.Col>
                </Grid>
                <Box className={classes.body_wrapper} mt={66}>
                    <h2>What am I going to do?</h2>
                    <p>
                        Research partners, identify key players and keep track
                        of developments in the relevant markets, in order to
                        generate product and channel partnerships. Create a
                        systematic, process-driven approach to sourcing
                        partnerships and relationship management, which is based
                        on deep understanding of Cipher’s offering, business
                        needs and industry dynamics. Reach out to potential
                        partners, define value propositions based on tech
                        integrations and joint use cases, create presentations
                        and mockups, and work with internal teams (e.g. R&D,
                        product, legal, finance) to drive partnerships to
                        successful execution. Evaluate the financial and
                        non-financial benefits and risks of new partnerships,
                        and define clear partnership goals, go-to-market and key
                        KPIs. Collaborate with different teams to build and
                        maintain a pipeline of relationships with potential
                        partners, taking responsibility for the relationship
                        throughout all stages. Proactively track, report, and
                        optimize the performance of partnerships, including
                        identifying issues as they arise, assessing possible
                        solutions, and executing them. Help develop and lead
                        Cipher’s partnerships roadmap and strategy, including
                        with respect to API and other product integrations.
                    </p>
                    <h2>What are the qualifications?</h2>
                    <p>
                        Proactively track, report, and optimize the performance
                        of partnerships, including identifying issues as they
                        arise, assessing possible solutions, and executing them.
                        Help develop and lead Cipher’s partnerships roadmap and
                        strategy, including with respect to API and other
                        product integrations.
                    </p>
                    <Link
                        href={`/career/form?id=${career?.id}&name=${career?.title}`}
                    >
                        <Button variant="light" className="apply_Btn">
                            Apply
                        </Button>
                    </Link>
                </Box>
            </Box>
        </Layout>
    );
};

export default CareerDeatils;

export const getStaticPaths: GetStaticPaths = async () => {
    try {
        const {data: careerData} = await axiosClient.get(urls.carrer.list);
        const paths = careerData?.result?.map(
            ({id}: CareerValueProps["result"][0]) => ({
                params: {id: id.toString()},
            })
        );
        return {paths, fallback: true};
    } catch (error: any) {
        return {
            paths: [],
            fallback: true,
        };
    }
};

export const getStaticProps: GetStaticProps = async ({params}) => {
    try {
        const {data} = await axiosClient.get<CareerDetailsData>(
            `${urls.carrer.detail}${params?.id}/`
        );

        return {
            props: {
                career: data,
            },
            revalidate: 10,
        };
    } catch (error: any) {
        return {
            props: {
                career: {},
            },
            revalidate: 10,
        };
    }
};
