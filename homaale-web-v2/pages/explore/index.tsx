"use client"
import {
    AspectRatio,
    Container,
    Select,
    SelectItemProps,
    Button,
    Flex,
    Header,
    Title,
    Pagination,
    Skeleton,
    Center, Grid, useMantineTheme
} from "@mantine/core";
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
import { advancedFilter, useDark } from "@/utils/helpers";
import { Explore, Tasks, Service } from "@/components/Dropdown/icon";
import { useUser } from "@/hooks/useUser";
import {IconArrowRight, IconChevronDown, IconCube, IconHome2} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard/ProductCard";
import { Product } from "@/components/EntityServiceDetail";
import { PRERENDER_MANIFEST } from "next/dist/shared/lib/constants";
import { useCurrency } from "@/currency/CurrencyContext";
import HotelCard, {Hotel} from "@/components/hotels/HotelCard";
import SearchUrlResults from "@/components/SearchUrlResults";
import {CategoryCard} from "@/components/common/CategoryCard";
import {useLandingStyles} from "@/styles/pages/LandingStyles";
import {TopCategoryProps} from "@/types/TopCategoryProps";
import {Carousel} from "@mantine/carousel";
import {useMediaQuery} from "@mantine/hooks";
import Calculator from "@/components/calculator";

// Constants for IDs
const TASKS_ID = 1;
const SERVICES_ID = 5;
export const EXPLORE_ID = 0;
const MY_LIST = 2;
const PRODUCT_ID=4
const HOTEL_ID=8


const Services: NextPage<{ servicesData: EntityServiceLisitngProps
}> = ({ servicesData}) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [page, setPage] = useState(1);
    const[productPage,setProductPage]= useState(1)
    const [activeId, setActiveId] = useState(EXPLORE_ID);
    const [topCategories, setTopCategories] = useState<TopCategoryProps["result"] | null>(null);
    const [topCategoriesLoading, setTopCategoriesLoading] = useState(false);
    const [isGrid, setIsGrid] = useState(true);
    const [activeType, setActiveType] = useState<"task" | "service" | "booking" | "blogs"|"products"| "hotels" | "explore">("explore");
    const [allProductData, setAllProductData] = useState<Product[]>([]);
    const [allHotelData, setAllHotelData] = useState<Hotel[]>([]);
    const [cleanedQuery, setCleanedQuery] = useState("");
    const [hotelLoading, setHotelLoading] = useState(false);
    const [totalHotelPages, setTotalHotelPages] = useState(1);
    const [hotelPage, setHotelPage] = useState(1);
    const [productLoading, setProductLoading] = useState(false);
    const {classes} = useLandingStyles();
    const showCalculator = cleanedQuery.trim().toLowerCase() === "calculator";

    const [totalProductPages, setTotalProductPages] = useState(1);
    const { query, budget_from, budget_to, category,budget,date , city} = useAppSelector((state) => state.filterReducer);
    const { radius, data } = useAppSelector((state) => state.locationReducer);
    const { data: ads } = useGetAds("/services?is_requested=null");
    const { data: user, error, isLoading } = useUser();
    const is_dark = useDark();
    const theme = useMantineTheme();
    const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
    const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
    const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

    const typeParam = searchParams.get("type");


    const { globalCurrency ,exchangeRate} = useCurrency();

    /*useEffect(() => {
        console.log("Currency changed in Services:", globalCurrency);
    }, [globalCurrency]);
    console.log("currenct from explore",globalCurrency)*/

    useEffect(() => {
        const fetchHotels = async () => {
            setHotelLoading(true);
            try {
                let cleanedQuery = '';

                if (query) {
                    const queryParams = new URLSearchParams(query);
                    cleanedQuery = queryParams.get('search') || '';
                }

                const params = new URLSearchParams();
                if (cleanedQuery) params.append('search', cleanedQuery.trim());
                params.append('page', hotelPage.toString());

                params.append('page', hotelPage.toString());
                const cleanBudgetFrom = budget_from ? budget_from.toString().replace(/^&?budget_from=/, '').replace(/&.*/, '') : null;
                const cleanBudgetTo = budget_to ? budget_to.toString().replace(/^&?budget_to=/, '').replace(/&.*/, '') : null;
                const minPrice = cleanBudgetFrom ? parseInt(cleanBudgetFrom, 10) : null;
                const maxPrice = cleanBudgetTo ? parseInt(cleanBudgetTo, 10) : null;
                const cleanCity = city?.replace(/^&?city=/, '').trim();
                if (cleanCity) {
                    params.append('city', cleanCity);
                }

                if (minPrice !== null) {
                    params.append('min_price', minPrice.toString());
                }
                if (maxPrice !== null) {
                    params.append('max_price', maxPrice.toString());
                }
                if (city === "city") {
                    params.append('city', city);
                }
                if (budget === '&ordering=-budget_to') {
                    params.append('ordering', '-price');
                    console.log("Ordering value from budget:", '-price');
                }
                if (budget === '&ordering=budget_to') {
                    params.append('ordering', 'price');
                    console.log("Ordering value from budget:", '-price');
                }

                const url = params.toString()
                    ? `/hotel/list/?${params.toString()}`
                    : '/hotel/list/';

                console.log("HOTEL API URL →", url);
                const response = await axiosClient.get(url);
                if (response.data.status === 'success' || response.data.result) {
                    setAllHotelData(response.data.result || response.data.results || []);
                    setTotalHotelPages(response.data.total_pages || 1);
                }
            } catch (error) {
                console.error('Error fetching hotels:', error);
                setAllHotelData([]);
            } finally {
                setHotelLoading(false);
            }
        };

        fetchHotels();
    }, [query, city, hotelPage, budget_from, budget_to, budget]);

    useEffect(() => {
        const fetchTopCategories = async () => {
            setTopCategoriesLoading(true);
            try {
                const response = await axiosClient.get(`${urls.category.top}?page_size=12&ordering=priority`)
                setTopCategories(response.data.result || []);
                console.log("top cateogories", response.data.result || []);
            } catch (e) {
                console.error(e);
            } finally {
                setTopCategoriesLoading(false);
            }
        };
        fetchTopCategories();
    },[])

    useEffect(() => {
        let searchTerm = "";
        if (query) {
            const params = new URLSearchParams(query);
            searchTerm = params.get("search") || "";
        }
        setCleanedQuery(searchTerm);
    }, [query]);

    useEffect(() => {
        if (!router.query.search) {
            dispatch(reset());
        }
    }, [dispatch, router.query.search]);

    const moreFilter = advancedFilter((router.query.options as string) ?? "");
    const [extendedQuery, setExtendedQuery] = useState("");

    const [sortOption, setSortOption] = useState(moreFilter);
    useEffect(() => {
        if (typeParam === "task") {
            setActiveId(TASKS_ID);
            setActiveType("task");
        } else if (typeParam === "services") {
            setActiveId(SERVICES_ID);
            setActiveType("service");
        }else if (typeParam === "products") {
            setActiveId(PRODUCT_ID);
            setActiveType("products");
        }else if (typeParam === "hotels") {
            setActiveId(HOTEL_ID);
            setActiveType("hotels");
        }else {
            setActiveId(EXPLORE_ID);
            setActiveType("explore");
        }
    }, [typeParam]);
    // console.log("product from explore 2",allProductData)

    // Fetch products with search query and pagination
    useEffect(() => {
        setPage(1);
    }, [budget]);

    // Fetch products with search query and pagination
    useEffect(() => {
        const fetchAllProducts = async () => {
            setProductLoading(true);
            try {
                // console.log("Input states:", { query, budget_from, budget_to, category, budget });

                // Clean query to extract only the search term
                let cleanedQuery = '';
                if (query) {
                    const queryParams = new URLSearchParams(query);
                    cleanedQuery = queryParams.get('search') || '';
                    // console.log("Query params:", Object.fromEntries(queryParams));
                    // console.log("Cleaned query:", cleanedQuery);
                }

                // Extract clean numeric values from budget_from and budget_to
                const cleanBudgetFrom = budget_from ? budget_from.toString().replace(/^&?budget_from=/, '').replace(/&.*/, '') : null;
                const cleanBudgetTo = budget_to ? budget_to.toString().replace(/^&?budget_to=/, '').replace(/&.*/, '') : null;
                const minPrice = cleanBudgetFrom ? parseInt(cleanBudgetFrom, 10) : null;
                const maxPrice = cleanBudgetTo ? parseInt(cleanBudgetTo, 10) : null;

                // Construct query string with parameters
                const params = new URLSearchParams();
                if (cleanedQuery) {
                    params.append('search', cleanedQuery.trim());
                }
                params.append('page', productPage.toString());
                if (minPrice !== null) {
                    params.append('min_price', minPrice.toString());
                }
                if (maxPrice !== null) {
                    params.append('max_price', maxPrice.toString());
                }
                if (router?.query?.category_id) {
                    params.append('category', router.query.category_id.toString());
                }
                // Append ordering only if budget is set to "&ordering=-budget_to"
                if (budget === '&ordering=-budget_to') {
                    params.append('ordering', '-price'); // Map budget_to to price for products
                    console.log("Ordering value from budget:", '-price');
                }
                if (budget === '&ordering=budget_to') {
                    params.append('ordering', 'price'); // Map budget_to to price for products
                    console.log("Ordering value from budget:", '-price');
                }
                if (date === '&ordering=-created_at') {
                    params.append('ordering', '-created_at'); // Map budget_to to price for products
                    // console.log("Ordering value from budget:", '-price');
                }
                if (date === '&ordering=created_at') {
                    params.append('ordering', 'created_at'); // Map budget_to to price for products
                    //   console.log("Ordering value from budget:", '-price');
                }


                // Construct the URL
                let url = '/api/v1/product/search/';
                if (params.toString()) {
                    url = `/api/v1/product/search/?${params.toString()}`;
                }

                // console.log('API request URL:', url);

                const response = await axiosClient.get(url);
                if (response.data.status === 'success') {
                    setAllProductData(response.data.results);
                    setTotalProductPages(response.data.total_pages);
                    // console.log('Product data fetched:', response.data);
                } else {
                    console.error('Failed to fetch products:', response.data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }finally{
                setProductLoading(false);
            }
        };
        fetchAllProducts();
    }, [query, budget_from, budget_to, category, productPage, router?.query?.category_id, budget]);
    useEffect(() => {
        const userCreatedByFilter = activeId === MY_LIST && user?.id ? `&created_by=${user.id}` : "";
        const combinedQuery = `${query}&category=${router?.query?.category ?? ""} ${moreFilter}${userCreatedByFilter}`;
        setExtendedQuery(combinedQuery);
        setPage(1); // Reset page when filters change
    }, [moreFilter, query, router?.query?.category, radius, data.latitude, data.longitude, activeId, user?.id,]);

    const ownerFilter = activeId === TASKS_ID ? "&owned=false" : activeId === SERVICES_ID ? "&owned=true" : "";
    const is_requested = activeId === TASKS_ID ? true : activeId === SERVICES_ID ? false : null;

    const handleTabChange = (value: string | null) => {
        const selectedId = parseInt(value ?? EXPLORE_ID.toString());
        setActiveId(selectedId);
        const type = selectedId === TASKS_ID ? "task" : selectedId === SERVICES_ID ? "service" : selectedId === HOTEL_ID
            ? "hotels" : "explore";
        setActiveType(type as "service" | "explore" | "task");
        const newQuery = selectedId === TASKS_ID ? "?type=task" : selectedId === SERVICES_ID ? "?type=services" : "";
        router.push(`/explore${newQuery}`, undefined, { shallow: true });
    };

    const CustomSelectItem = forwardRef<HTMLDivElement, SelectItemProps & { icon?: JSX.Element }>(
        ({ label, icon, ...others }, ref) => (
            <div ref={ref} {...others} style={{ display: "flex", alignItems: "center" }}>
                {icon}
                <span>{label}</span>
            </div>
        )
    );
    CustomSelectItem.displayName = "CustomSelectItem";

    if (error) {
        return <div>Error fetching user data</div>;
    }

    const options = [
        { value: EXPLORE_ID.toString(), label: "Show Task/Services", icon: <Explore /> },
        { value: TASKS_ID.toString(), label: "Show Tasks", icon: <Tasks />, name: "tasks" },
        { value: SERVICES_ID.toString(), label: "Show Services", icon: <Service />, name: "service" },
        {value:PRODUCT_ID.toString(),label:"Show Product",icon:<IconCube/>,name:"products"},
        {value:HOTEL_ID.toString(),label:"Show Hotels",icon:<IconHome2  color="#868E96" />,name:"hotels"}
    ];
    const renderSkeletons = () => (
        <div className="mt-10 px-4 md:px-6 max-w-[2000px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {Array.from({ length: 15 }).map((_, index) => (
                    <div key={index} className="border-round border-1 surface-border p-4 surface-card">
                        <Skeleton height="200px" width="100%"></Skeleton>
                        <div className="flex justify-content-between mt-3 mb-3">
                            <Skeleton width="70%" height="1rem"></Skeleton>
                        </div>
                        <Skeleton width="40%" height="1.5rem"></Skeleton>
                        <div className="flex justify-content-between mt-3 gap-2">
                            <Skeleton width="30%" height="2rem" />
                            <Skeleton width="30%" height="2rem" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );


    return (
        <Layout currentTitle={"Explore"} hideBreadCrumbs={true}>
            <EntityLayout
                type={activeType}
                activeId={activeId}
                setActiveId={setActiveId}
                isGrid={isGrid}
                setIsGrid={setIsGrid}
                currentTitle={"Explore"}
                breadCrumbsItems={[{ name: "Tasks & Bookings", href: "" }]}
            >
                {ads?.result
                    ?.filter((val) => val.is_active && val.priority === 1 && val.web_shape === "lg_thin")
                    .map((item) => (
                        <section className={"ads-section-services"} id={"ads-section-services"} key={item.id} style={{ margin: "16px 0 -24px" }}>
                            <AspectRatio ratio={16 / 1.25} mx="auto">
                                <Link href={item.redirect_url} target={"_blank"}>
                                    <Image src={item.image} style={{ objectFit: "contain" }} fill alt="ad-image" priority />
                                </Link>
                            </AspectRatio>
                        </section>
                    ))}

                {isGrid ? (
                    <div>
                        {activeId === HOTEL_ID ? (
                            <div style={{ paddingTop: "40px" }}>
                                {hotelLoading ? (
                                    renderSkeletons()
                                ) : allHotelData.length > 0 ? (
                                    <>
                                        <div className="flex flex-wrap gap-4 md:gap-6">
                                            {allHotelData.map((hotel) => (
                                                <div key={hotel.id}>
                                                    <HotelCard hotel={hotel} />
                                                </div>
                                            ))}
                                        </div>

                                        {totalHotelPages > 1 && (
                                            <Pagination
                                                total={totalHotelPages}
                                                value={hotelPage}
                                                onChange={setHotelPage}
                                                mt="lg"
                                                radius={50}
                                                style={{ justifySelf: "center" }}
                                                color={is_dark ? "orange.5" : "orange.5"}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <Center py="xl">
                                        <h3>No hotels found for your search.</h3>
                                    </Center>
                                )}
                            </div>
                        ) : activeId === PRODUCT_ID ? (
                            <div style={{ paddingTop: "20px" }}>
                                {productLoading ? (
                                    renderSkeletons()
                                ) : allProductData.length > 0 ? (
                                    <>
                                        <Flex className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                                            {allProductData.map((item) => (
                                                <div key={item.id}>
                                                    <ProductCard products={item} />
                                                </div>
                                            ))}
                                        </Flex>

                                        {totalProductPages > 1 && (
                                            <Pagination
                                                total={totalProductPages}
                                                value={productPage}
                                                onChange={setProductPage}
                                                mt="lg"
                                                radius={50}
                                                style={{ justifySelf: "center" }}
                                                color={is_dark ? "orange.5" : "orange.5"}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <Center py="xl">
                                        <h3>No products found.</h3>
                                    </Center>
                                )}
                            </div>
                        ) : activeId === 3 ? (
                            <div style={{ paddingTop: "20px" }}>
                                <EntityListView
                                    entityData={servicesData}
                                    activeId={activeId}
                                    page={page}
                                    setPage={setPage}
                                    is_requested={null}
                                    ownerFilter=""
                                    query={extendedQuery}
                                    globalCurrency={globalCurrency}
                                />
                            </div>
                        ) : (
                            <>
                                {showCalculator && (
                                    <div className="mt-2 mb-2 border-b border-gray-200 pb-8">
                                        <Calculator enableKeyboard={false} />
                                    </div>
                                )}

                                {(!activeId || [EXPLORE_ID, TASKS_ID, SERVICES_ID].includes(activeId)) && (
                                    <EntityListView
                                        entityData={servicesData}
                                        activeId={activeId}
                                        page={page}
                                        setPage={setPage}
                                        is_requested={is_requested}
                                        ownerFilter={ownerFilter}
                                        query={extendedQuery}
                                    />
                                )}

                                {activeId === EXPLORE_ID && allProductData.length > 0 && (
                                    <div style={{ paddingTop: "20px" }}>
                                        <Flex justify="space-between" align="center" px={10} pb={10}>
                                            <Title weight={50} size={20}>Products</Title>
                                            <Link href={"/explore?type=products"} className="more__link flex">
                                                View More <IconArrowRight />
                                            </Link>
                                        </Flex>
                                        {productLoading ? renderSkeletons() : (
                                            <Carousel
                                                loop
                                                withIndicators={false}
                                                withControls={!isXs || allProductData.length > 0}
                                                align="start"
                                                slidesToScroll={1}
                                                slideSize={isXs ? "85%" : isSm ? "50%" : isMd ? "33.333%" : "20%"}
                                                height="auto"
                                                className="w-full py-2"
                                                draggable
                                                styles={{
                                                    control: {
                                                        backgroundColor: theme.colors.brand[3],
                                                        border: "none",
                                                        width: 10,
                                                        height: 10,
                                                        "&:hover": { backgroundColor: theme.colors.brand[7] },
                                                    },
                                                }}
                                            >
                                                {allProductData.map((item) => (
                                                    <Carousel.Slide key={item.id} style={{ paddingRight: "20px", width: "100%" }}>
                                                        <ProductCard products={item} />
                                                    </Carousel.Slide>
                                                ))}
                                            </Carousel>
                                        )}
                                    </div>
                                )}

                                {activeId === EXPLORE_ID && allHotelData.length > 0 && (
                                    <div style={{ paddingTop: "40px" }}>
                                        <Flex justify="space-between" align="center" px={10} pb={10}>
                                            <Title weight={50} size={20}>Hotels & Stays</Title>
                                            <Link href={"/explore?type=hotels"} className="more__link flex">
                                                View More <IconArrowRight />
                                            </Link>
                                        </Flex>
                                        {hotelLoading ? renderSkeletons() : (
                                            <Carousel
                                                loop
                                                withIndicators={false}
                                                withControls={!isXs || allHotelData.length > 0}
                                                align="start"
                                                slideGap="md"
                                                slidesToScroll={1}
                                                slideSize={isXs ? "85%" : isSm ? "50%" : isMd ? "33.333%" : "25%"}
                                                height="auto"
                                                className="py-2"
                                                draggable
                                                styles={{
                                                    control: {
                                                        backgroundColor: theme.colors.brand[3],
                                                        border: "none",
                                                        width: 10,
                                                        height: 10,
                                                        "&:hover": { backgroundColor: theme.colors.brand[7] },
                                                    },
                                                }}
                                            >
                                                {allHotelData.map((hotel) => (
                                                    <div key={hotel.id} style={{ paddingRight: "20px" }}>
                                                        <HotelCard hotel={hotel} />
                                                    </div>
                                                ))}
                                            </Carousel>
                                        )}
                                    </div>
                                )}

                                {cleanedQuery && activeId === EXPLORE_ID && (
                                    <div style={{ paddingTop: "20px" }}>
                                        <Title order={3} weight={600} mb="md">
                                            Search Results for {cleanedQuery}
                                        </Title>
                                        <SearchUrlResults query={cleanedQuery} />
                                    </div>
                                )}

                                {/* Top Categories - Only in Explore */}
                                {activeId === EXPLORE_ID && (
                                    <div className={`${classes.category} mt-5`} id={"category-section"}>
                                        <div className="mx-6">
                                            <Flex mt={3}>
                                                <h3>We also provide</h3>
                                                <Link href={"/category"} className="more__link flex">
                                                    View More <IconArrowRight />
                                                </Link>
                                            </Flex>
                                            <Grid mb={80}>
                                                {topCategories?.map((item, index) => (
                                                    <Grid.Col md={2} sm={4} xs={6} span={6} key={index}
                                                              display={"flex"}>
                                                        <CategoryCard data={item}/>
                                                    </Grid.Col>
                                                ))}
                                            </Grid>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <EntityMapView is_bookmark={activeId === 3} is_requested={is_requested} query={extendedQuery} ownerFilter={ownerFilter}/>
                )}
            </EntityLayout>
        </Layout>
    );
};

export default Services;
