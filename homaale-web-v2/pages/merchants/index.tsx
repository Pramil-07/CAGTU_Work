import {AspectRatio, Button, Grid, Pagination, Select, TextInput, Tooltip, Flex} from "@mantine/core";
import {useQuery} from "@tanstack/react-query";
import type {NextPage} from "next";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";

import Empty from "@/components/common/Empty";
import Layout from "@/components/Layout/Layout";
import {SkeletonServiceCard} from "@/components/skeletons/SkeletonServiceCard";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {useGetAds} from "@/hooks/useGetAds";
import {Merchant} from "@/types/merchant/merchantListprops";
import {axiosClient} from "@/utils/axiosClient";
import {MerchantCard} from "@/components/common/form/MerchantCard";
import {reset} from "@/features/utils/filterSlice";
import {useMediaQuery} from "@mantine/hooks";
import {FaSlidersH} from "react-icons/fa";
import {IconFilter} from "@tabler/icons-react";
import { useBrandData } from "@/brand/BrandContext";

interface Category {
    id: number;
    name: string;
    level: number;
    slug: string;
}

const MerchantList: NextPage<{ merchantData: Merchant }> = ({merchantData}) => {
    const {query} = useAppSelector((state) => state.filterReducer);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const {brandData}= useBrandData();

    const [searchMerchant, setSearchMerchant] = useState("");
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>();
    const [category, setCategory] = useState<{ label: string; value: string }[]>([]);
    const [selectedServiceArea, setSelectedServiceArea] = useState("")
    const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
    const [pageSize, setPageSize] = useState(9);

    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!router.query.search) {
            dispatch(reset());
        }
    }, [dispatch, router.query.search]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await axiosClient.get("/locale/client/city/options");
                setCities(response.data.map((city: any) => ({label: city.name, value: String(city.id)})));
                // console.log("cities", response.data);
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        fetchCities();
    }, []);

    const setCategoryByLabel = (label: string) => {
        const foundCategory = category.find((cat) => cat.label === label);
        if (foundCategory) {
          setSelectedCategory(foundCategory.value);
        } else {
          setSelectedCategory(null); // Handle case where label is not found
        }
      };


    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axiosClient.get("/merchant/category/");
                setCategory(response.data.map((category: any) => ({label: category.name, value: category.id})));
                // console.log("categories", response.data)
            } catch (error) {
                console.error("Error Fetching the categories", error)
            }
        }
        fetchCategory();
    }, [])

    const {data, isLoading} = useQuery(
        ["merchant-listing", query, selectedCity, page, pageSize, searchMerchant, selectedServiceArea, selectedCategory],
        async () => {

            const response = await axiosClient.get<Merchant>("/merchant/", {
                params: {
                    query: searchMerchant.trim(),
                    city: selectedCity ? Number(selectedCity) : null,
                    page: page,
                    page_size: pageSize,
                    service_area: selectedServiceArea,
                    category: selectedCategory ?Number(selectedCategory) : null
                },
            });
            // console.log("response", response.data)
            return response.data;
        }, {initialData: merchantData});

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    }
    const [showFilters, setShowFilters] = useState(true);
    const smallScreen = useMediaQuery("(max-width: 991px)");
    useEffect(() => {
        if (!smallScreen) {
            setShowFilters(true);
        } else {
            setShowFilters(false);
        }
    }, [smallScreen]);
    const merchants = data?.result || [];
    console.log("merchant data", data)

    const {data: ads} = useGetAds("/merchants");

    return (
        <Layout currentTitle="Merchant List" heading="Merchant List"
                breadCrumbsItems={[{name: "Task & Bookings", href: ""}]}>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap'}}>

                <TextInput
                    placeholder="Search"
                    value={searchMerchant}
                    onChange={(e) => {
                        setSearchMerchant(e.target.value);
                        setPage(1); // Reset page on search change
                    }}
                    size="sm"
                    styles={{
                        input: {
                            height: '35px',
                            borderRadius: brandData.radius,
                            paddingLeft: '16px',
                            fontSize: '14px',
                            width: '15rem'
                        }
                    }}
                />
                {smallScreen && (
                    <Tooltip label={showFilters ? "Hide Filters" : "Show Filters"} withArrow>
                        <Button
                            // size="md"
                            radius="xl"
                            variant={showFilters ? "filled" : "outline"}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <IconFilter size={16}/>
                        </Button>
                    </Tooltip>
                )}
                {showFilters && (
                    <Flex   justify={"flex-start"}
                            align={"center"}
                            wrap={"wrap"}
                            gap={"xs"}>
                <Select
                    placeholder="Search City"
                    value={selectedCity}
                    onChange={(value) => {
                        setSelectedCity(value || null);
                    }}
                    data={cities}
                    searchable
                    clearable
                    nothingFound="No cities found"
                    size="sm"
                    styles={{
                        input: {
                            height: "35px",
                            borderRadius: brandData.radius,
                            paddingLeft: "16px",
                            fontSize: "14px",
                            width: "9rem"
                        }
                    }}
                />

                <Select
                    placeholder="Search Category"
                    value={selectedCategory}
                    onChange={(value) => {
                        setSelectedCategory(value || null);
                    }}
                    data={category}
                    searchable
                    clearable
                    size="sm"
                    styles={{
                        input: {
                            height: "35px",
                            borderRadius: brandData.radius,
                            paddingLeft: "16px",
                            fontSize: "14px",
                            width: "9rem"
                        }
                    }}
                />
                <TextInput
                    placeholder="Service Area"
                    value={selectedServiceArea}
                    onChange={(e) => {
                        setSelectedServiceArea(e.target.value);
                    }}
                    size="sm"
                    styles={{
                        input: {
                            height: '35px',
                            borderRadius: brandData.radius,
                            paddingLeft: '16px',
                            fontSize: '14px',
                            width: '9rem'
                        }
                    }}
                />
                    </Flex>
                )}
            </div>

            {ads?.result?.filter(val => val.is_active && val.priority === 1 && val.web_shape === "lg_thin").map((item) => (
                <section className="ads-section-tasker" key={item.id} style={{margin: "16px 0 -24px"}}>
                    <AspectRatio ratio={16 / 1.25} mx="auto">
                        <Link href={item.redirect_url} target="_blank">
                            <Image src={item.image} style={{objectFit: "contain"}} fill alt="ad-image" priority/>
                        </Link>
                    </AspectRatio>
                </section>
            ))}

            <Grid>
                {isLoading ? (
                    Array.from({length: pageSize}).map((_, index) => (
                        <Grid.Col span={12} md={6} lg={4} key={index}>
                            <SkeletonServiceCard/>
                        </Grid.Col>
                    ))
                ) : (
                    merchants.length > 0 ? merchants.map((merchant, index) => (
                        <Grid.Col span={12} md={6} lg={6} xl={4} key={index}>
                            <MerchantCard cities={cities} merchant={merchant}/>
                        </Grid.Col>
                    )) : (
                        <Empty title="No data" description="No merchants matching your search found."/>
                    )
                )}
            </Grid>

            <div>
                <Pagination
                    sx={{justifyContent: "center"}}
                    radius="lg"
                    mt={28}
                    total={data?.total_pages}
                    value={page}
                    onChange={handlePageChange}
                />

            </div>

        </Layout>
    );
};

export default MerchantList;
