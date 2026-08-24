import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Flex,
    Menu,
    Tooltip,
    useMantineTheme,
    Tabs,
    Drawer,
    Title
} from "@mantine/core";
import {
  IconBookmark,
  IconChevronDown,
  IconClearAll,
  IconCross,
  IconCube,
  IconGridDots,
  IconListCheck,
  IconMap2,
  IconShoppingBag,
  IconTools,
  IconUser,
  IconWorld,
    IconHome2 ,
} from "@tabler/icons-react";
import {useRouter} from "next/router";
import type {Dispatch, ReactNode, SetStateAction} from "react";
import {Dropdown} from "@/components/Dropdown/Dropdownmenu";
import {PriceFilterTypes} from "@/features/utils/filterSlice";
import {useAppSelector} from "@/hooks";
import {useUserStatus} from "@/hooks/useUserStatus";
import {isLoggedIn, isTokenExpired, useDark} from "@/utils/helpers";
import {useUser} from "@/hooks/useUser";
import {ExpandButton} from "../common/ExpandButton";
import {Filters} from "../common/Filters";
import {ResetButton} from "../common/ResetButton";
import Services from "@/pages/services";
import {Explore, Tasks, Service, Product} from "@/components/Dropdown/icon";
import CategorySidebar from "../CategorySidebar/CategorySidebar";
import {useSearchParams} from "next/navigation";
import { useMediaQuery } from '@mantine/hooks';
import { axiosClient } from '@/utils/axiosClient';
import urls from '@/constants/urls';
import type { NestedCategoryProps } from '@/types/NestedCategoryProps';
import Breadcrumb from '../common/BreadCrumb';
import type { BreadcrumbItems } from '@/types/BreadCrumbProps';
import Cookies from "js-cookie";
import {notifications} from "@mantine/notifications";
import {useProfile} from "@/hooks/useProfile";
import type {CmsProps} from "@/pages/products";
import {Hotel} from "lucide-react";
import Hotels from "@/components/merchant/ProfilePage/Hotels";

const EntityLayout: React.FC<{
    activeId: number;
    setActiveId: Dispatch<SetStateAction<number>>;
    isGrid?: boolean;
    setIsGrid?: Dispatch<SetStateAction<boolean>>;
    children: ReactNode;
    type: "task" | "service" | "booking" | "blogs" | "explore" | "products" | "hotels" | "My List" | "calendar";
     breadCrumbsItems?: BreadcrumbItems[];
     currentTitle:string;

}> = ({
          activeId,
          setActiveId,
          isGrid,
          setIsGrid,
          children,
          type,
          breadCrumbsItems,
          currentTitle


      }) => {
    const theme = useMantineTheme() || {};
    const {checkStatus} = useUserStatus();
    const router = useRouter();
    const is_explore = typeof window !== "undefined" && router.pathname === "/explore";
    const is_product = typeof window !== "undefined" && router.pathname === "/products";
    const is_booking = typeof window !== "undefined" && router.pathname === "/bookings";
    const is_myList = typeof window !== "undefined" && router.pathname === "/myList";
    const is_hotel = typeof window !== "undefined" && router.pathname === "/hotels/";
    const is_user = useUser();
    const is_dark = useDark()
    const {query} = useAppSelector((state) => state.filterReducer) || {query: {}};
    const [isMerchant, setIsMerchant]=useState<boolean>()
    const [tabValue, setTabValue] = useState<string>("active");
    const [canCreateProduct, setCanCreateProduct] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [currentProductCount, setCurrentProductCount] = useState<number>(0);
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [maxProducts, setMaxProducts] = useState<number>(0);
    const user = useProfile();
    const merchantId = user?.data && user?.data.user?.id;
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [categories, setCategories] = useState<NestedCategoryProps[]>([]);
    const [activeType, setActiveType] = useState<"task" | "service" | "booking" | "blogs"|"products"| "hotels"| "explore">("explore");
    const searchParams = useSearchParams(); // Get query params
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const typeParam = searchParams.get("type");
    const isMobile = useMediaQuery('(max-width: 768px)');
    const smallScreen = useMediaQuery("(max-width: 36em)");
    const { query: safeQuery } = router;
    const TASKS_ID = 1;
    const SERVICES_ID = 5;
    const EXPLORE_ID = 0;
    const PRODUCT_ID=4
    const HOTEL_ID=8
    const MY_LIST = 2;

    const verifyMerchant = isMerchant
    useEffect(() => {
        const fetchApiData = async () => {
            try {
                const response = await axiosClient.get(`/merchant/${merchantId}/`);
                // setProfile(response.data);
                setIsPremium(response.data.merchant_data.is_premium || false); // Set premium status
                setIsMerchant(response.data.is_merchant)
                console.log("ismerchant",response.data.is_merchant)
                // console.log("merchant data",response.data.merchant_data.is_premium)
            } catch (error) {
                // console.error("Error fetching data:", error);
                setIsPremium(false); // Default to false on error
            }
        };
        fetchApiData();
    }, [merchantId]);

    useEffect(() => {
        const fetchCmsLimit = async () => {
            if (!isMerchant) {
                setCanCreateProduct(false);
                setMaxProducts(0);
                setCurrentProductCount(0);
                return;
            }

            // if (!verifyMerchant) {
            //     // notifications.show({
            //     //     title: "You need to be merchant to use this feature",
            //     //     message: `need to be merchant to use this feature`,
            //     //     color: "orange",
            //     // });
            //     setCanCreateProduct(false);
            //     setMaxProducts(0);
            //     setCurrentProductCount(0);
            //     return;
            // }
            setLoading(true);
            try {
                // Fetch user products to get count
                const userProductsResponse = await axiosClient.get('/product/user-product/?page=1');
                const productCount = userProductsResponse.data.count ?? 0;
                setCurrentProductCount(productCount);

                console.log("product count",productCount)
                // Fetch CMS limits
                const cmsResponse = await axiosClient.get<CmsProps>("/merchant/cms-merchant-limits/");
                if (!cmsResponse.data.result || !Array.isArray(cmsResponse.data.result)) {
                    throw new Error("Invalid CMS response: result is missing or not an array");
                }

                // Select CMS data based on is_premium
                const cmsData = cmsResponse.data.result.find((item) => item.is_premium === isPremium);
                if (!cmsData) {
                    throw new Error(`No CMS data found for ${isPremium ? "premium" : "non-premium"} merchant`);
                }

                setMaxProducts(cmsData.max_products);
                console.log("max products ",cmsData.max_products)

                // Determine if user can create more products
                const canCreate = productCount < cmsData.max_products;
                setCanCreateProduct(canCreate);

                // Show notification based on remaining product limit
                const remainingProducts = cmsData.max_products - productCount;
                // if (!canCreate) {
                //     notifications.show({
                //         title: "Product Creation Limit Reached",
                //         message: `You have reached the maximum product limit (${cmsData.max_products}). ${
                //             isPremium ? "Contact support at Hommale Team." : "Upgrade to premium to create more products."
                //         }`,
                //         color: "orange",
                //     });
                // } else {
                //     notifications.show({
                //         title: "Product Creation Available",
                //         message: `You can create ${remainingProducts} more product${remainingProducts === 1 ? "" : "s"} as a ${
                //             isPremium ? "premium" : "free"
                //         } user.`,
                //         color: "green",
                //     });
                // }
            } catch (error) {
                console.error("CMS limit error:", error);
                setMaxProducts(0);
                setCurrentProductCount(0);
                setCanCreateProduct(false);
                // notifications.show({
                //     title: "Error",
                //     message: "Failed to fetch product limits. Contact support at Hommale Team.",
                //     color: "red",
                //     style: {
                //         position: 'fixed',
                //         top: '60px',
                //         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                //     },
                // });
            } finally {
                setLoading(false);
            }
        };

        fetchCmsLimit();
    }, [isMerchant, isPremium]);

    useEffect(() => {
        // Clear expired token on mount
        const access = Cookies.get("access");
        if (access && isTokenExpired(access)) {
            Cookies.remove("access");
        }

        // Check auth status
        const checkAuth = async () => {
            if (isLoggedIn()) {
                await checkStatus("kyc");
            }
            setIsAuthLoaded(true);
        };
        checkAuth();
    }, []);
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
        }
         else {
            setActiveId(EXPLORE_ID);
            setActiveType("explore");
        }
    }, [typeParam]);

    useEffect(() => {
        if (safeQuery.status_choice === "draft") {
            setTabValue("draft");
        } else if (safeQuery.status === "True") {
            setTabValue("active");
        } else if (safeQuery.status === "False") {
            setTabValue("inactive");
        } else {
            setTabValue("active");
        }
    }, [safeQuery]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axiosClient.get<NestedCategoryProps[]>(urls.category.nested);
                setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const options = [
        { value: EXPLORE_ID.toString(), label: "Show Task/Services", icon: <Explore /> },
        { value: TASKS_ID.toString(), label: "Show Tasks", icon: <Tasks />, name: "tasks" },
        { value: SERVICES_ID.toString(), label: "Show Services", icon: <Service />, name: "service" },
        {value:PRODUCT_ID.toString(),label:"Show Product",icon:<IconCube color="#868E96"/>,name:"products"},
        {value:HOTEL_ID.toString(),label:"Show Hotels",icon:<IconHome2  color="#868E96" />,name:"hotels"}
    ];
    const myListOptions = [
        {
            value: EXPLORE_ID.toString(), label: "Show Task/Services",
            icon: <Explore />
        },
        {
            value: TASKS_ID.toString(),
            label: "Show Tasks",
            icon: <Tasks />
        },
        {
            value: SERVICES_ID.toString(),
            label: "Show Services",
            icon: <Service />
        },
        {
            value: HOTEL_ID.toString(),
            label: "Show Hotels",
            icon: <IconHome2  color="#868E96" />
        },
    ];
    const handleTabChange = (value: string | null) => {
        const selectedId = parseInt(value ?? EXPLORE_ID.toString());
        setActiveId(selectedId);

        const type = selectedId === TASKS_ID ? "task" : selectedId === SERVICES_ID ? "service" :selectedId===PRODUCT_ID?"products": selectedId===HOTEL_ID?"hotels" :"explore";
        setActiveType(type as "service" | "explore" | "task"|"products" | "hotels");


        // Update URL with type param
        const newQuery = selectedId === TASKS_ID ? "?type=task" : selectedId === SERVICES_ID ? "?type=services" :selectedId===PRODUCT_ID?"?type=products": selectedId===HOTEL_ID?"?type=hotels":"";
        router.push(`/explore${newQuery}`, undefined, { shallow: true });
    };
    const handleTabChangeMyList = (value: string | null) => {
        const selectedId = parseInt(value ?? EXPLORE_ID.toString());
        setActiveId(selectedId);

        const type = selectedId === TASKS_ID ? "task" : selectedId === SERVICES_ID ? "service" : "explore";
        setActiveType(type as "service" | "explore" | "task");



        const newQuery = selectedId === TASKS_ID ? "?type=task" : selectedId === SERVICES_ID ? "?type=services" : "";

        router.push(`/myList${newQuery}`, undefined, { shallow: true });

        if (selectedId==PRODUCT_ID) {

          router.push("/products/")
        }
    };
    // console.log(activeId,"active ID from layout")
  // Adjusted toggleDrawer to support both event-based and no-arg calls
  const toggleDrawer = (open: boolean) => {
    return (event?: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
         (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setDrawerOpen(open);
    };
  };

  const closeDrawer = () => {
    // console.log("closeDrawer called");
    setDrawerOpen(false);
  };

    const handleCategoryClick = (context = {}) => {
        setDrawerOpen(true);
    };
  // Parameterless version for onClose
  // const closeDrawer = () => setDrawerOpen(false);

    const drawerContent = (

        <Box sx={{
            width: isMobile?"300px": 400, height: '100%', backgroundColor: is_dark ? theme.colors.dark[7]
                : theme.colors.homaaleSlate[0],
        }}>
            {/* <Box sx={{
                p: 2,
                borderBottom: '1px solid #ddd',
                // display: "end",
                justifyContent: 'space-between',
                alignItems: '',

                backgroundColor: is_dark ? theme.colors.dark[7]
                    : theme.colors.homaaleSlate[0],
                position: "relative",


            }}>

            </Box> */}
            <CategorySidebar closeDrawer={closeDrawer} />
        </Box>
    );

  const renderType = () => {
    switch (type) {
      case "task":
        return {
          title: "Tasks",
          listTitle: "My Task",
          is_requested: true,
          postTitle: (
            <Button
              sx={{ fontWeight: 400 }}
              onClick={() => {
                if (checkStatus("kyc")) {
                  router.push({
                    pathname: "/post/entity",
                    query: { is_requested: true },
                  });
                }
              }}
            >
              Post a Task
            </Button>
          ),
        };
      case "service":
        return {
          title: "Services",
          listTitle: "My Service",
          is_requested: false,
          postTitle: (
            <Button
              sx={{ fontWeight: 400 }}
              onClick={() => {
                if (checkStatus("kyc")) {
                  router.push({
                    pathname: "/post/entity",
                    query: { is_requested: false },
                  });
                }
              }}
            >
              Add a Service
            </Button>
          ),
        };
      case "products":
        return {
          title: "Products",
          listTitle: "My Service",
          is_requested: "product",
          postTitle: (
            <Button
              sx={{ fontWeight: 400 }}
              onClick={() => {
                if (checkStatus("kyc")) {
                  router.push({
                    pathname: "/post/entity",
                    query: { is_requested: "product" },
                  });
                }
              }}
            >
              Post a product
            </Button>
          ),
        };
        case "hotels":
            return {
                title: "Hotels",
                listTitle: "My Hotels",
                // is_requested: "product",
                postTitle: (
                    <Button
                        sx={{ fontWeight: 400 }}
                        onClick={() => {
                            if (checkStatus("kyc")) {
                                router.push({
                                    pathname: "/hotelForm",
                                    // query: { is_requested: "product" },
                                });
                            }
                        }}
                    >
                        Post a Hotel
                    </Button>
                ),
            };
      case "booking":
        return {
          // title: "Bookings",
          listTitle: "My bookings",
          is_requested: false,
          postTitle: null,
        };
      case "My List":
        return {
          title: "My List",
          listTitle: "My List",
          is_requested: null,
          postTitle: null,
        };
      case "calendar":
        return {
          title: "Calendar",
          listTitle: "My Calendar",
          is_requested: null,
          postTitle: null,
        };
      case "blogs":
        return {
          title: "Blogs",
          listTitle: "Blogs",
          is_requested: false,
          postTitle: null,
        };
      default:
        return {
          title: "Explore",
          listTitle: "My list",
          is_requested: null,
        };
    }
  };

    if (!isAuthLoaded) return null;
  return (
    <Box sx={{ position: 'relative' }}>



      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        position="right"

                size="l"
                zIndex={1000}
                withCloseButton={false}
                styles={{
                    content: {
                        backgroundColor: is_dark ? theme.colors.dark[7]
                            : theme.colors.homaaleSlate[0],
                    },
                    overlay: {
                        backgroundColor: '',
                    },
                }}
            >

                {drawerContent}
            </Drawer>


      <Flex
        justify="space-between"
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        mb={24}
        sx={{ paddingLeft: "" }}
      >
          <Flex align="center" gap={200}>
            <div>
              <h4>{renderType().title}</h4>
                {!smallScreen && currentTitle && (
                            <Breadcrumb
                                currentTitle={currentTitle}
                                items={breadCrumbsItems}
                            />
                        )}

            </div>


          </Flex>
        <Flex justify="space-between" align="start" gap={3} className="mt-3">
            {!is_product && setIsGrid && isMobile && !is_myList && (
                <Flex
                    gap={16}
                    py={5}
                    px={16}
                    sx={{
                        border: `1px solid #CED4DA`,
                        borderRadius: 4,
                        "& svg": {
                            cursor: "pointer",
                        },
                    }}
                >
                    <Tooltip withArrow label="Grid View" position="bottom">
                        <button
                            style={{ color: isGrid ? theme.colors?.brand?.[3] || '#FCA500' : theme.colors?.gray?.[6] || '#868E96' }}
                            onClick={() => setIsGrid && setIsGrid(true)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.5 5C9.91667 5.02083 10.2708 5.16667 10.5625 5.4375C10.8333 5.72917 10.9792 6.08333 11 6.5V10C10.9792 10.4167 10.8333 10.7708 10.5625 11.0625C10.2708 11.3333 9.91667 11.4792 9.5 11.5H5.5C5.08333 11.4792 4.72917 11.3333 4.4375 11.0625C4.16667 10.7708 4.02083 10.4167 4 10V6.5C4.02083 6.08333 4.16667 5.72917 4.4375 5.4375C4.72917 5.16667 5.08333 5.02083 5.5 5H9.5ZM9.5 6.5H5.5V10H9.5V6.5ZM9.5 12.5C9.91667 12.5208 10.2708 12.6667 10.5625 12.9375C10.8333 13.2292 10.9792 13.5833 11 14V17.5C10.9792 17.9167 10.8333 18.2708 10.5625 18.5625C10.2708 18.8333 9.91667 18.9792 9.5 19H5.5C5.08333 18.9792 4.72917 18.8333 4.4375 18.5625C4.16667 18.2708 4.02083 17.9167 4 17.5V14C4.02083 13.5833 4.16667 13.2292 4.4375 12.9375C4.72917 12.6667 5.08333 12.5208 5.5 12.5H9.5ZM9.5 14H5.5V17.5H9.5V14ZM12 6.5C12.0208 6.08333 12.1667 5.72917 12.4375 5.4375C12.7292 5.16667 13.0833 5.02083 13.5 5H18.5C18.9167 5.02083 19.2708 5.16667 19.5625 5.4375C19.8333 5.72917 19.9792 6.08333 20 6.5V7.5C19.9792 7.91667 19.8333 8.27083 19.5625 8.5625C19.2708 8.83333 18.9167 8.97917 18.5 9H13.5C13.0833 8.97917 12.7292 8.83333 12.4375 8.5625C12.1667 8.27083 12.0208 7.91667 12 7.5V6.5ZM13.5 7.5H18.5V6.5H13.5V7.5ZM18.5 10C18.9167 10.0208 19.2708 10.1667 19.5625 10.4375C19.8333 10.7292 19.9792 11.0833 20 11.5V12.5C19.9792 12.9167 19.8333 13.2708 19.5625 13.5625C19.2708 13.8333 18.9167 13.9792 18.5 14H13.5C13.0833 13.9792 12.7292 13.8333 12.4375 13.5625C12.1667 13.2708 12.0208 12.9167 12 12.5V11.5C12.0208 11.0833 12.1667 10.7292 12.4375 10.4375C12.7292 10.1667 13.0833 10.0208 13.5 10H18.5ZM18.5 11.5H13.5V12.5H18.5V11.5ZM12 16.5C12.0208 16.0833 12.1667 15.7292 12.4375 15.4375C12.7292 15.1667 13.0833 15.0208 13.5 15H18.5C18.9167 15.0208 19.2708 15.1667 19.5625 15.4375C19.8333 15.7292 19.9792 16.0833 20 16.5V17.5C19.9792 17.9167 19.8333 18.2708 19.5625 18.5625C19.2708 18.8333 18.9167 18.9792 18.5 19H13.5C13.0833 18.9792 12.7292 18.5625C12.1667 18.2708 12.0208 17.9167 12 17.5V16.5ZM13.5 17.5H18.5V16.5H13.5V17.5Z"/>
                            </svg>
                        </button>
                    </Tooltip>
                    <Tooltip withArrow label="Map View" position="bottom">
                        <button
                            style={{ color: !isGrid ? theme.colors?.brand?.[3] || '#FCA500' : theme.colors?.gray?.[6] || '#868E96' }}
                            onClick={() => setIsGrid && setIsGrid(false)}
                        >
                            <svg width="18" height="17" viewBox="0 0 18 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.75 3.71875C12.75 4.01042 12.6875 4.32292 12.5625 4.65625C12.3958 5.21875 12.125 5.83333 11.75 6.5V6.46875C11.6458 6.65625 11.5417 6.83333 11.4375 7C11.375 7.08333 11.3125 7.16667 11.25 7.25C11.1667 7.375 11.0833 7.51042 11 7.65625C10.3958 8.53125 9.88542 9.21875 9.46875 9.71875C9.34375 9.88542 9.1875 9.96875 9 9.96875C8.8125 9.96875 8.65625 9.88542 8.53125 9.71875C8.11458 9.21875 7.60417 8.53125 7 7.65625C6.39583 6.78125 5.90625 5.90625 5.53125 5.03125C5.51042 4.96875 5.47917 4.90625 5.4375 4.84375C5.3125 4.44792 5.25 4.08333 5.25 3.75C5.25 3.60417 5.26042 3.45833 5.28125 3.3125C5.40625 2.35417 5.8125 1.57292 6.5 0.96875C7.1875 0.34375 8.02083 0.0208333 9 0C10.0625 0.0208333 10.9479 0.385417 11.6562 1.09375C12.3646 1.80208 12.7292 2.6875 12.75 3.75V3.71875ZM9 4.71875C9.35417 4.71875 9.64583 4.60417 9.875 4.375C10.125 4.14583 10.25 3.84375 10.25 3.46875C10.25 3.13542 10.125 2.84375 9.875 2.59375C9.64583 2.36458 9.35417 2.23958 9 2.21875C8.64583 2.23958 8.35417 2.36458 8.125 2.59375C7.875 2.84375 7.75 3.13542 7.75 3.46875C7.75 3.84375 7.875 4.14583 8.125 4.375C8.35417 4.60417 8.64583 4.71875 9 4.71875ZM11 9.40625C11.4375 8.82292 11.8854 8.16667 12.3438 7.4375C12.3646 7.39583 12.3854 7.35417 12.4062 7.3125C12.4479 7.27083 12.4792 7.22917 12.5 7.1875V14.1875L16.5 12.7188V4.8125L13.0938 6.0625C13.1771 5.91667 13.25 5.77083 13.3125 5.625C13.5 5.1875 13.6354 4.72917 13.7188 4.25L17 3.03125C17.25 2.96875 17.4792 3 17.6875 3.125C17.8958 3.29167 18 3.48958 18 3.71875V13.25C17.9792 13.5833 17.8125 13.8229 17.5 13.9688L12 15.9688C11.8333 16.0104 11.6667 16.0104 11.5 15.9688L6.25 14.0625L1 15.9688C0.770833 16.0312 0.541667 16 0.3125 15.875C0.104167 15.7083 0 15.5 0 15.25V5.71875C0.0208333 5.40625 0.1875 5.17708 0.5 5.03125L4.25 3.6875C4.25 3.6875 4.25 3.69792 4.25 3.71875C4.27083 4.21875 4.36458 4.70833 4.53125 5.1875L1.5 6.28125V14.1875L5.5 12.7188V7.1875C5.52083 7.22917 5.55208 7.27083 5.59375 7.3125C5.61458 7.35417 5.63542 7.39583 5.65625 7.4375C6.11458 8.16667 6.5625 8.82292 7 9.40625V12.7188L11 14.1875V9.40625Z"/>
                            </svg>
                        </button>
                    </Tooltip>
                </Flex>
            )}
            {/*{!is_myList && !is_product && isLoggedIn() && type !== "booking" && !isMobile && (*/}
            {/*    <ExpandButton*/}
            {/*        style={{borderRadius: "unset"}}*/}
            {/*        is_expandable*/}
            {/*        id={3}*/}
            {/*        activeId={activeId}*/}
            {/*        setActiveId={setActiveId}*/}
            {/*        icon={<IconBookmark size={20}/>}*/}
            {/*        color={theme.colors?.gray?.[6] || '#ccc'}*/}
            {/*        isMobile={isMobile}*/}
            {/*        title="Bookmark"*/}
            {/*    />*/}
            {/*)}*/}

            <Flex className="gap-1">
                {!is_explore && !is_product && !is_booking && isLoggedIn() && (
                    <Menu position="bottom-end">
                        <Menu.Target>
                            <Button
                                style={{
                                    border: "1px solid lightgrey",
                                    height: "35px",
                                    borderRadius: "4px",
                                    fontWeight: 500,
                                    fontSize: "12px",
                                    lineHeight: "14.52px",
                                    display: "flex",
                                    flexDirection: "row" as const,
                                    justifyContent: "center",
                                    maxWidth: "175px",
                                    width: "100%",
                                    minWidth: isMobile ? "130px" : "80px",
                                }}
                            >
                                {renderType().postTitle || "Post"}
                              <IconChevronDown size={16} />
                          </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                          {[
                              { icon: <Tasks />, type: "task", postTitle: "Add a Task", query: { is_requested: true } },
                              { icon: <Service />, type: "service", postTitle: "Add a Service", query: { is_requested: false } },
                              { icon: <Product />, type: "product", postTitle: "Add a product", query: { type: "product" } },
                          ].map((item) => (
                              <Menu.Item
                                  key={item.type}
                                  onClick={() => {
                                      if (item.type === "product") {
                                          if (!verifyMerchant) {
                                              notifications.show({
                                                  title: "Merchant Access Required",
                                                  message: "You must be a merchant to use this feature.",
                                                  color: "red",
                                                  styles: (theme) => ({
                                                      root: {
                                                          position: "fixed",
                                                          top: 60,
                                                          left: "50%",
                                                          transform: "translateX(-50%)",
                                                          maxWidth: isMobile ? "90%" : 500,
                                                          zIndex: 1000,
                                                          boxShadow: theme.shadows.md,
                                                          borderRadius: theme.radius.md,
                                                          textAlign: "center",
                                                      },
                                                  }),
                                              });
                                              return;
                                          }

                                          if (!canCreateProduct) {
                                              notifications.show({
                                                  title: "Action Restricted",
                                                  message: `You cannot create a new Product. You have reached the maximum Product limit (${maxProducts}). ${
                                                      !isPremium ? "Upgrade to a premium account to create more Products." : ""
                                                  }`,
                                                  color: "red",
                                                  style: {
                                                      position: "fixed",
                                                      top: "60px",
                                                      right: "20px",
                                                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                                  },
                                              });
                                              return; // Stop routing
                                          }
                                      }

                                      // Only navigate if all checks pass
                                      if (checkStatus("kyc")) {
                                          router.push({
                                              pathname: "/post/entity",
                                              query: item.query,
                                          });
                                      }
                                  }}
                              >
                                  <Flex gap="xs" justify={"start"} >
                                      {item.icon}
                                      {item.postTitle}
                                  </Flex>
                              </Menu.Item>
                          ))}
                      </Menu.Dropdown>
                  </Menu>
              )}
              {is_explore && isMobile && (
                  <Flex>
                      <Menu>
                          <Menu.Target>
                              <Button
                                  style={{
                                      backgroundColor: is_dark ? "black" : "white",
                                      color: is_dark ? "grey" : "black",
                                      border: "1px solid lightgrey",
                                      height: "35px",
                                      borderRadius: "4px",
                                      fontWeight: 500,
                                      fontSize: "12px",
                                      lineHeight: "14.52px",
                                      zIndex: 1
                                  }}
                              >
                                  {options.find((option) => option.value === activeId?.toString())?.label || "Show Task/Services"}
                                  <IconChevronDown />
                              </Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                              {options.map((option) => (
                                  <Menu.Item
                                      key={option.value}
                                      onClick={() => handleTabChange(option.value)}
                                     icon={<div style={{ transition: "transform 0.3s ease" }}>{option.icon}</div>}
                                      sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          "&:hover": { color: theme.colors.brand[4], transition: "background-color 0.3s ease, color 0.3s ease" },
                                          "&:hover .icon": { transform: "scale(1.1)" ,color:theme.colors.brand[4]},
                                      }}
                                  >
                                      {option.label}
                                  </Menu.Item>
                              ))}
                          </Menu.Dropdown>
                      </Menu>
                  </Flex>
              )}
              {is_myList && isMobile && (
                  <Flex>
                      <Menu>
                          <Menu.Target>
                              <Button
                                  style={{
                                      backgroundColor:is_dark?theme.colors.dark[7]
                                          : theme.colors.homaaleSlate[0],
                                      color:is_dark?"grey": "black",
                                      border: `1px solid ${is_dark?"":'lightgrey'}`,
                                      height: "35px",
                                      borderRadius: "4px",
                                      fontWeight: 500,
                                      fontSize: "12px",
                                      lineHeight: "14.52px",
                                      zIndex:1
                                  }}
                              >
                                  {/* Display the selected option label */}
                                  {myListOptions.find((myListOptions) => myListOptions.value === activeId?.toString())?.label || "Show Task/Services"}
                                  <IconChevronDown />
                              </Button>
                          </Menu.Target>

                          <Menu.Dropdown>
                              {myListOptions.map((myListOptions) => (
                                  <Menu.Item
                                      key={myListOptions.value}
                                      onClick={() => handleTabChangeMyList(myListOptions.value)}
                                      // icon={option.icon}
                                      // sx={{
                                      //     '&:hover': {
                                      //         transition: ' color 0.3s ease',
                                      //         color: 'orange',  // Optional: change text color when hovered
                                      //     },
                                      // }}
                                      icon={
                                          <div
                                              style={{
                                                  transition: 'transform 0.3s ease',  // Add transition for icon hover effect
                                              }}
                                          >
                                              {myListOptions.icon}
                                          </div>
                                      }
                                      sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          '&:hover': {
                                              color: 'orange',  // Change text color to white on hover
                                              transition: 'background-color 0.3s ease, color 0.3s ease',  // Add transition for smooth effect
                                          },
                                          '&:hover .icon': {
                                              transform: 'scale(1.1)',  // Slightly scale up the icon on hover
                                          },
                                      }}
                                  >
                                      {myListOptions.label}
                                  </Menu.Item>
                              ))}
                          </Menu.Dropdown>
                      </Menu>
                  </Flex>
              )}
          </Flex>

          {!is_product && setIsGrid && !isMobile && !is_myList && (
              <Flex
                  gap={16}
                  py={5}
                  px={16}
                  sx={{
                      border: `1px solid #CED4DA`,
                      borderRadius: 4,
                      "& svg": {
                          cursor: "pointer",
                      },
                  }}
              >
                  <Tooltip withArrow label="Grid View" position="bottom">
                      <button
                          style={{ color: isGrid ? theme.colors?.brand?.[3] || '#FCA500' : theme.colors?.gray?.[6] || '#868E96' }}
                          onClick={() => setIsGrid && setIsGrid(true)}
                      >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.5 5C9.91667 5.02083 10.2708 5.16667 10.5625 5.4375C10.8333 5.72917 10.9792 6.08333 11 6.5V10C10.9792 10.4167 10.8333 10.7708 10.5625 11.0625C10.2708 11.3333 9.91667 11.4792 9.5 11.5H5.5C5.08333 11.4792 4.72917 11.3333 4.4375 11.0625C4.16667 10.7708 4.02083 10.4167 4 10V6.5C4.02083 6.08333 4.16667 5.72917 4.4375 5.4375C4.72917 5.16667 5.08333 5.02083 5.5 5H9.5ZM9.5 6.5H5.5V10H9.5V6.5ZM9.5 12.5C9.91667 12.5208 10.2708 12.6667 10.5625 12.9375C10.8333 13.2292 10.9792 13.5833 11 14V17.5C10.9792 17.9167 10.8333 18.2708 10.5625 18.5625C10.2708 18.8333 9.91667 18.9792 9.5 19H5.5C5.08333 18.9792 4.72917 18.8333 4.4375 18.5625C4.16667 18.2708 4.02083 17.9167 4 17.5V14C4.02083 13.5833 4.16667 13.2292 4.4375 12.9375C4.72917 12.6667 5.08333 12.5208 5.5 12.5H9.5ZM9.5 14H5.5V17.5H9.5V14ZM12 6.5C12.0208 6.08333 12.1667 5.72917 12.4375 5.4375C12.7292 5.16667 13.0833 5.02083 13.5 5H18.5C18.9167 5.02083 19.2708 5.16667 19.5625 5.4375C19.8333 5.72917 19.9792 6.08333 20 6.5V7.5C19.9792 7.91667 19.8333 8.27083 19.5625 8.5625C19.2708 8.83333 18.9167 8.97917 18.5 9H13.5C13.0833 8.97917 12.7292 8.83333 12.4375 8.5625C12.1667 8.27083 12.0208 7.91667 12 7.5V6.5ZM13.5 7.5H18.5V6.5H13.5V7.5ZM18.5 10C18.9167 10.0208 19.2708 10.1667 19.5625 10.4375C19.8333 10.7292 19.9792 11.0833 20 11.5V12.5C19.9792 12.9167 19.8333 13.2708 19.5625 13.5625C19.2708 13.8333 18.9167 13.9792 18.5 14H13.5C13.0833 13.9792 12.7292 13.8333 12.4375 13.5625C12.1667 13.2708 12.0208 12.9167 12 12.5V11.5C12.0208 11.0833 12.1667 10.7292 12.4375 10.4375C12.7292 10.1667 13.0833 10.0208 13.5 10H18.5ZM18.5 11.5H13.5V12.5H18.5V11.5ZM12 16.5C12.0208 16.0833 12.1667 15.7292 12.4375 15.4375C12.7292 15.1667 13.0833 15.0208 13.5 15H18.5C18.9167 15.0208 19.2708 15.1667 19.5625 15.4375C19.8333 15.7292 19.9792 16.0833 20 16.5V17.5C19.9792 17.9167 19.8333 18.2708 19.5625 18.5625C19.2708 18.8333 18.9167 18.9792 18.5 19H13.5C13.0833 18.9792 12.7292 18.5625C12.1667 18.2708 12.0208 17.9167 12 17.5V16.5ZM13.5 17.5H18.5V16.5H13.5V17.5Z"/>
                          </svg>
                      </button>
                  </Tooltip>
                  <Tooltip withArrow label="Map View" position="bottom">
                      <button
                          style={{ color: !isGrid ? theme.colors?.brand?.[3] || '#FCA500' : theme.colors?.gray?.[6] || '#868E96' }}
                          onClick={() => setIsGrid && setIsGrid(false)}
                      >
                          <svg width="18" height="17" viewBox="0 0 18 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.75 3.71875C12.75 4.01042 12.6875 4.32292 12.5625 4.65625C12.3958 5.21875 12.125 5.83333 11.75 6.5V6.46875C11.6458 6.65625 11.5417 6.83333 11.4375 7C11.375 7.08333 11.3125 7.16667 11.25 7.25C11.1667 7.375 11.0833 7.51042 11 7.65625C10.3958 8.53125 9.88542 9.21875 9.46875 9.71875C9.34375 9.88542 9.1875 9.96875 9 9.96875C8.8125 9.96875 8.65625 9.88542 8.53125 9.71875C8.11458 9.21875 7.60417 8.53125 7 7.65625C6.39583 6.78125 5.90625 5.90625 5.53125 5.03125C5.51042 4.96875 5.47917 4.90625 5.4375 4.84375C5.3125 4.44792 5.25 4.08333 5.25 3.75C5.25 3.60417 5.26042 3.45833 5.28125 3.3125C5.40625 2.35417 5.8125 1.57292 6.5 0.96875C7.1875 0.34375 8.02083 0.0208333 9 0C10.0625 0.0208333 10.9479 0.385417 11.6562 1.09375C12.3646 1.80208 12.7292 2.6875 12.75 3.75V3.71875ZM9 4.71875C9.35417 4.71875 9.64583 4.60417 9.875 4.375C10.125 4.14583 10.25 3.84375 10.25 3.46875C10.25 3.13542 10.125 2.84375 9.875 2.59375C9.64583 2.36458 9.35417 2.23958 9 2.21875C8.64583 2.23958 8.35417 2.36458 8.125 2.59375C7.875 2.84375 7.75 3.13542 7.75 3.46875C7.75 3.84375 7.875 4.14583 8.125 4.375C8.35417 4.60417 8.64583 4.71875 9 4.71875ZM11 9.40625C11.4375 8.82292 11.8854 8.16667 12.3438 7.4375C12.3646 7.39583 12.3854 7.35417 12.4062 7.3125C12.4479 7.27083 12.4792 7.22917 12.5 7.1875V14.1875L16.5 12.7188V4.8125L13.0938 6.0625C13.1771 5.91667 13.25 5.77083 13.3125 5.625C13.5 5.1875 13.6354 4.72917 13.7188 4.25L17 3.03125C17.25 2.96875 17.4792 3 17.6875 3.125C17.8958 3.29167 18 3.48958 18 3.71875V13.25C17.9792 13.5833 17.8125 13.8229 17.5 13.9688L12 15.9688C11.8333 16.0104 11.6667 16.0104 11.5 15.9688L6.25 14.0625L1 15.9688C0.770833 16.0312 0.541667 16 0.3125 15.875C0.104167 15.7083 0 15.5 0 15.25V5.71875C0.0208333 5.40625 0.1875 5.17708 0.5 5.03125L4.25 3.6875C4.25 3.6875 4.25 3.69792 4.25 3.71875C4.27083 4.21875 4.36458 4.70833 4.53125 5.1875L1.5 6.28125V14.1875L5.5 12.7188V7.1875C5.52083 7.22917 5.55208 7.27083 5.59375 7.3125C5.61458 7.35417 5.63542 7.39583 5.65625 7.4375C6.11458 8.16667 6.5625 8.82292 7 9.40625V12.7188L11 14.1875V9.40625Z"/>
                          </svg>
                      </button>
                  </Tooltip>
              </Flex>
          )}
            {!is_myList && !is_product && isLoggedIn() && type !== "booking" && (
                <ExpandButton
                    style={{borderRadius: "unset"}}
                    is_expandable
                    id={3}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    icon={<IconBookmark size={20}/>}
                    color={theme.colors?.gray?.[6] || '#ccc'}
                    isMobile={isMobile}
                    explore={true}
                    title="Bookmark"
                />
            )}
        </Flex>
      </Flex>

        {is_myList && (
            <Tabs
                value={tabValue}
                onTabChange={(value) => {
                    setTabValue(value as string);
                    try {
                        const newQuery = { ...safeQuery };
                        delete newQuery.status;
                        delete newQuery.status_choice;
                        if (value === "draft") {
                            newQuery.status_choice = "draft";
                        } else if (value === "active") {
                            newQuery.status = "True";
                        } else if (value === "inactive") {
                            newQuery.status = "False";
                        }
                        router.push(
                            { pathname: router.pathname, query: newQuery },
                            undefined,
                            { shallow: true }
                        );
                    } catch (error) {
                        console.error("Failed to navigate to tab:", error);
                    }
                }}
                defaultValue="active"
                className="mt-4"
                styles={{
                    tab: {
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        "&[data-active]": { color: theme.colors.brand[4] },
                        "&:hover": { color: theme.colors.brand[4] },
                    },
                    tabsList: { borderBottom: `1px solid ${theme.colors?.gray?.[3] || "#ccc"}` },
                }}
            >
                <Tabs.List>
                    <Tabs.Tab value="active" pb="xs">
                        Active
                    </Tabs.Tab>
                    <Tabs.Tab value="inactive">
                        Inactive
                    </Tabs.Tab>
                    <Tabs.Tab value="draft">
                        Draft
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>
        )}


      <Flex
        style={{ width: "100%" }}
        justify="space-between"
        align={{ base: "flex-start", md: "baseline" }}
        direction={{ base: "column-reverse", md: "row" }}
        mt={20}
        gap={{ base: 10, md: 80 }}
      >
        <Filters
          search
          services={type!=="products"}
          sortBudget={type !== "booking"}
          sortDate
          category
          handleClick={() => handleCategoryClick({ action: "filterChange" })}
          location={type === "booking"||type==="products" ? false : true}
          statusFilter={type === "booking" ? true : false}
          statusType="booking"
          filterBudget
          priceType={
            type === "booking"
              ? activeId === 2
                ? PriceFilterTypes.price
                : PriceFilterTypes.earning
              : type === "service"
              ? activeId === 2
                ? PriceFilterTypes.budget
                : PriceFilterTypes.payable
              : activeId === 2
              ? PriceFilterTypes.payable
              : PriceFilterTypes.budget
          }
        />

        {/*<Flex*/}
        {/*  align="baseline"*/}
        {/*  justify="space-between"*/}
        {/*  direction={{ base: "row-reverse", md: "row" }}*/}
        {/*  gap={20}*/}
        {/*>*/}
        {/*  {query && <ResetButton />}*/}
        {/*  <Flex gap="sm">*/}
        {/*    <ExpandButton*/}
        {/*      style={{ visibility: "hidden" }}*/}
        {/*      is_expandable*/}
        {/*      id={1}*/}
        {/*      activeId={activeId}*/}
        {/*      setActiveId={setActiveId}*/}
        {/*      icon={type === "booking" ? <IconListCheck size={20} /> : <IconWorld size={20} />}*/}
        {/*      color={theme.colors?.gray?.[6] || '#ccc'}*/}
        {/*      title={type === "booking" ? "To Do's" : "Explore"}*/}
        {/*    />*/}
        {/*    {isLoggedIn() && !is_explore && !is_myList && !is_booking && (*/}
        {/*      <ExpandButton*/}
        {/*        is_expandable*/}
        {/*        id={2}*/}
        {/*        activeId={activeId}*/}
        {/*        setActiveId={setActiveId}*/}
        {/*        icon={<IconUser size={20} />}*/}
        {/*        color={theme.colors?.gray?.[6] || '#ccc'}*/}
        {/*        title={*/}
        {/*          type === "booking"*/}
        {/*            ? "My Booking"*/}
        {/*            : renderType().listTitle*/}
        {/*            ? "My Bookings"*/}
        {/*            : renderType().listTitle*/}
        {/*        }*/}
        {/*      />*/}
        {/*    )}*/}
        {/*  </Flex>*/}
        {/*</Flex>*/}
          {is_explore && !isMobile && (
          <Flex>
              <Menu>
                  <Menu.Target>
                      <Button
                          style={{
                              backgroundColor: is_dark ? "black" : "white",
                              color: is_dark ? "grey" : "black",
                              border: "1px solid lightgrey",
                              height: "35px",
                              borderRadius: "4px",
                              fontWeight: 500,
                              fontSize: "12px",
                              lineHeight: "14.52px",
                              zIndex: 1
                          }}
                      >
                          {options.find((option) => option.value === activeId?.toString())?.label || "Show Task/Services"}
                          <IconChevronDown />
                      </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                      {options.map((option) => (
                          <Menu.Item
                              key={option.value}
                              onClick={() => handleTabChange(option.value)}
                              icon={<div style={{ transition: "transform 0.3s ease" }}>{option.icon}</div>}
                              sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  "&:hover": { color: theme.colors.brand[4], transition: "background-color 0.3s ease, color 0.3s ease" },
                                  "&:hover .icon": { transform: "scale(1.1)",color:theme.colors.brand[4] },
                              }}
                          >
                              {option.label}
                          </Menu.Item>
                      ))}
                  </Menu.Dropdown>
              </Menu>
          </Flex>
          )}
          {is_myList && !isMobile && (
              <Flex>
                  <Menu>
                      <Menu.Target>
                          <Button
                              style={{
                                  backgroundColor:is_dark?theme.colors.dark[7]
                                      : theme.colors.homaaleSlate[0],
                                  color:is_dark?"grey": "black",
                                  border: `1px solid ${is_dark?"":'lightgrey'}`,
                                  height: "35px",
                                  borderRadius: "4px",
                                  fontWeight: 500,
                                  fontSize: "12px",
                                  lineHeight: "14.52px",
                                  zIndex:1
                              }}
                          >
                              {/* Display the selected option label */}
                              {myListOptions.find((myListOptions) => myListOptions.value === activeId?.toString())?.label || "Show Task/Services"}
                              <IconChevronDown />
                          </Button>
                      </Menu.Target>

                      <Menu.Dropdown>
                          {myListOptions.map((myListOptions) => (
                              <Menu.Item
                                  key={myListOptions.value}
                                  onClick={() => handleTabChangeMyList(myListOptions.value)}
                                  // icon={option.icon}
                                  // sx={{
                                  //     '&:hover': {
                                  //         transition: ' color 0.3s ease',
                                  //         color: 'orange',  // Optional: change text color when hovered
                                  //     },
                                  // }}
                                  icon={
                                      <div
                                          style={{
                                              transition: 'transform 0.3s ease',  // Add transition for icon hover effect
                                          }}
                                      >
                                          {myListOptions.icon}
                                      </div>
                                  }
                                  sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      '&:hover': {
                                          color: 'orange',  // Change text color to white on hover
                                          transition: 'background-color 0.3s ease, color 0.3s ease',  // Add transition for smooth effect
                                      },
                                      '&:hover .icon': {
                                          transform: 'scale(1.1)',  // Slightly scale up the icon on hover
                                      },
                                  }}
                              >
                                  {myListOptions.label}
                              </Menu.Item>
                          ))}
                      </Menu.Dropdown>
                  </Menu>
              </Flex>
          )}
      </Flex>
      {children}
    </Box>
  );
};

export default EntityLayout;
// export async function getStaticProps() {
//   try {
//     const { data } = await axiosClient.get(urls.category.nested);
//     return {
//       props: {
//         categories: data, // Pass fetched categories to the page
//       },
//       revalidate: 60, // Revalidate every 60 seconds
//     };
//   } catch (err) {
//     console.error('Error fetching categories:', err);
//     return {
//       props: {
//         categories: [], // Fallback to empty array on error
//       },
//       revalidate: 60,
//     };
//   }
// }
