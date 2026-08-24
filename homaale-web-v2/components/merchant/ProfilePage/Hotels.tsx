import { axiosClient } from '@/utils/axiosClient';
import { Group, Title, useMantineTheme, Button, Box, Tooltip } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useDark } from '@/utils/helpers';
import { ShopCard } from '@/components/shops/ShopCard';
import { homaaleColors } from '@/theme/GlobalTheme';
import { useRouter } from 'next/router';
import {FiPlus} from "react-icons/fi";
import {notifications} from "@mantine/notifications";
import {useUserStatus} from "@/hooks/useUserStatus";
import {useProfile} from "@/hooks/useProfile";
import {useUser} from "@/hooks/useUser";
import HotelCard, {Hotel} from "@/components/hotels/HotelCard";

// interface Hotel {
//     id: string;
//     name: string;
//     about: string;
//     location: string;
//     status: string;
//     images: Array<{
//         id: number;
//         image: string;
//         uploaded_at: string;
//     }>;
// }

interface ApiResponse {
    results: Hotel[];
}

interface MerchantHotelProps {
    id?: string;
    hasPermission?: boolean;
}

const Hotels = ({ id, hasPermission }: MerchantHotelProps) => {
    const [merchantHotels, setMerchantHotels] = useState<Hotel[]>([]);
    const [viewAll, setViewAll] = useState(false);
    const dark = useDark();
    const theme = useMantineTheme();
    const router = useRouter();
    const {data : profileData} = useProfile();
    const user = useUser();

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await axiosClient.get(`/hotel/owner/${id}/`);
                setMerchantHotels(response.data.result || []);
                console.log("",merchantHotels)
            } catch (error) {
                console.error('Error fetching hotel data:', error);
            }
        };
        fetchHotels();
    }, [id]);

    const handleViewAll = () => {
        setViewAll((prev) => !prev);
    };

    const handleAddHotel = () => {
        router.push({ pathname: "/hotelForm" });
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
                    Hotels
                </Title>
                {merchantHotels.length > 0 && (
                    <div className="flex gap-2">
                        {hasPermission && (
                            <Tooltip label={"Add Hotel"} position={"top"}>
                                <Button
                                    sx={{
                                        color:theme.colors.brand[4],
                                        background:"transparent",
                                        '&:hover': {
                                            color: theme.colors.brand[4],
                                            background:"transparent"
                                        },
                                    }}
                                    variant="subtle"
                                    className="text-gray-600 p-2 rounded-full gap-1"
                                    onClick={handleAddHotel}
                                >
                                    <FiPlus className="w-5 h-5"/>
                                </Button>
                            </Tooltip>
                        )}
                        <Button
                            className="px-4 py-2"
                            onClick={handleViewAll}
                            style={{fontWeight: 100}}
                        >
                            {viewAll ? 'View Less' : 'View All'}
                        </Button>
                    </div>
                )}
            </Group>

            {/* Hotels Grid or Empty State */}
            {merchantHotels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {(viewAll ? merchantHotels : merchantHotels.slice(0, 3)).map((hotel) => (
                        <HotelCard key={hotel?.id} hotel={hotel} weidth={290} />
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
                                <h3 className="font-medium text-base sm:text-lg">No Hotels Available</h3>
                            ) : (
                                <h3 className="font-medium text-base sm:text-lg">No Hotels Found</h3>
                            )}
                            {hasPermission ? (
                                <div className="text-sm text-gray-500 mt-1">
                                    Add a new Hotel for your services to reach more clients.
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 mt-1">
                                    No Hotels have been added for this service provider.
                                </div>
                            )}
                        </div>
                    </div>
                    {hasPermission && (
                        <Button
                            onClick={handleAddHotel}
                            variant="outline"
                            style={{borderRadius: '5px'}}
                            className="w-full sm:w-auto min-w-[200px] max-w-[200px] px-3 py-2 text-sm sm:text-base"
                        >
                            Create New Hotel
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Hotels;
