import React, {useEffect, useState} from 'react';
import Layout from "@/components/Layout/Layout";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {isLoggedIn, useDark} from "@/utils/helpers";
import {colors} from "@react-spring/shared";
import DOMPurify from 'dompurify';
import {FaStar} from "react-icons/fa";
import {IconBookmark, IconMapPin} from "@tabler/icons-react";
import {Box, Button, Tooltip, useMantineTheme} from "@mantine/core";
import {useTaskerCardStyles} from "@/styles/components/TaskerCardStyles";
import Image from "next/image";
import {TiPin, TiPinOutline} from "react-icons/ti";
import {axiosClient} from "@/utils/axiosClient";
import {notifications} from "@mantine/notifications";
import {PiBookmarkSimpleFill, PiBookmarkSimpleLight} from "react-icons/pi";

export interface ShopCardProps {
    image: string;
    title: string;
    rating: number;
    about: string;
    location: string;
    status: any;
    id?: string;
    pinned?: boolean | undefined;
    pinnedId?: string;
    isMyShop?: boolean;
    fetchAllShops?: () => void;
    fetchMyShops?: () => void;
    activeTab?: string;
}

export const ShopCard: React.FC<ShopCardProps> = ({
                                                      image,
                                                      title,
                                                      rating,
                                                      about,
                                                      location,
                                                      status,
                                                      id,
                                                      pinned,
                                                      pinnedId,
                                                      isMyShop,
                                                      fetchAllShops,
                                                      fetchMyShops,
                                                      activeTab,
                                                  }) => {
    const [loading, setLoading] = useState(false);
    const dark = useDark();
    const {classes} = useTaskerCardStyles();
    const theme = useMantineTheme();
    const [isActive, setIsActive] = useState<boolean | undefined>(pinned || false);
    const [pinnedItemId, setPinnedItemId] = useState<string | undefined>(pinnedId);

    // console.log("ispinned", pinned);
    // console.log("pinnedItemId", pinnedItemId);
    // const [refreshKey, setRefreshKey] = useState(0);


    if (loading) {
        return (
            <Layout currentTitle={"Shops"}>
                <div className="flex justify-center items-center h-screen">
                    <HomaaleLoader/>
                </div>
            </Layout>
        );
    }

    const handlePinShop = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        // if (!id) {
        //     notifications.show({
        //         title: 'Error',
        //         message: 'Shop ID is missing.',
        //         color: 'red',
        //     });
        //     return;
        // }
        try {
            if (!isActive) {
                // Pin the shop using POST
                const response = await axiosClient.post(`product/pinned-items/`, {
                    shop: id,
                    priority: 1,
                    active: true,
                });
                setPinnedItemId(response.data.id);
                setIsActive(true);
                notifications.show({
                    title: 'Success',
                    message: 'Shop pinned successfully!',
                    color: 'green',
                });
            } else {
                // Unpin the shop using DELETE
                if (!pinnedItemId) throw new Error("Pinned item ID not found");
                await axiosClient.delete(`product/pinned-items/${pinnedItemId}/`);
                setPinnedItemId(undefined);
                setIsActive(false);
                notifications.show({
                    title: 'Success',
                    message: 'Shop unpinned successfully!',
                    color: 'green',
                });
            }

            // Fetch updated data based on the tab
            if (fetchAllShops) await fetchAllShops();
            if (isMyShop && fetchMyShops) await fetchMyShops();
        } catch (error: any) {
            console.error("Error pinning/unpinning shop:", error);
            notifications.show({
                title: 'Error',
                message: `Failed to ${isActive ? 'unpin' : 'pin'} shop. Please try again.`,
                color: 'red',
            });
        }
    };
    const stripHtml = (html:any) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};




    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] mx-auto"
             style={{backgroundColor: dark ? "black" : "white"}}
        >
            {/* Image with Gradient Overlay */}
            <div className="relative w-full h-48">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        width={400} height={400}
                        className="w-full h-full object-cover"
                    />
                ): (
                    <Image
                        src={"/images/placeholder/taskPlaceholder.png"}
                        alt={title}
                         width={400} height={400}
                        className="w-full h-full object-contain bg-gray-100 dark:bg-gray-700"
                    />
                )}
                {/*<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>*/}
            </div>
            {/* Card Content */}
            <div className="p-4 w-full h-40">
                {/* Title */}

                <div className="flex gap-1 items-center"
                >
                    <Tooltip label={title} withArrow>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[200px]"
                            style={{color: dark ? "gray" : "black"}}
                        >
                            {title ? title.charAt(0).toUpperCase() + title.slice(1) : ''}
                        </h3>
                    </Tooltip>
                    {status === 'verified' && (
                        <Tooltip label="Verified Shop" withArrow>
                            <Image
                                src="/CardImages/Vector.svg"
                                alt="verified-tick"
                                height={20}
                                width={20}
                                className="cursor-pointer"
                            />
                        </Tooltip>
                    )}
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <FaStar
                            key={i}
                            className="text-lg"
                            color={i < rating ? '#FBBF24' : '#D1D5DB'}
                        />
                    ))}
                </div>

                {/* Location */}
                <Box className="flex items-center mb-3">
                    <IconMapPin
                        size={16}
                        className="text-orange-500 dark:text-gray-400"
                    />
                    <Tooltip label={location || 'Location Not Available'} withArrow multiline>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
                            {location || 'Location Not Available'}
                        </span>
                    </Tooltip>
                </Box>

                {/* Description */}
                <div
                    className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 leading-relaxed"
                    // style={{color: dark ? "white" : "black"}}
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                            about
                                ? about.replace(/^\s*([a-zA-Z])/, (match) => match.toUpperCase())
                                : "There is no description of the shop.",
                            { FORBID_TAGS: ['img',"h1", "h2", "h3", "h4", "h5", "h6", "strong", "b"] }
                        ),
                    }}
                />
            </div>

            {/* Pin Button */}
            {isLoggedIn() && activeTab && (
                <Button
                    className={`absolute top-3 right-3 bg-white/80 dark:bg-gray-700/80 p-2 rounded-full transition-all duration-200 hover:bg-white dark:hover:bg-gray-600 ${
                        isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                    }`}
                    styles={{
                        root: {
                            padding: 0,
                            width: '2.5rem',
                            height: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                    }}
                    onClick={handlePinShop}
                    role="button"
                    tabIndex={0}
                    aria-label={isActive ? 'Unpin Shop' : 'Pin Shop'}
                    title={isActive ? 'Unpin Shop' : 'Pin Shop'}
                >
                    {isMyShop ? (
                        isActive ? (
                            <TiPin className="text-2xl text-red-500" />
                        ) : (
                            <TiPinOutline className="text-2xl text-red-500" />
                        )
                    ) : (
                        isActive ? (
                            <PiBookmarkSimpleFill className="text-2xl text-red-500" />
                        ) : (
                            <PiBookmarkSimpleLight className="text-2xl text-red-500" />
                        )
                    )}
                </Button>
            )}
        </div>
    );
};
