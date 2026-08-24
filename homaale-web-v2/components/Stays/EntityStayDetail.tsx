import React, { useState, useEffect } from 'react';
import { Star, MapPin, Wifi, Car, Coffee, Wind, Check, Heart, Share2, ChevronLeft, ChevronRight, X, UtensilsCrossed, Dumbbell, Waves, Tv, Bath, Phone, Users, Clock, Cigarette, Dog, CreditCard, Info, Navigation, Bed, Utensils, AirVent, Home } from 'lucide-react';
import {Avatar, Box, Button, Portal, useMantineTheme} from '@mantine/core';
import {axiosClient} from "@/utils/axiosClient";
import RoomCard from './RoomCard';
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {string} from "yup";
import {OverlayViewF} from "@react-google-maps/api";
import Map from "@/components/common/Map";
import type {Hotel} from "@/components/hotels/HotelCard";
import HotelCard from "@/components/hotels/HotelCard";
import {useMediaQuery} from "@mantine/hooks";
import {useProfile} from "@/hooks/useProfile";
import AddRoomModal from './AddRoomModel';


interface HotelDetailPageProps {
    slug?: string | null
}

export default function HotelDetailPage({slug}: HotelDetailPageProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [checkIn, setCheckIn] = useState('2025-11-10');
    const [checkOut, setCheckOut] = useState('2025-11-12');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(1);

    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'single'

    const [hotelData, setHotelData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const theme = useMantineTheme();

    const [roomData, setRoomData] = useState<any>(null);
    const [activeBedFilter, setActiveBedFilter] = useState<null | number>(null);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [hotels,setHotels] = useState<Hotel[]>([]);
    const [loadingSimilarHotels, setLoadingSimilarHotels] = useState(true);
    const {data: profileData} = useProfile();
    const Profileid = profileData?.user?.id;
    const isOwner = hotelData?.owner === Profileid;

    const [addRoomModalOpened, setAddRoomModalOpened] = useState(false);
    // Prevent body scroll when modal is open and manage navbar collapse
    useEffect(() => {
        const updateNavbar = () => {
            if (showAllPhotos) {
                localStorage.setItem('isNavbarCollapsed', 'true');
                document.body.style.overflow = 'hidden';
            } else {
                localStorage.setItem('isNavbarCollapsed', 'false');
                document.body.style.overflow = 'unset';
            }

            // Force re-render in Layout by dispatching custom event
            window.dispatchEvent(new CustomEvent('navbar-collapse-update'));
        };

        updateNavbar();

        // Cleanup on unmount
        return () => {
            localStorage.setItem('isNavbarCollapsed', 'false');
            document.body.style.overflow = 'unset';
            window.dispatchEvent(new CustomEvent('navbar-collapse-update'));
        };
    }, [showAllPhotos]);

    useEffect(() => {
        if (showAllPhotos) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showAllPhotos]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showAllPhotos) {
                setShowAllPhotos(false); // Triggers the main useEffect
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showAllPhotos]);

    const facilities = [
        { icon: Wifi, label: 'Free WiFi', available: true },
        { icon: Wind, label: 'Non-smoking rooms', available: true },
        { icon: Car, label: 'Free parking', available: true },
        { icon: UtensilsCrossed, label: 'Family rooms', available: true },
        { icon: Coffee, label: 'Restaurant', available: true },
        { icon: Users, label: 'Room service', available: true },
        { icon: Clock, label: '24-hour front desk', available: true },
        { icon: Waves, label: 'Terrace', available: true },
        { icon: Tv, label: 'Tea/coffee maker in all rooms', available: true },
        { icon: Coffee, label: 'Breakfast', available: true }
    ];

    const reviews = [
        { category: 'Staff', score: 9.4 },
        { category: 'Facilities', score: 8.9 },
        { category: 'Cleanliness', score: 9.1 },
        { category: 'Comfort', score: 9.0 },
        { category: 'Value for money', score: 8.7 },
        { category: 'Location', score: 9.3 }
    ];

    const guestReviews = [
        {
            name: 'Sarah',
            country: 'United States',
            rating: 10,
            date: 'Oct 2025',
            text: 'Had a great stay at Hotel Marcopolo. Comfort, Cleanliness, hospitality are plus points. Very comfortable, the staff were exceptionally friendly, and...',
            helpful: 12
        },
        {
            name: 'Michael',
            country: 'United Kingdom',
            rating: 9.2,
            date: 'Sep 2025',
            text: 'The location is perfect, right in the heart of Kathmandu. Staff were incredibly helpful and the rooms were spotless.',
            helpful: 8
        },
        {
            name: 'Utsav',
            country: 'United States',
            rating: 10,
            date: 'nov 2025',
            text: 'Had a great stay at Hotel Marcopolo. Comfort, Cleanliness, hospitality are plus points. Very comfortable, the staff were exceptionally friendly, and...',
            helpful: 120
        },
        {
            name: 'Deepak',
            country: 'United Kingdom',
            rating: 9,
            date: 'nov 2025',
            text: 'The location is perfect, right in the heart of Kathmandu. Staff were incredibly helpful and the rooms were spotless.',
            helpful: 80
        }
    ];

    useEffect(() => {
        const fetchHotelData = async () => {
            try {
                setIsLoading(true);
                const response = await axiosClient?.get(`/hotel/${slug}`);
                setHotelData(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHotelData();
    }, [slug]);

    const fetchRoomsByBedCount = async (bed_count: null | number) => {
        try {
            setIsLoadingRooms(true);
            setActiveBedFilter(bed_count);

            const url = bed_count === null
                ? `/hotel/${hotelData.slug}/rooms`
                : `/hotel/${hotelData.slug}/rooms/?bed_count=${bed_count}`;

            const response = await axiosClient?.get(url);
            const roomsArray = response.data?.result || response.data;
            setRoomData(roomsArray);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load rooms');
        } finally {
            setIsLoadingRooms(false);
        }
    };

    useEffect(() => {
        setLoadingSimilarHotels(true);
        const fetchSimilarHotels = async () => {
            const response = await axiosClient?.get(`/hotel/recommend/list/${hotelData?.id}`);
            setHotels(response.data)
            console.log("hotel data",response.data)
            setLoadingSimilarHotels(false);
        }
        fetchSimilarHotels();
    }, [hotelData?.id]);

// Replace the old useEffect
    useEffect(() => {
        if (hotelData?.slug) {
            fetchRoomsByBedCount(null);
        }
    }, [hotelData?.slug]);

    // Auto-play images every 10 seconds
    useEffect(() => {
        if (!hotelData?.images?.length) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % hotelData.images.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [hotelData?.images?.length]);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % hotelData?.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + hotelData?.images.length) % hotelData?.images.length);
    };

    const nextHighlight = () => {
        if (highlightIndex + 3 < hotelData?.amenities?.length || 0) {
            setHighlightIndex(highlightIndex + 1);
        }
    };

    const prevHighlight = () => {
        if (highlightIndex > 0) {
            setHighlightIndex(highlightIndex - 1);
        }
    };

    const calculateNights = () => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        // return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const pricePerNight = 189;
    const nights = calculateNights();
    const iconSrc = <MapPin />;

    return (
        <div className="min-h-screen ">
            <div className="max-w-[1800px] mx-auto">
                {/* Hotel Header */}
                <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <div className="flex gap-2">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {hotelData?.name}
                                </h1>
                                <div className="flex gap-1 items-center mb-2">
                                    {[...Array(5)].map((_, i) => {
                                        const rating = hotelData?.rating || 0;
                                        const isFilled = i < Math.floor(rating);
                                        const isHalf = i === Math.floor(rating) && rating % 1 >= 0.5;

                                        return (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 transition-colors ${
                                                    isFilled
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : isHalf
                                                            ? 'fill-yellow-400/50 text-yellow-400'
                                                            : 'fill-gray-300 text-gray-300'
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex items-center text-sm hover:underline cursor-pointer mb-1"
                                 style={{color: theme.colors.brand[6]}}>
                                <MapPin className="w-4 h-4 mr-1"/>
                                <span>{hotelData?.address}, {hotelData?.city} - Excellent location</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant={"outline"} className="flex items-center gap-1 px-3 py-2 border"
                                    style={{
                                        color: theme.colors.brand[6],
                                        borderColor: theme.colors.brand[6],
                                    }}>
                                <Heart className="w-4 h-4"/>
                            </Button>
                            <Button variant={"outline"} className="flex items-center gap-1 px-3 py-2 border"
                                style={{
                                color: theme.colors.brand[6],
                                borderColor: theme.colors.brand[6],
                                 }}>
                                <Share2 className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Image Gallery and Map Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    {/* Image Gallery - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        {hotelData?.images && hotelData?.images.length > 0 ? (
                            <div className="grid grid-cols-12 gap-1 h-[400px]">
                                {/* 1 image: Full width */}
                                {hotelData?.images.length === 1 && (
                                    <div className="col-span-12 row-span-2 relative overflow-hidden rounded cursor-pointer"
                                        onClick={() => setShowAllPhotos(true)}>
                                        <img src={hotelData?.images[0]}
                                            alt="Hotel main"
                                            className="w-full h-full object-cover transition"/>
                                    </div>
                                )}

                                {/* 2 images: 70% + 30% split */}
                                {hotelData?.images.length === 2 && (
                                    <>
                                        <div className="col-span-8 row-span-2 relative overflow-hidden rounded-l cursor-pointer"
                                            onClick={() => setShowAllPhotos(true)}>
                                            <img src={hotelData?.images[0]}
                                                alt="Hotel main"
                                                className="w-full h-full object-cover transition"/>
                                        </div>
                                        <div className="col-span-4 row-span-2 relative overflow-hidden rounded-r cursor-pointer"
                                            onClick={() => {
                                                setCurrentImageIndex(1);
                                                setShowAllPhotos(true);
                                            }}>
                                            <img src={hotelData?.images[1]}
                                                alt="Hotel view 2"
                                                className="w-full h-full object-cover hover:opacity-90 transition"/>
                                        </div>
                                    </>
                                )}

                                {/* 3 images: Main + 2 stacked (50%/50% height) */}
                                {hotelData?.images.length === 3 && (
                                    <>
                                        <div className="col-span-8 row-span-2 relative overflow-hidden rounded-l cursor-pointer"
                                            onClick={() => setShowAllPhotos(true)}>
                                            <img src={hotelData?.images[0]}
                                                alt="Hotel main"
                                                className="w-full h-full object-cover transition"/>
                                        </div>
                                        <div className="col-span-4 relative overflow-hidden rounded-tr cursor-pointer"
                                            onClick={() => {
                                                setCurrentImageIndex(1);
                                                setShowAllPhotos(true);
                                            }}>
                                            <img src={hotelData?.images[1]}
                                                alt="Hotel view 2"
                                                className="w-full h-full object-cover hover:opacity-90 transition"/>
                                        </div>
                                        <div className="col-span-4 relative overflow-hidden rounded-br cursor-pointer"
                                            onClick={() => {
                                                setCurrentImageIndex(2);
                                                setShowAllPhotos(true);
                                            }}>
                                            <img src={hotelData?.images[2]}
                                                alt="Hotel view 3"
                                                className="w-full h-full object-cover hover:opacity-90 transition"/>
                                        </div>
                                    </>
                                )}

                                {/* 4 images: Main + 3 in grid (with space for 5th) */}
                                {hotelData?.images.length === 4 && (
                                    <>
                                        <div className="col-span-8 row-span-2 relative overflow-hidden rounded-l cursor-pointer"
                                            onClick={() => setShowAllPhotos(true)}>
                                            <img src={hotelData?.images[0]}
                                                alt="Hotel main"
                                                className="w-full h-full object-cover transition"/>
                                        </div>
                                        {hotelData?.images.slice(1, 4).map((img: string | undefined, i: number) => (
                                            <div key={i + 1}
                                                className="col-span-2 relative overflow-hidden cursor-pointer"
                                                onClick={() => {
                                                    setCurrentImageIndex(i + 1);
                                                    setShowAllPhotos(true);
                                                }}>
                                                <img src={img}
                                                    alt={`Hotel view ${i + 2}`}
                                                    className="w-full h-full object-cover hover:opacity-90 transition"/>
                                            </div>
                                        ))}
                                        {/* Empty placeholder for 5th image */}
                                        <div className="col-span-2 bg-gray-100" />
                                    </>
                                )}

                                {/* 5+ images: Main + grid layout */}
                                {hotelData?.images.length >= 5 && (
                                    <>
                                    {/* Main large image */}
                                    <div className="col-span-8 row-span-2 relative overflow-hidden rounded-tl cursor-pointer"
                                        onClick={() => setShowAllPhotos(true)}>
                                        <img src={hotelData?.images[0]}
                                            alt="Hotel main"
                                            className="w-full h-full object-cover transition"/>
                                        {hotelData?.images.length > 11 && (
                                            <button onClick={(e) => {
                                                        e.stopPropagation();
                                                    setShowAllPhotos(true);
                                                    setViewMode('grid');}}
                                                className="absolute bottom-4 right-4 bg-gray-100 px-4 py-2 rounded font-medium shadow-lg hover:bg-gray-50 flex items-center gap-2">
                                                <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
                                                    {[...Array(9)].map((_, i) => (
                                                        <div key={i} className="bg-gray-700 w-1 h-1"></div>
                                                    ))}
                                                </div>
                                                +{hotelData?.images.length - 11} photos
                                            </button>
                                        )}
                                    </div>

                                    {/* 4 small images on the right */}
                                    {hotelData?.images.slice(1, 5).map((img: string | undefined, i: number) => (
                                        <div key={i + 1}
                                            className="col-span-2 relative overflow-hidden cursor-pointer"
                                            onClick={() => {
                                                setCurrentImageIndex(i + 1);
                                                setShowAllPhotos(true);
                                            }}>
                                            <img src={img}
                                                alt={`Hotel view ${i + 2}`}
                                                className="w-full h-full object-cover hover:opacity-90 transition"/>
                                        </div>
                                    ))}

                                    {/* Bottom row: images 5+ */}
                                    {hotelData?.images.slice(5, 11).map((img: string | undefined, idx: number) => (
                                        <div key={idx + 5}
                                            className="col-span-2 relative overflow-hidden cursor-pointer"
                                            onClick={() => {
                                                setCurrentImageIndex(idx + 5);
                                                setShowAllPhotos(true);
                                            }}>
                                            <img src={img}
                                                alt={`Hotel view ${idx + 6}`}
                                                className="w-full h-full object-cover hover:opacity-90 transition"/>
                                        </div>
                                    ))}

                                        {Array.from({length: Math.max(0, 11 - hotelData?.images.length)}).map((_, i) => (
                                            <div key={`placeholder-${i}`} className="col-span-2 bg-gray-100" />
                                        ))}
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Fallback if no images */
                            <div className="h-[400px] bg-gray-200 flex items-center justify-center rounded">
                                <p className="text-gray-500">No images available</p>
                            </div>
                        )}
                    </div>
                                    {/* Map Section - Takes 1 column */}
                    <div className="lg:col-span-1 h-[380px]">
                            <Map
                                style={{width: "200px", height: "150px"}}
                                location={{
                                    id: "1",
                                    lat: hotelData?.latitude,
                                    lng: hotelData?.longitude,
                                }}
                            >
                                <OverlayViewF
                                    position={{
                                        lat: hotelData?.latitude,
                                        lng: hotelData?.longitude,
                                    }}
                                    mapPaneName="overlayMouseTarget"
                                    getPixelPositionOffset={(width, height) => ({
                                        x: -(width / 2),
                                        y: -height / 2,
                                    })}
                                    key={1}
                                >
                                    <Avatar
                                        // src={iconSrc}
                                        radius="xl"
                                        size={25}
                                        p={4}
                                        sx={{ cursor: "pointer", background: theme.colors.brand[4] }}
                                    >
                                    <MapPin className="w-6 h-6 text-white" style={{ background:theme.colors.brand[4]}} />
                                    </Avatar>
                                </OverlayViewF>
                            </Map>
                        <div className="flex items-center text-sm hover:underline cursor-pointer mb-1"
                             style={{color: theme.colors.brand[6]}}>
                            <MapPin className="w-4 h-4 mr-1"/>
                            <span>{hotelData?.address}, {hotelData?.city}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Property Highlights with Carousel */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h2 className="font-bold text-lg mb-4">Property highlights</h2>
                            <div className="relative">
                                <div className="flex gap-4 overflow-hidden">
                                    {hotelData?.amenities
                                        ?.slice(highlightIndex, highlightIndex + 3)
                                        .map((amenity: {
                                            icon: any;
                                            id: any;
                                            name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined;
                                            description: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined;
                                        }, idx: any) => {
                                            // Parse SVG icon safely
                                            const IconComponent = () => (
                                                <div
                                                    className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                                    <div
                                                        className="w-8 h-8 text-gray-700"
                                                        dangerouslySetInnerHTML={{__html: amenity.icon || ''}}
                                                    />
                                                </div>
                                            );

                                            return (
                                                <div
                                                    key={amenity.id || idx}
                                                    className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl p-4"
                                                >
                                                    <div className="flex flex-col items-center text-center">
                                                        {/*<button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">*/}
                                                        <IconComponent/>
                                                        {/*</button>*/}
                                                        <div className="font-semibold text-sm mb-1">{amenity.name}</div>
                                                        <div
                                                            className="text-xs text-gray-600">{amenity.description}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                                {highlightIndex > 0 && (
                                    <button
                                        onClick={prevHighlight}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white border border-gray-300 p-2 rounded-full shadow-md hover:bg-gray-50"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                )}
                                {highlightIndex + 3 < (hotelData?.amenities?.length || 0) && (
                                    <button
                                        onClick={nextHighlight}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white border border-gray-300 p-2 rounded-full shadow-md hover:bg-gray-50"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Genius Discount */}
                        <div className="border rounded-lg p-4"
                        style={{
                            background: theme.colors.brand[0],
                            borderColor: theme.colors.brand[2],
                        }}>
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color:theme.colors.brand[6],}} />
                                <div className="text-sm">
                                    <p className="mb-2">
                                        <strong>You might be eligible for a Genius discount at Hotel
                                            Marcopolo.</strong> To check if a Genius discount is available for your
                                        selected dates, sign in.
                                    </p>
                                    <p className="text-gray-700">
                                        Genius discounts at this property are subject to book dates, stay dates and
                                        other available deals.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* About Property */}
                        <div>
                            <h2 className="font-bold text-lg mb-3">About this property</h2>
                            <div className="space-y-3 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                                 dangerouslySetInnerHTML={{__html: hotelData?.description || '',}}
                            />
                        </div>

                        {/* Room Facilities */}
                        <div className="bg-white rounded-lg">
                            <h2 className="font-bold text-lg mb-3">Your Room&apos;s facilities</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {facilities.map((facility, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Check className="w-5 h-5 text-green-600" />
                                        <facility.icon className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm text-gray-700">{facility.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ==================== AVAILABLE ROOMS ==================== */}
                        <div className="mt-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg">Available rooms</h2>
                                <div className="text-sm text-gray-600">
                                    {roomData?.length ?? "no"} Room available
                                </div>
                            </div>

                            {/* FILTER TABS */}
                            <div className="flex gap-2 mb-6 border-b items-center">
                                {[
                                    { label: 'All rooms', bed_count: null },
                                    { label: '1 bed', bed_count: 1 },
                                    { label: '2 beds', bed_count: 2 },
                                    { label: '3 beds', bed_count: 3 },
                                ].map((tab, i) => (
                                    <Button
                                        key={i}
                                        onClick={() => fetchRoomsByBedCount(tab.bed_count)}
                                        className={`px-4 py-2 rounded mb-2 font-medium text-sm transition-colors ${
                                            activeBedFilter === tab.bed_count
                                                ? `bg-[${theme.colors.brand[4]}] text-white`
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tab.label}
                                    </Button>
                                ))}

                                {/* ADD ROOM BUTTON - OWNER ONLY */}
                                {isOwner && (
                                    <div className="ml-auto">
                                        <Button
                                            onClick={() => setAddRoomModalOpened(true)}
                                            className="text-white flex items-center gap-2"
                                            style={{ background: theme.colors.brand[6] }}
                                        >
                                            <Bed className="w-4 h-4" />
                                            Add Room
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* RESPONSIVE GRID */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {isLoadingRooms ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: "50vh",
                                            width: "100%",
                                        }}
                                        className="col-span-full"
                                    >
                                        <HomaaleLoader/>
                                    </Box>
                                ) : Array.isArray(roomData) && roomData.length > 0 ? (
                                    roomData.map((room: any) => <RoomCard key={room.id} room={room}/>)
                                ) : (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        No rooms available for this filter.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Guest Reviews Summary */}
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg">Guest reviews</h2>
                                <button className="text-sm hover:underline" style={{color:theme.colors.brand[6]}}>
                                    Read all reviews
                                </button>
                            </div>

                            <div className="flex items-start gap-6 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="text-white px-3 py-2 rounded-t-lg rounded-br-lg" style={{background:theme.colors.brand[5]}}>
                                        <div className="text-2xl font-bold">9.2</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">Exceptional</div>
                                        <div className="text-sm text-gray-600">1,245 reviews</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {reviews.map((review, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">{review.category}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 h-1.5 w-24 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full"
                                                    style={{width: `${(review.score / 10) * 100}%`,
                                                        background:theme.colors.brand[5] }}
                                                ></div>
                                            </div>
                                            <span className="font-semibold text-sm w-8 text-right">{review.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Individual Reviews */}
                            <div className="space-y-4">
                                {guestReviews.map((review, idx) => (
                                    <div key={idx} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 text-white rounded-full flex items-center justify-center font-bold" style={{background:theme.colors.brand[5]}}>
                                                    {review.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{review.name}</div>
                                                    <div className="text-sm text-gray-600">{review.country}</div>
                                                </div>
                                            </div>
                                            <div
                                                className="text-white px-2 py-1 rounded-t rounded-br text-sm font-bold" style={{background:theme.colors.brand[5]}}>
                                                {review.rating}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{review.text}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">{review.date}</span>
                                            <button className="hover:underline" style={{color:theme.colors.brand[6]}}>
                                                Helpful ({review.helpful})
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* similar hotels */}
                        <div className="border-t pt-4">
                            <h2 className="font-bold text-lg mb-3">Hotels you may like! </h2>
                            <div>
                                {loadingSimilarHotels ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: "30vh",
                                            width: "100%",
                                        }}
                                        className="col-span-full"
                                    >
                                        <HomaaleLoader/>
                                    </Box>
                                ) : hotels?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                    {hotels.map((hotel) => (
                                            <HotelCard key={hotel?.id} hotel={hotel} weidth={255} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        No similar hotels found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="border-t pt-4">
                            <h2 className="font-bold text-lg mb-3">Extra info</h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-700 mb-2"><strong>Continental, American</strong></p>
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4" style={{color:theme.colors.brand[6]}}/>
                                    <span className="text-sm">Free public parking is available at the hotel</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border-2 rounded-lg p-4 shadow-lg sticky top-20" style={{borderColor:theme.colors.brand[3]}}>
                            {/* Rating Badge */}
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                                <div className="text-white px-2 py-1 rounded-t rounded-br font-bold" style={{background:theme.colors.brand[5]}}>
                                    9.2
                                </div>
                                <div>
                                    <div className="font-bold">Exceptional</div>
                                    <div className="text-sm text-gray-600">1,245 reviews</div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="border rounded">
                                    <div className="grid grid-cols-2">
                                        <div className="border-r p-2">
                                            <label className="text-xs text-gray-600 block mb-1">Check-in</label>
                                            <input
                                                type="date"
                                                value={checkIn}
                                                onChange={(e) => setCheckIn(e.target.value)}
                                                className="w-full text-sm font-medium border-0 p-0 focus:ring-0"
                                            />
                                        </div>
                                        <div className="p-2">
                                            <label className="text-xs text-gray-600 block mb-1">Check-out</label>
                                            <input
                                                type="date"
                                                value={checkOut}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                                className="w-full text-sm font-medium border-0 p-0 focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded p-2">
                                    <label className="text-xs text-gray-600 block mb-2">Guests</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Adults</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setAdults(Math.max(1, adults - 1))}
                                                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-medium">{adults}</span>
                                                <button
                                                    onClick={() => setAdults(adults + 1)}
                                                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Children</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setChildren(Math.max(0, children - 1))}
                                                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-medium">{children}</span>
                                                <button
                                                    onClick={() => setChildren(children + 1)}
                                                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Rooms</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                                                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-medium">{rooms}</span>
                                                <button
                                                    onClick={() => setRooms(rooms + 1)}
                                                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button size={"md"}
                                className="w-full text-white py-3 rounded font-bold text-lg transition-colors mb-3">
                                Reserve
                            </Button>

                            <div className="text-center text-sm text-gray-600 mb-4">
                                <Check className="w-4 h-4 inline mr-1 text-green-600"/>
                                We Price Match
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/>
                                    <span className="text-gray-700">Free cancellation before Nov 9</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/>
                                    <span className="text-gray-700">No prepayment needed – pay at the property</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Gallery Modal */}
            {showAllPhotos && (
                <Portal>
                    <div className="fixed top-14 inset-0 bg-white z-50 overflow-y-auto">
                        {viewMode === 'grid' ? (
                            // Grid View
                            <>
                                <div className="bg-white border-b z-10 px-4 py-4 flex items-center justify-between">
                                    <h2 className="text-xl ml-20 font-bold">Hotel Marcopolo - All Photos</h2>
                                    <button
                                        onClick={() => setShowAllPhotos(false)}
                                        className="p-2 flex font-bold gap-1 hover:bg-gray-100 rounded-full transition"
                                    >
                                        <p className="font-bold text-md mt-1">Close</p> <X className="w-5 h-6"/>
                                    </button>
                                </div>

                                <div className="max-w-7xl mt-2 mx-auto py-6">
                                    {hotelData?.images && hotelData?.images.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                            {hotelData?.images.map((img: string, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group"
                                                    onClick={() => {
                                                        setCurrentImageIndex(idx);
                                                        setViewMode('single');
                                                    }}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`Hotel view ${idx + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                    <div
                                                        className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"/>
                                                    <div
                                                        className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                                                        {idx + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-10">No photos available</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            // Single Image View
                            <div className="flex items-center justify-center min-h-screen">

                                {/*<button*/}
                                {/*    onClick={() => setShowAllPhotos(false)}*/}
                                {/*    className="absolute right-10 top-4 text-black bg-white p-2 rounded-full hover:bg-gray-100"*/}
                                {/*>*/}
                                {/*    <X className="w-6 h-6" />*/}
                                {/*</button>*/}
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className="absolute right-20 top-4 flex font-bold text-black bg-white p-2 rounded-full hover:bg-gray-100"
                                >
                                    <ChevronLeft className="w-6 h-6"/> <p className="-ml-2 mt-[0.145rem]">--- Go
                                    back</p>
                                </button>
                                <div className="relative w-full max-w-6xl px-16">
                                    <img
                                        src={hotelData?.images[currentImageIndex]}
                                        alt="Hotel"
                                        className="w-full h-auto max-h-[90vh] object-contain"
                                    />
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white"
                                    >
                                        <ChevronLeft className="w-6 h-6"/>
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white"
                                    >
                                        <ChevronRight className="w-6 h-6"/>
                                    </button>
                                    <div
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                                        {currentImageIndex + 1} / {hotelData?.images.length}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Portal>
            )}
            {hotelData && (
                <AddRoomModal
                    opened={addRoomModalOpened}
                    onClose={() => setAddRoomModalOpened(false)}
                    hotelId={hotelData.id}
                    hotelSlug={hotelData.slug}
                    onSuccess={() => {
                        fetchRoomsByBedCount(activeBedFilter); // Refresh current view
                    }}
                />
            )}
        </div>
    );
}
