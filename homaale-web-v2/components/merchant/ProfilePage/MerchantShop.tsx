
import { axiosClient } from '@/utils/axiosClient';
import { Group, Title, useMantineTheme, Button, Box, Tooltip } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useDark } from '@/utils/helpers';
import { ShopCard } from '@/components/shops/ShopCard';
import { homaaleColors } from '@/theme/GlobalTheme';
import { useRouter } from 'next/router';
import Link from "next/link";
import {FiPlus} from "react-icons/fi";
import {GrAnalytics} from "react-icons/gr";
import ShopAnalytics from "@/components/merchant/ProfilePage/ShopAnalytics";
import {notifications} from "@mantine/notifications";
import {useUserStatus} from "@/hooks/useUserStatus";
import {useProfile} from "@/hooks/useProfile";
import {CmsProps, ShopResponse} from "@/pages/shops";
import {useUser} from "@/hooks/useUser";

interface Shop {
  id: string;
  name: string;
  about: string;
  location: string;
  status: string;
  images: Array<{
    id: number;
    image: string;
    uploaded_at: string;
  }>;
}

interface ApiResponse {
  results: Shop[];
}

interface MerchantShopProps {
  id: string;
  hasPermission: boolean;
}

const MerchantShop = ({ id, hasPermission }: MerchantShopProps) => {
  const [merchantShop, setMerchantShop] = useState<Shop[]>([]);
  const [viewAll, setViewAll] = useState(false);
  const dark = useDark();
  const theme = useMantineTheme();
  const router = useRouter();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const {data : profileData} = useProfile();
  const user = useUser()
  const verifyMerchant = profileData?.merchant_data?.[0]?.is_premium;
  const [loading, setLoading] = useState<boolean>(false);
  const [canCreateShop, setCanCreateShop] = useState<boolean>(false);
  const [maxShops, setMaxShops] = useState<number>(0);
  const [currentShopCount, setCurrentShopCount] = useState<number>(0)
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const myMerchant= user.data?.id===id
  const [merchantData , setMerchantData] = useState(undefined);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axiosClient.get<ApiResponse>(`/product/shops?user_id=${id}`);
        setMerchantShop(response.data.results || []);
        // console.log('shop from merchant', response.data.results);
      } catch (error) {
        console.error('Error fetching shop data:', error);
      }
    };
    fetchShops();
  }, [id]);

  const handleViewAll = () => {
    setViewAll((prev) => !prev);
  };

    useEffect(() => {
        const fetchApiData = async () => {
            try {
                const response = await axiosClient.get(`/merchant/${id}/`);
                // setProfile(response.data);
                setMerchantData(response.data.merchant_data.id);
                // console.log("merchant data",response.data)
                setIsPremium(response.data.merchant_data.is_premium );
                // console.log("merchant data",response.data.merchant_data.is_premium)
            } catch (error) {
                // console.error("Error fetching data:", error);
                setIsPremium(false); // Default to false on error
            }
        };
        fetchApiData();
    }, [id]);

    useEffect(() => {
        const fetchCmsLimit = async () => {
            if (!verifyMerchant) {
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
                console.log("CMS API Response:", cmsResponse.data);

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
                // console.log("max shop in shop merchant", maxShops);

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
    }, [maxShops , isPremium]);

    const handleAddShop = () => {

        if (canCreateShop) {
            router.push({ pathname: "/formShop" });
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


  return (
    <div
      className="w-full drop-shadow-md mt-5 mx-auto p-4 shadow-sm rounded-2xl overflow-hidden"
      style={{
        marginTop: '20px',
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        backgroundColor: dark ? theme.colors.dark[6] : '#fff',
      }}
    >
      {/* Header */}
      <Group position="apart" className="mb-6">
        <Title order={2} size="h3" style={{ color: dark ? '#E5E7EB' : '#374151' }}>
          Shops
        </Title>
    { merchantShop.length!==0 &&
        <div className="flex gap-2">
            {/*// <Box style={{}}>*/}
            { hasPermission && (
                <Tooltip label={"Analytics"} position={"top"}>
                    <Button
                          sx={{
                            color:theme.colors.brand[4],
                            background:"transparent",
                            '&:hover': {
                            color: theme.colors.brand[4],
                            background:"transparent" // Mantine theme color for hover
                            },
                        }}
                        variant="subtle"
                        className="text-gray-600  p-2 rounded-full flex items-center gap-1"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                    >
                        <GrAnalytics className="w-5 h-5"/>
                    </Button>
                </Tooltip>
            )}
            {hasPermission && (
                <Tooltip label={"Add Shop"} position={"top"}>
                    <Button
                          sx={{
                            color:theme.colors.brand[4],
                            background:"transparent",
                            '&:hover': {
                            color: theme.colors.brand[4],
                            background:"transparent" // Mantine theme color for hover
                            },
                        }}
                        variant="subtle"

                    className="text-gray-600 p-2 rounded-full gap-1"
                        // style={{marginRight:"10px", fontWeight:100 }}
                            onClick={handleAddShop}>
                        <FiPlus className="w-5 h-5"/>
                    </Button>
                </Tooltip>
            )}
            <Button
                className="px-4 py-2 bg-[#FFCA6A] rounded text-black  "
                onClick={handleViewAll}
                style={{fontWeight: 100}}
            >
                {viewAll ? 'View Less' : 'View All'}
            </Button>


            {/*</Box>*/}

        </div>
    }
      </Group>

        {/* Shops Grid or Empty State */}
        {showAnalytics ? (
            <ShopAnalytics/>
        ) : merchantShop.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(viewAll ? merchantShop : merchantShop.slice(0, 3)).map((item, index) => (
            <div key={index}>
                <Link href={`/shops/${item.id}`} key={index}>
                  <ShopCard
                    image={item.images[0]?.image}
                    title={item.name}
                    rating={0}
                    about={item.about}
                    location={item.location}
                    status={item.status}
                  />
                </Link>
            </div>
          ))}
        </div>
      ) : (
            <div
                style={{
                    backgroundColor: dark ? theme.colors.dark[6] : '#fff',
                    color: dark ? 'gray' : '',
                    borderRadius: '10px',
                }}
                className="w-full border p-4 flex flex-col sm:flex-row items-center justify-between col-span-full gap-4 max-w-full mx-auto"
            >
                <div className="w-full flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                            width="36"
                            height="40"
                            viewBox="0 0 36 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7.375 13.75H28.625C28.9896 13.6979 29.1979 13.4896 29.25 13.125V10.625C29.1979 10.2604 28.9896 10.0521 28.625 10H28C27.9479 8.17708 27.4531 6.5625 26.5156 5.15625C25.526 3.75 24.224 2.70833 22.6094 2.03125L20.5 6.25V1.25C20.4479 0.46875 20.0312 0.0520833 19.25 0H16.75C15.9688 0.0520833 15.5521 0.46875 15.5 1.25V6.25L13.3906 2.03125C11.776 2.70833 10.474 3.75 9.48438 5.15625C8.54688 6.5625 8.05208 8.17708 8 10H7.375C7.01042 10.0521 6.80208 10.2604 6.75 10.625V13.0469C6.80208 13.5156 7.01042 13.75 7.375 13.75ZM18 21.25C16.4896 21.1979 15.1615 20.7292 14.0156 19.8438C12.9219 18.9062 12.2188 17.7083 11.9062 16.25H8.15625C8.52083 18.75 9.58854 20.8333 11.3594 22.5C13.1823 24.1146 15.3958 24.9479 18 25C20.6042 24.9479 22.8177 24.1146 24.6406 22.5C26.4115 20.8333 27.4792 18.75 27.8438 16.25H24.0938C23.7812 17.7083 23.0521 18.9062 21.9062 19.8438C20.8125 20.7292 19.5104 21.1979 18 21.25ZM25.1094 27.5H10.8906C7.97396 27.5521 5.52604 28.5677 3.54688 30.5469C1.56771 32.526 0.552083 34.974 0.5 37.8906C0.604167 39.1927 1.30729 39.8958 2.60938 40H33.3906C34.6927 39.8958 35.3958 39.1927 35.5 37.8906C35.4479 34.974 34.4323 32.526 32.4531 30.5469C30.474 28.5677 28.026 27.5521 25.1094 27.5ZM4.48438 36.25C4.84896 34.7917 5.63021 33.5938 6.82812 32.6562C7.97396 31.7708 9.32812 31.3021 10.8906 31.25H25.1094C26.6719 31.3021 28.026 31.7708 29.1719 32.6562C30.3698 33.5938 31.151 34.7917 31.5156 36.25H4.48438Z"
                                fill="#868E96"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        {hasPermission ? (
                            <h3 className="font-medium text-base sm:text-lg">No Shops Available</h3>
                        ) : (
                            <h3 className="font-medium text-base sm:text-lg">No Shops Found</h3>
                        )}
                        {hasPermission ? (
                            <div className="text-sm text-gray-500 mt-1">
                                Add a new shop for your services to reach more clients.
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 mt-1">
                                No shops have been added for this service provider.
                            </div>
                        )}
                    </div>
                </div>
                {hasPermission && (
                    <Button
                        onClick={handleAddShop}
                        // color="gray"
                        variant="outline"
                        style={{borderRadius: '5px'}}
                        className="w-full sm:w-auto min-w-[200px] max-w-[200px] px-3 py-2 text-sm sm:text-base"
                    >
                        Create New Shop
                    </Button>
                )}
            </div>
        )}
    </div>
  );
};

export default MerchantShop;
