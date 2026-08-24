import React, {useState, useEffect} from "react";
import {axiosClient} from "@/utils/axiosClient";
import Layout from "@/components/Layout/Layout";
import {Alert, Box, Button, Flex, Pagination, Tabs, useMantineTheme} from "@mantine/core";
import {useRouter} from "next/router";
import {useUserStatus} from "@/hooks/useUserStatus";
import {isLoggedIn, useDark} from "@/utils/helpers";
import ShopFilters from "@/components/shops/ShopFilters";
import {ShopTabs} from "@/components/shops/ShopTabs";
import CategorySidebar from "@/components/CategorySidebar/CategorySidebar";
import {useProfile} from "@/hooks/useProfile";
import {notifications} from "@mantine/notifications";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store";
import {setQuery, setSearch} from "@/features/utils/filterSlice";
import { useMediaQuery } from "@mantine/hooks";
import {clearGlobCache} from "@typescript-eslint/typescript-estree/dist/parseSettings/resolveProjectList";
import Breadcrumb from "@/components/common/BreadCrumb";
import {IoMdInformationCircleOutline} from "react-icons/io";

export interface ShopResponse {
    count: number;
    next: string | null;
    previous: string | null;
    total_pages: number;
    results: Array<{
        id: string;
        owner: string;
        name: string;
        category: number;
        latitude: number;
        location: string;
        longitude: number;
        is_pinned: boolean;
        pinned_id?:string
        slug: string;
        is_active: boolean;
        merchant_premium: boolean;
        about: string;
        images: Array<{
            id: number;
            image: string;
            uploaded_at: string;
        }>;
        created_at: string;
        updated_at: string;
        status: string;
    }>;
}

export interface ShopCardProps {
    id: string;
    name: string;
    image: string;
    rating: number;
    about: string;
    location: string;
    status?: string;
    is_pinned?: boolean;
    pinned_id?:string;
}
export interface CmsProps{
    total_pages: number;
    count: number;
    current: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    result: Array<{
        id: number;
        is_premium: boolean;
        max_shops: number;
        max_products: number;
        created_at: string;
        updated_at: string;
    }>;
}

export default function Home() {
    const [allShops, setAllShops] = useState<ShopCardProps[]>([]);
    const [myShops, setMyShops] = useState<ShopCardProps[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const {checkStatus} = useUserStatus();
    const [searchMerchant, setSearchMerchant] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<string>("allShops");
    const [sortOrder, setSortOrder] = useState<string | null>(null);
    const [minRating, setMinRating] = useState<string | null>(null);
    const [pinnedShops, setPinnedShops] = useState<ShopCardProps[]>([]);
    const [showPin, setShowPin] = useState<boolean>(false);
    const [merchantData, setMerchantData] = useState(undefined);
    const dark = useDark();
    const {data: profileData} = useProfile();
    const user = useProfile();
    const merchantId = user?.data && user?.data.user?.id;
    // console.log("profile data",profileData);
     console.log("merchant id :",merchantId)
    // const ram= pro
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
    const theme = useMantineTheme();
    const router = useRouter();
    const selectedCategory: any = router.query.category_id;
    const childCategoryId = router.query.subCategoryId;
    const childCategoryName = router.query.subCategoryName;
    const [canCreateShop, setCanCreateShop] = useState<boolean>(false);
    const [maxShops, setMaxShops] = useState<number>(0);
    const [currentShopCount, setCurrentShopCount] = useState<number>(0)
    const[cmsData,setCmsData] = useState<CmsProps|any>([])
    const verifyMerchant = profileData?.merchant_data?.[0]?.is_premium;
    const [isMerchant, setIsMerchant]=useState<boolean>(false)
    const [showAlert, setShowAlert] = useState<boolean>(true);
    const [merchantAlert , setMerchantAlert] = useState<boolean>(false);

    // console.log("merchant id ",merchantId)
    // console.log("merchant data ",merchantData);
    // console.log("verify merchant ",verifyMerchant)

    const dispatch = useDispatch();
    const filterState = useSelector((state: RootState) => state.filterReducer); // Moved useSelector here
      const isMobile = useMediaQuery('(max-width: 768px)');

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

    // console.log("verify merchant ", verifyMerchant)
    useEffect(() => {
        const fetchCmsLimit = async () => {
            if (!isMerchant) {
                // notifications.show({
                //     title: "You need to be merchant to use this feature",
                //     message: `need to be merchant to use this feature`,
                //     color: "orange",
                // });
                setCanCreateShop(false);
                setMaxShops(0);
                setCurrentShopCount(0);
                return;
            }

            setLoading(true);
            try {
                // Fetch shop data to get count and premium status
                const myShopsResponse = await axiosClient.get<ShopResponse>("/product/shops/?page=1");
                // console.log("Shops API Response:", myShopsResponse.data);
                const shopCount = myShopsResponse.data.count ?? 0;
                setCurrentShopCount(shopCount);

                // Fetch CMS limits
                const cmsResponse = await axiosClient.get<CmsProps>("/merchant/cms-merchant-limits/");
                // console.log("CMS API Response:", cmsResponse.data);

                if (!cmsResponse.data.result || !Array.isArray(cmsResponse.data.result)) {
                    throw new Error("Invalid CMS response: result is missing or not an array");
                }

                // Select CMS data based on is_premium from ShopResponse
                const cmsData = cmsResponse.data.result.find((item) => {
                    // console.log("Checking CMS item:", item);
                    return item.is_premium === isPremium;
                });

                if (!cmsData) {
                    // console.log("No CMS data found for is_premium:", isPremium);
                    throw new Error(`No CMS data found for ${isPremium ? "premium" : "non-premium"} merchant`);
                }

                setMaxShops(cmsData.max_shops);

                // Determine if user can create more shops
                const canCreate = shopCount < cmsData.max_shops;
                setCanCreateShop(canCreate);

                // Show notification based on is_premium and remaining shop limit
                // if (!canCreate) {
                //     notifications.show({
                //         title: "Shop Creation Limit Reached",
                //         message: `You have reached the maximum shop limit (${cmsData.max_shops}). ${
                //             isPremium
                //                 ? "Contact support at Hommale Team."
                //                 : "Upgrade to premium at Through Merchant to create more shops."
                //         }`,
                //         color: "orange",
                //     });
                // }
                // else {
                //     const remainingShops = cmsData.max_shops - shopCount;
                //     notifications.show({
                //         title: "Shop Creation Available",
                //         message: `You can create ${remainingShops} more shops as a ${
                //             isPremium ? "premium" : "free"
                //         } user.`,
                //         color: "green",
                //     });
                // }
            } catch (error) {
                console.error("CMS limit error:", error);
                setIsPremium(false);
                setMaxShops(0);
                setCurrentShopCount(0);
                setCanCreateShop(false);
                // notifications.show({
                //     title: "Error",
                //     message: "Failed to fetch shop limits. Contact support at Homaale Team.",
                //     color: "red",
                // });
            } finally {
                setLoading(false);
            }
        };

        fetchCmsLimit();
    }, [maxShops , isPremium, isMerchant]);

    // console.log("verify merchant :",verifyMerchant)

    const fetchAllShops = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                // Use filterSlice's search if available, else fallback to searchMerchant
                ...(filterState.search
                    ? {name: filterState.search.replace(/(&name=|&search=)/, "")}
                    : searchMerchant
                        ? {name: searchMerchant}
                        : {}),
                ...(selectedCategory && {category: selectedCategory}),
                ...(sortOrder && {sort: sortOrder}),
                ...(minRating && minRating !== "0" && {rating__gte: minRating}),
                ...(selectedCity && { city: selectedCity }),
            });
            const response = await axiosClient.get<ShopResponse>(`/product/shops/all/?${params.toString()}`);
            setTotalPages(response.data.total_pages);
            const transformedShops = response.data.results.map((shop) => ({
                id: shop.id,
                name: shop.name,
                image: shop.images[0]?.image,
                rating: 4.5, // Placeholder; replace with actual rating if available
                about: shop.about,
                location: shop.location,
                status: shop.status,
                is_pinned: shop.is_pinned,
                pinned_id: shop.pinned_id,
            }));
            setAllShops(transformedShops);
        } catch (error) {
            console.error("Error fetching all shops:", error);
        } finally {
            setLoading(false);
        }
    };
    // Sync with router.query.name and fetch shops
    useEffect(() => {
        if (router.query.name) {
            // Update filterSlice with search term and searchType
            dispatch(setSearch(router.query.name as string));
            dispatch(setQuery({key: "searchType", value: "shops"}));
        }
        fetchAllShops();
    }, [router.query.name, page, filterState.search, selectedCategory, sortOrder, selectedCity, minRating, dispatch]);

    const fetchMyShops = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                ...(searchMerchant && {name: searchMerchant}),
                ...(selectedCategory && {category: selectedCategory}),
                ...(sortOrder && {sort: sortOrder}),
                ...(minRating && minRating !== "0" && {rating__gte: minRating}),
                ...(selectedCity && { city: selectedCity }),
            });
            const response = await axiosClient.get<ShopResponse>(`/product/shops/?${params.toString()}`);
            setTotalPages(response.data.total_pages);
            const results = Array.isArray(response.data) ? response.data : response.data.results || [];
            const transformedShops = results.map((shop) => ({
                id: shop.id,
                name: shop.name,
                image: shop.images[0]?.image ,
                rating: 4.5, // Placeholder; replace with actual rating if available
                about: shop.about,
                location: shop.location,
                status: shop.status,
                is_pinned: shop.is_pinned,
                pinned_id: shop.pinned_id,
            }));
            setMyShops(transformedShops);
            // console.log("my shop",transformedShops);
        } catch (error) {
            // console.error("Error fetching my shops:", error);
            setMyShops([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPinnedShops = async () => {
        try {
            const response = await axiosClient.get("/product/pinned-items/", {
                params: {
                    active: true,
                    pinned_type: "Shop",
                },
            });
            const pinnedItems = response.data.result;
            // console.log("pinned shop", pinnedItems)
            const shopDetailsPromises = pinnedItems.map((item: any) =>
                axiosClient.get(`/product/shops/${item.shop}/`)
            );
            const shopDetailsResponses = await Promise.all(shopDetailsPromises);
            const transformedPinnedShops = shopDetailsResponses.map((res: any) => {
                const shop = res.data;
                return {
                    id: shop.id,
                    name: shop.name,
                    image: shop.images[0]?.image || "/images/placeholder.jpg",
                    rating: 4.5,
                    about: shop.about || "No description available",
                    location: shop.location || "Unknown location",
                    status: shop.status || "active",
                    is_pinned: true,
                    pinned_id: shop.pinned_id,
                };
            });
            setPinnedShops(transformedPinnedShops);
            setTotalPages(response.data.total_pages);
            setShowPin(true);
        } catch (error) {
            console.error("Error fetching pinned shops:", error);
            setPinnedShops([]);
            setShowPin(false);
            setTotalPages(1);
            notifications.show({
                title: "Error",
                message: "Failed to fetch pinned shops.",
                color: "red",
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        }
    };

    useEffect(() => {
        const fetchApiData = async () => {
            try {
                const response = await axiosClient.get(`/merchant/${merchantId}/`);
                // setProfile(response.data);
                setMerchantData(response.data.merchant_data.id);
                 console.log("merchant data",response.data)
                setIsMerchant(response.data.is_merchant)
                setIsPremium(response.data.merchant_data.is_premium ); // Set premium status
                // console.log("merchant data",response.data.merchant_data.is_premium)
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsPremium(false); // Default to false on error
            }
        };
        fetchApiData();
    }, [merchantId]);

    const clearAllFilters = () => {
        setSearchMerchant("");
        setSortOrder(null);
        setMinRating(null);
        setSelectedCity(null);
        setPage(1);
    };

    useEffect(() => {
        if (activeTab === "allShops") {
            fetchAllShops();
        } else if (activeTab === "myShop" && isLoggedIn()) {
            fetchMyShops();
        }
    }, [searchMerchant, selectedCategory, activeTab, page, sortOrder, minRating, selectedCity ,childCategoryId]);

    const handleCreateShop = () => {

        if (!isMerchant) {
            notifications.show({
                title: "Merchant Access Required",
                message: "You must be a merchant to use this feature.",
                color: "red",
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
            return;
        }

        if (canCreateShop) {
            router.push({ pathname: "formShop" });
        }
        else {
            notifications.show({
                title: "Action Restricted",
                message: `You cannot create a new shop. You have reached the maximum shop limit (${maxShops}). ${
                    !isPremium ? "Upgrade to a premium account to create more shops." : ""
                }`,
                color: "red",
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        }
    };


    const handleTabChange = (value: string | null) => {
        const tab = value ?? "allShops";
        setActiveTab(tab);
        setPage(1);
    };

    const toggleDrawer = (open: boolean) => {
        return (event?: React.KeyboardEvent | React.MouseEvent) => {
            if (
                event &&
                event.type === "keydown" &&
                ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
            ) {
                return;
            }
            setDrawerOpen(open);
        };
    };

    const drawerContent = (
        <Box
            sx={{
                width: isMobile? "300px": 400,
                height: "100%",
                backgroundColor: dark ? theme.colors.dark[7] : theme.colors.homaaleSlate[0],
            }}
        >
            <Box
                sx={{
                    p: 2,
                    borderBottom: "1px solid #ddd",
                    justifyContent: "space-between",
                    alignItems: "",
                    backgroundColor: dark ? theme.colors.dark[7] : theme.colors.homaaleSlate[0],
                    position: "relative",
                }}
            >
                {/* <Flex>
                    <h2 style={{visibility: "hidden"}}>CATEGORY SIDEBAR</h2>
                    <Button style={{position: "relative", right: "10px"}} variant="subtle"
                            onClick={toggleDrawer(false)}>
                        X
                    </Button>
                </Flex> */}
            </Box>
            <CategorySidebar closeDrawer={toggleDrawer(false)} />
        </Box>
    );

    const togglePinnedShops = () => {
        if (showPin) {
            // Revert to original shops
            setShowPin(false);
            // Optionally, refetch original shops if needed
            if (activeTab === "allShops") {
                fetchAllShops();
            } else if (activeTab === "myShop" && isLoggedIn()) {
                fetchMyShops();
            }
        } else {
            // Fetch and show pinned shops
            fetchPinnedShops();
        }
    };

    const remainingShops = maxShops - currentShopCount;
//     console.log("max shops",maxShops);
//     console.log("current shop count",currentShopCount);
// console.log("remaining shops", remainingShops);
// console.log("is premium ",isPremium)
    return (
        <Layout currentTitle={"Shops"} hideBreadCrumbs={true} >
            <div className="-mb-4 ml-5 grid grid-cols-2">
                <h3 className="font-medium">Shop Lists</h3>

                <div className="justify-self-end flex gap-2">
                    {/*{isLoggedIn() && (*/}
                    {/*    <Button onClick={togglePinnedShops} size="sm" variant="outline">*/}
                    {/*        {showPin ? "Hide Pinned Shops" : "Show Pinned Shops"}*/}
                    {/*    </Button>*/}
                    {/*)}*/}
                    {isLoggedIn() && (
                        <Button sx={{fontWeight: 400}} className="text-sm px-3 py-1" size="sm"
                                onClick={handleCreateShop}>
                            Create Your Shop
                        </Button>
                    )}
                </div>
                <div style={{marginLeft:""}}>

<Breadcrumb currentTitle={'Shop Lists'} items={[{name:"Tasks & Bookings",href:""}]}/>
</div>
            </div>

            {/*{showPin && pinnedShops?.length > 0 && (*/}
            {/*    <div className="mt-4">*/}
            {/*        <h4 className="font-semibold mb-2">Pinned Shops</h4>*/}
            {/*        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">*/}
            {/*            {pinnedShops.map((shop) => (*/}
            {/*                <div key={shop.id} className="border p-4 rounded shadow">*/}
            {/*                    <img src={shop.image} alt={shop.name} className="h-32 w-full object-cover mb-2 rounded" />*/}
            {/*                    <h5 className="font-medium">{shop.name}</h5>*/}
            {/*                    <p className="text-sm text-gray-500">{shop.location}</p>*/}
            {/*                    <p className="text-sm">{shop.about}</p>*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}

            <div className="px-4 py-8">
                {isLoggedIn() && (
                    <Tabs
                        value={activeTab}
                        onTabChange={handleTabChange}
                        keepMounted={false}
                        className="mb-5"
                    >
                        <Tabs.List>
                            <Tabs.Tab value="allShops">All Shops</Tabs.Tab>
                            {isLoggedIn() && (
                                <Tabs.Tab value="myShop">My Shop</Tabs.Tab>
                            )}
                        </Tabs.List>
                    </Tabs>
                )}
                {verifyMerchant && maxShops > 0 && showAlert && activeTab === "myShop" &&(
                    <Alert
                        color={remainingShops > 0 ? "green" : "orange"}
                        sx={{
                            display : 'flex',
                            width: isMobile ? "100%" : "auto", // Full width on mobile, auto on desktop
                            textAlign: "left",
                            zIndex: 10,
                            flexShrink: 0,
                            backgroundColor: 'transparent',
                            padding: 0,
                        }}
                        // withCloseButton
                        // onClose={() => setShowAlert(false)}
                    >
                        <Flex align="center" gap="xs" styles={{marginRight: '1rem'}}>
                            <IoMdInformationCircleOutline
                                style={{
                                    fontSize: '1rem',
                                    color: remainingShops > 0 ? theme.colors.green[6] : theme.colors.orange[6],
                                    flexShrink: 0,
                                }}
                            />
                            <span
                                style={{
                                    color: remainingShops > 0 ? theme.colors.green[6] : theme.colors.orange[6],
                                }}
                            >
                              {remainingShops > 0
                                  ? `Note : You can create ${remainingShops} more shops${remainingShops === 1 ? "" : "s"} as a ${isPremium ? "premium" : "Basic"} user.`
                                  : `Note : You have reached the maximum shop creation limit of ${maxShops}. ${isPremium ? "Contact support at Homaale Team." : "Upgrade to premium to create more shops."}`}
                            </span>
                        </Flex>
                    </Alert>
                )}
                <div className="flex justify-between">
                    <ShopFilters
                        searchMerchant={searchMerchant}
                        setSearchMerchant={setSearchMerchant}
                        selectedCategory={selectedCategory}
                        // setSelectedCategory={setSelectedCategory}
                        setPage={setPage}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        minRating={minRating}
                        cities={cities}
                        // setCities={setCities}
                        selectedCity={selectedCity}
                        setSelectedCity={setSelectedCity}
                        setMinRating={setMinRating}
                        handleCategoryClick={() => setDrawerOpen(true)}
                        childCategoryId={childCategoryId}
                        childCategoryName={childCategoryName}
                        drawerContent={drawerContent}
                        drawerOpen={drawerOpen}
                        setDrawerOpen={setDrawerOpen}/>
                    {/*<Button*/}
                    {/*    onClick={clearAllFilters}*/}
                    {/*    variant="outline"*/}
                    {/*    size="sm"*/}
                    {/*>*/}
                    {/*    Clear Filters*/}
                    {/*</Button>*/}
                </div>


                <ShopTabs
                    allShops={showPin ? pinnedShops : allShops}
                    myShops={myShops}
                    onCreateShop={handleCreateShop}
                    activeTab={activeTab}
                    isLoading={loading}
                    fetchAllShops={fetchAllShops}
                    fetchMyShops={fetchMyShops}
                />
                <Pagination
                    radius={"lg"}
                    total={totalPages}
                    value={page}
                    onChange={setPage}
                    size="sm"
                    style={{marginTop: '16px', display: 'flex', justifyContent: 'center'}}
                />
            </div>
        </Layout>
    );
}
