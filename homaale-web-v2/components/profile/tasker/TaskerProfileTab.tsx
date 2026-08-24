import { Box, ScrollArea, Tabs, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { useUserProfileTabStyles } from "@/styles/components/UserProfileTabStyles";
import type { EntityServiceLisitngProps } from "@/types/EntityServiceLisitngProps";
import type { ProfileResponseProps } from "@/types/ProfileResponseProps";
import { axiosClient } from "@/utils/axiosClient";
import type { ShopCardProps } from "@/pages/shops";

import AboutTaskerTab from "./AboutTaskerTab";
import TaskerServices from "./TaskerServices";
import TaskerTasks from "./TaskerTasks";
import Empty from "@/components/common/Empty";
import {ShopCard} from "@/components/shops/ShopCard";
import {useQuery} from "@tanstack/react-query";
import Link from "next/link";

interface ShopApiResponse {
    results: {
        id: string;
        name: string;
        images?: {
            id: number;
            image: string;
            uploaded_at: string;
        }[];
        rating: number;
        about: string;
        location: string;
        status: string;
        is_pinned: boolean;
    }[];
}

const TaskerProfileTab = ({
    taskerData,
    taskerServices,
    taskerTasks,
}: {
    taskerData: ProfileResponseProps;
    taskerServices: EntityServiceLisitngProps;
    taskerTasks: EntityServiceLisitngProps;
}) => {
    const { classes } = useUserProfileTabStyles();
    const theme = useMantineTheme();
    const router = useRouter();
    const activeTab = (router.query.active_tab as string) || "about";
    const [shopList, setShopList] = useState<ShopCardProps[]>([]);

    // Fetch tasker's shops
    const { data: shopsData , error: shopsError } = useQuery(
        ["tasker-shops", taskerData?.user?.id],
        async () => {
            const { data } = await axiosClient.get<ShopApiResponse>(
                `/product/shops?user_id=${taskerData?.user?.id}`
            );
            return data.results.map((shop) => ({
                id: shop.id,
                name: shop.name,
                image: shop.images?.[0]?.image || "/images/placeholder.jpg",
                about: shop.about,
                location: shop.location,
                status: shop.status,
                is_pinned: shop.is_pinned,
            } as ShopCardProps));
        },
        { enabled: !!taskerData?.user?.id, initialData: [] }
    );

    useEffect(() => {
        if (shopsData) {
            setShopList(shopsData);
        }
    }, [shopsData]);

    const handleTabChange = (value: string) => {
        router.push(`/tasker/${router.query.id}?active_tab=${value}`, undefined, {
            shallow: true,
        });
    };
    

    return (
        <Box className={classes.wrapper}>
            <Tabs
                color="dark"
                defaultValue="about"
                value={activeTab}
                onTabChange={handleTabChange}
            >
                    <Tabs.List
                        sx={{
                            width: 600,
                            [`@media (min-width: ${theme.breakpoints.md}px)`]: {
                                width: "100%",
                            },
                        }}
                    >
                        <Tabs.Tab value="about">About</Tabs.Tab>
                        <Tabs.Tab value="services">Services</Tabs.Tab>
                        <Tabs.Tab value="tasks">Tasks</Tabs.Tab>
                        <Tabs.Tab value="shops">Shops</Tabs.Tab>
                    </Tabs.List>

                <Tabs.Panel value="about" pt="xs">
                    <AboutTaskerTab profile={taskerData} />
                </Tabs.Panel>
                <Tabs.Panel value="services" pt="xs">
                    <TaskerServices
                        taskerServices={taskerServices}
                        TaskerId={taskerData?.user?.id}
                    />
                </Tabs.Panel>
                <Tabs.Panel value="tasks" pt="xs">
                    <TaskerTasks
                        TaskerTasks={taskerTasks}
                        TaskerId={taskerData?.user?.id}
                    />
                </Tabs.Panel>
                <Tabs.Panel value="shops" pt="xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {shopsError ? (
                            <Empty
                                title="Error"
                                description="Failed to load shops. Please try again."
                            />
                        ) : shopList.length === 0 ? (
                            <Empty
                                title="No Shops"
                                description="This tasker has no shops available."
                            />
                        ) : (
                            shopList.map((shop) => (
                                <Link href={`/shops/${shop.id}`} key={shop.id}>
                                <ShopCard
                                    key={shop.id}
                                    image={shop.image}
                                    title={shop.name}
                                    rating={0}
                                    about={shop.about}
                                    location={shop.location}
                                    status={shop.status}
                                />
                                </Link>
                            ))
                        )}
                    </div>
                </Tabs.Panel>
            </Tabs>
        </Box>
);
};

export default TaskerProfileTab;
