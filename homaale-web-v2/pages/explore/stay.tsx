// src/App.js or HotelPage.js
import React, {useEffect, useState} from 'react';
import {
    Container,
    Header,
    Title,
    Navbar,
    NavLink,
    Button,
    Text,
    Card,
    SimpleGrid,
    Footer,
    Box,
    Flex,
    Grid, useMantineTheme
} from '@mantine/core';
import Layout from "@/components/Layout/Layout";
import {ServiceCard} from "@/components/cards/ServiceCard";
import {axiosClient} from "@/utils/axiosClient";
import type { EntityServiceLisitngProps } from "@/types/EntityServiceLisitngProps";
import type { NestedCategoryProps } from "@/types/NestedCategoryProps";
import {SkeletonServiceCard} from "@/components/skeletons/SkeletonServiceCard";
import {useDark} from "@/utils/helpers";

const categoryCache: { data: NestedCategoryProps[] | null } = { data: null };

const Stay = () => {

    const [services, setServices] = useState<EntityServiceLisitngProps["result"]>([]);
    const [filteredServices, setFilteredServices] = useState<EntityServiceLisitngProps["result"]>([]);
    const [categories, setCategories] = useState<NestedCategoryProps[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const theme = useMantineTheme();
    const dark = useDark();
    useEffect(() => {
        const fetchApiData = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/task/entity/service/?is_requested=null&category=stays-1746782281`);
                setServices(response.data.result);
                console.log("merchant data",response.data.result)
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchApiData();
    }, []);

    return (

        <Layout heading="Stays" hideBreadCrumbs={true}>
            <Grid className="flex gap-5 mt-4 justify-center">
            <Button
            variant={"outline"}
            radius={"xl"}
            >Guest House</Button>
            <Button
                variant={"outline"}
                radius={"xl"}
            >Air B&Bs</Button>
            <Button
                variant={"outline"}
                radius={"xl"}
            >Home stays</Button>
            <Button
                variant={"outline"}
                radius={"xl"}
            >Hotels</Button>
            </Grid>

            <Grid className="flex gap-5 mt-9 mb-5 justify-center">
                <Button
                    style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1623492701902-47dc207df5dc?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
                        backgroundSize: "contain",
                        width: 150,
                        height: 100,
                        borderColor: dark ? theme.colors.brand[4] : "white",
                        borderWidth: 2,
                        borderRadius: 12,
                    }}
                >
                    <Text style={{
                        position: "absolute",
                        top: "45%",
                        left: "20%",
                    }}>
                        Kathmandu
                    </Text>
                    </Button>
                <Button
                    style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1576948187290-457c015b3bff?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
                        backgroundSize: "contain",
                        width: 150,
                        height: 100,
                        borderColor: dark ? theme.colors.brand[4] : "white",
                        borderWidth: 2,
                        borderRadius: 12,
                    }}
                ><Text style={{
                        position: "absolute",
                        top: "45%",
                        left: "20%",
                    }}>Pokhara
                    </Text>
                </Button>
                <Button
                    style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1674569273857-8500cf8605d9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
                        backgroundSize: "contain",
                        width: 150,
                        height: 100,
                        borderColor: dark ? theme.colors.brand[4] : "white",
                        borderWidth: 2,
                        borderRadius: 12,
                    }}
                ><Text style={{
                        position: "absolute",
                        top: "45%",
                        left: "20%",
                    }}>Chitwan
                </Text>
                </Button>
                <Button
                    style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1516009183258-eaca18512e83?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
                        backgroundSize: "contain",
                        width: 150,
                        height: 100,
                        borderColor: dark ? theme.colors.brand[4] : "white",
                        borderWidth: 2,
                        borderRadius: 12,
                    }}
                ><Text style={{
                    position: "absolute",
                    top: "45%",
                    left: "20%",
                }}>Mustang
                </Text>
                </Button>
                <Button
                    style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1623492961702-549ffd2c7155?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
                        backgroundSize: "contain",
                        width: 150,
                        height: 100,
                        borderColor: dark ? theme.colors.brand[4] : "white",
                        borderWidth: 2,
                        borderRadius: 12,
                    }}
                ><Text style={{
                    position: "absolute",
                    top: "45%",
                    left: "20%",
                }}>Bhaktapur
                </Text>
                </Button>
                </Grid>

            <Grid gutter={5} mt={16}>
                {loading ? (
                    Array.from({ length: 9 }).map((_, index) => (
                        <Grid.Col span={12} md={6} lg={6} xl={4} key={index}>
                            <SkeletonServiceCard />
                        </Grid.Col>
                    ))
                    ) : (
                    services?.map((item) => (
                    <Grid.Col
                        span={12}
                        md={6}
                        lg={6}
                        xl={4}
                        key={item?.id}
                    >
                         <ServiceCard service={item} />
                    </Grid.Col>
                )))}
            </Grid>
        </Layout>
    );
};

export default Stay;
