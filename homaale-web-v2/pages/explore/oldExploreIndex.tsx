"use client"
import { AspectRatio, Container, Select, SelectItemProps, Button, Flex, Header, Title, Pagination, Skeleton } from "@mantine/core";
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
import { IconChevronDown, IconCube } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard/ProductCard";
import { Product } from "@/components/EntityServiceDetail";
import { PRERENDER_MANIFEST } from "next/dist/shared/lib/constants";
import { useCurrency } from "@/currency/CurrencyContext";

// Constants for IDs
const TASKS_ID = 1;
const SERVICES_ID = 5;
const EXPLORE_ID = 0;
const MY_LIST = 2;
const PRODUCT_ID=4


const Services: NextPage<{ servicesData: EntityServiceLisitngProps
}> = ({ servicesData}) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [page, setPage] = useState(1);
    const[productPage,setProductPage]= useState(1)
    const [activeId, setActiveId] = useState(EXPLORE_ID);
    const [isGrid, setIsGrid] = useState(true);
    const [activeType, setActiveType] = useState<"task" | "service" | "booking" | "blogs"|"products"| "explore">("explore");
    const [allProductData, setAllProductData] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(false);
    // const [currency, setCurrency] = useState<string|undefined>();


    const [totalProductPages, setTotalProductPages] = useState(1);
    const { query, budget_from, budget_to, category,budget,date} = useAppSelector((state) => state.filterReducer);
    const { radius, data } = useAppSelector((state) => state.locationReducer);
    const { data: ads } = useGetAds("/services?is_requested=null");
    const { data: user, error, isLoading } = useUser();
    const is_dark = useDark();

    const typeParam = searchParams.get("type");


    const { globalCurrency } = useCurrency();

    useEffect(() => {
        console.log("Currency changed in Services:", globalCurrency);
    }, [globalCurrency]);
    console.log("currenct from explore",globalCurrency)




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
        }
        else {
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
        const type = selectedId === TASKS_ID ? "task" : selectedId === SERVICES_ID ? "service" : "explore";
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
        {value:PRODUCT_ID.toString(),label:"Show Product",icon:<IconCube/>,name:"products"}
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
                            <Skeleton width="30%" height="2rem"></Skeleton>
                            <Skeleton width="30%" height="2rem"></Skeleton>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );


    return (
        <Layout currentTitle={"Explore"} hideBreadCrumbs={true}  >
            <EntityLayout
                type={activeType}
                activeId={activeId}
                setActiveId={setActiveId}
                isGrid={isGrid}
                setIsGrid={setIsGrid}
                currentTitle={"Explore"}
                breadCrumbsItems={[{name: "Tasks & Bookings", href: ""}]}
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

                {isGrid  ? (

                    <div

                    >{
                        activeId!==4 &&
                        <div>
                            <EntityListView
                                entityData={servicesData}
                                activeId={activeId}
                                page={page}
                                setPage={setPage}
                                is_requested={is_requested}
                                ownerFilter={ownerFilter}
                                query={extendedQuery}
                                globalCurrency={globalCurrency}
                            />
                        </div>
                    }{
                        (activeId !==3 && activeId!==1 && activeId!==5) &&

                        <div style={{ paddingTop: "20px" }}>
                            {activeId !== 4 && <Title weight={50} p={10} size={20}>Products</Title>}
                            {productLoading ? (
                                renderSkeletons()
                            ) : (
                                <>
                                    <Flex className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                                        {allProductData && allProductData.length > 0 ? (
                                            allProductData.map((item) => (
                                                <div key={item.id}>
                                                    <ProductCard products={item} />
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                                                No products found
                                            </p>
                                        )}
                                    </Flex>

                                    {totalProductPages > 1 && (
                                        <Pagination
                                            total={totalProductPages}
                                            value={productPage}
                                            onChange={setProductPage}
                                            mt="lg"
                                            radius={50}
                                            style={{justifySelf:"center"}}
                                            color={is_dark ? "orange.5" : "orange.5"}
                                        />
                                    )}
                                </>
                            )}
                        </div>

                    }
                    </div>
                ) : (
                    <EntityMapView is_bookmark={activeId === 3} is_requested={is_requested} query={extendedQuery} ownerFilter={ownerFilter} />
                )}
            </EntityLayout>
        </Layout>
    );
};

export default Services;
