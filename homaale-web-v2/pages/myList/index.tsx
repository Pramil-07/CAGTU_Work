import { AspectRatio, Container, Select, SelectItemProps, Title, useMantineTheme } from "@mantine/core";
import type { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { forwardRef, useEffect, useState } from "react";

import EntityListView from "@/components/EntityListView";
import EntityMapView from "@/components/EntityMapView";
import EntityLayout from "@/components/Layout/EntityLayout";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";

import { reset } from "@/features/utils/filterSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useGetAds } from "@/hooks/useGetAds";

import type { EntityServiceLisitngProps } from "@/types/EntityServiceLisitngProps";
import { axiosClient } from "@/utils/axiosClient";
import { advancedFilter, isLoggedIn, useDark } from "@/utils/helpers";
import { Explore, Tasks, Service } from "@/components/Dropdown/icon";
import { useUser } from "@/hooks/useUser";
import { Menu, Button, Text } from "@mantine/core";
import { SideNavbar } from "@/components/Layout/SideNavbar";
import CategorySidebar from "@/components/CategorySidebar/CategorySidebar";
import { useCategoryOptions } from "@/hooks/useCategoryOptions";
import { IconArrowDown } from "@tabler/icons";
import { IconArrowBarDown, IconArrowBarToDown, IconAward, IconChevronDown } from "@tabler/icons-react";
import theme from "tailwindcss/defaultTheme";
import { useSearchParams } from "next/navigation";
import { Tabs } from '@mantine/core';

// Constants for IDs
const TASKS_ID = 1;
const SERVICES_ID = 5;
const EXPLORE_ID = 0;
const MY_LIST = 2;

const Services: NextPage<{ servicesData: EntityServiceLisitngProps }> = ({ servicesData }) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [activeId, setActiveId] = useState(EXPLORE_ID); // Default "Explore" view
    const [isGrid, setIsGrid] = useState(true);
    const searchParams = useSearchParams();
    const theme = useMantineTheme();
    const is_dark= useDark()


    // State for EntityLayout type
    const [activeType, setActiveType] = useState<"task" | "service" | "booking" | "blogs" | "explore" | "My List">("My List");

    // State for tab value
    const [tabValue, setTabValue] = useState<string>("active");

    // Select data from store and API
    const { query } = useAppSelector((state) => state.filterReducer);

    // console.log("query data",query)
    const { radius, data } = useAppSelector((state) => state.locationReducer);
    const { data: ads } = useGetAds("/services?is_requested=null");

    const {data: user, error, isLoading} = useUser(); // Assuming useUser hook provides logged-in user's info

    const typeParams = searchParams.get("type");
    const statusParams = searchParams.get("status");
    const statusChoiceParams = searchParams.get("status_choice");

    // Reset filters if no search in query
    useEffect(() => {
        if (!router.query.search) {
            dispatch(reset());
        }
    }, [dispatch, router.query.search]);

    // Sync tabValue with query parameters on initial load or query change
    useEffect(() => {
        if (statusChoiceParams === "draft") {
            setTabValue("draft");
        } else if (statusParams === "True") {
            setTabValue("active");
        } else if (statusParams === "False") {
            setTabValue("inactive");
        } else {
            setTabValue("active"); // Default to "active" if no status or status_choice
        }
    }, [statusParams, statusChoiceParams]);

    const moreFilter = advancedFilter((router.query.options as string) ?? "");
    const [extendedQuery, setExtendedQuery] = useState("");

    useEffect(() => {
        if (typeParams === "task") {
            setActiveId(TASKS_ID);
            setActiveType("task");
        } else if (typeParams === "services") {
            setActiveId(SERVICES_ID);
            setActiveType("service");
        } else {
            setActiveId(MY_LIST);
            setActiveType("My List");
        }
    }, [typeParams]);

    // Construct extendedQuery with status or status_choice based on tab
    useEffect(() => {
        const userCreatedByFilter =
            activeId === MY_LIST && user?.id ? `&created_by=${user.id}` : "";
        let statusFilter = "";
        if (statusChoiceParams === "draft") {
            statusFilter = "&status_choice=draft";
        } else if (statusParams) {
            statusFilter = `&status=${statusParams}`;
        }

        const combinedQuery = `${query}&category=${router?.query?.category ?? ""}${moreFilter}${userCreatedByFilter}${statusFilter}`;
        setExtendedQuery(combinedQuery);
        setPage(1);
    }, [moreFilter, query, router?.query?.category, radius, data.latitude, data.longitude, activeId, user?.id, statusParams, statusChoiceParams]);

    // Update activeType based on activeId
    useEffect(() => {
        const type = activeId === TASKS_ID ? "task" : activeId === SERVICES_ID ? "service" : "explore";
        setActiveType(type as "service" | "explore" | "task");
    }, [activeId]); // Depend on activeId for automatic updates

    // Adjust filters based on activeId
    const ownerFilter = activeId === TASKS_ID ? `&created_by=${user?.id}` : activeId === SERVICES_ID ? `&created_by=${user?.id}` : `&created_by=${user?.id}`;

    const is_requested = activeId === TASKS_ID ? true : activeId === SERVICES_ID ? false : null;


    const handleTabChange = (value: string | null) => {
        const selectedId = parseInt(value ?? EXPLORE_ID.toString());
        setActiveId(selectedId);

        const type = selectedId === TASKS_ID ? "task" : selectedId === SERVICES_ID ? "service" : "explore";
        setActiveType(type as "service" | "explore" | "task");

        const newQuery = selectedId === TASKS_ID ? "?type=task" : selectedId === SERVICES_ID ? "?type=services" : "";
        router.push(`/myList${newQuery}`, undefined, {shallow: true});

    };


    const CustomSelectItem = forwardRef<HTMLDivElement, SelectItemProps & { icon?: JSX.Element }>(
        ({label, icon, ...others}, ref) => {
            return (
                <div ref={ref} {...others} style={{display: "flex", alignItems: "center"}}>
                    {icon}
                    <span>{label}</span>
                </div>
            );
        }
    );

    // if (isLoading) {
    //     return <div></div>;
    // }


    if (error) {
        return <div>Error fetching user data</div>;
    }

    CustomSelectItem.displayName = "CustomSelectItem";

    // Data options with icons
    const options = [
        {
            value: EXPLORE_ID.toString(), label: "Show Task/Services",
            icon: <Explore/>
        },
        {
            value: TASKS_ID.toString(),
            label: "Show Tasks",
            icon: <Tasks/>
        },
        {
            value: SERVICES_ID.toString(),
            label: "Show Services",
            icon: <Service/>
        },
    ];


    return (
        <Layout currentTitle={"My List"} hideBreadCrumbs={true}>

            {isLoggedIn() ? (

                <EntityLayout
                    type="My List"
                    activeId={activeId}
                    setActiveId={setActiveId}
                    isGrid={isGrid}
                    setIsGrid={setIsGrid}
                    currentTitle="My List"
                    breadCrumbsItems={[{name: "Tasks & Bookings", href: ""}]}
                >

                    {/* Display ads if available */}
                    {ads?.result?.filter(val => val.is_active && val.priority === 1 && val.web_shape === "lg_thin")
                        .map(item => (
                            <section
                                className={"ads-section-services"}
                                id={"ads-section-services"}
                                key={item.id}
                                style={{margin: "16px 0 -24px"}}
                            >
                                <AspectRatio ratio={16 / 1.25} mx="auto">
                                    <Link href={item.redirect_url} target={"_blank"}>
                                        <Image
                                            src={item.image}
                                            style={{objectFit: "contain"}}
                                            fill
                                            alt="ad-image"
                                            priority
                                        />
                                    </Link>
                                </AspectRatio>
                            </section>
                        ))}

                    {/* Render list or map view based on isGrid */}
                    {isGrid ? (
                        <EntityListView
                            entityData={servicesData}
                            activeId={activeId}
                            page={page}
                            setPage={setPage}
                            is_requested={activeId === TASKS_ID ? true : activeId === SERVICES_ID ? false : null}
                            ownerFilter={activeId === TASKS_ID ? `&created_by=${user?.id}` : activeId === SERVICES_ID ? `&created_by=${user?.id}` : `&created_by=${user?.id}`}
                            query={extendedQuery}
                            badgeStatus={searchParams.get("status")}
                        />
                    ) : (
                        <EntityMapView
                            is_bookmark={activeId === 3}
                            is_requested={is_requested}
                            query={extendedQuery}
                            ownerFilter={ownerFilter}
                        />
                    )}
                </EntityLayout>
            ) : <Container
                size="sm"
                py="xl"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                }}
            >
                <Title order={2} align="center" style={{color: theme.colors.gray[7]}}>
                    You Need to Login to See Your List
                </Title>
                <Text align="center" size="lg" style={{color: theme.colors.gray[6], marginTop: '1rem'}}>
                    Please login to access your list and view all the content.
                </Text>
                <Button
                    variant="gradient"
                    gradient={{from: 'orange', to: 'red'}}
                    size="lg"
                    radius="md"
                    style={{marginTop: '2rem'}}
                    onClick={() => router.push('/auth/login')}
                >
                    Login to Continue
                </Button>
            </Container>}
        </Layout>


    );
};

export default Services;

// export const getStaticProps: GetStaticProps = async () => {
//     try {
//         const { data: servicesData } =
//             await axiosClient.get<EntityServiceLisitngProps>(
//                 ` ${urls.entity.service}&owned=false&page_size=9&page=1`
//             );

//         return {
//             props: {
//                 servicesData,
//             },
//             revalidate: 10,
//         };
//     } catch (err: any) {
//         return {
//             props: {
//                 servicesData: [],
//             },
//             revalidate: 10,
//         };
//     }
// };

