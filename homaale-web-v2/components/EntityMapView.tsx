"use client"
import {
    Box,
    Button,
    Drawer,
    ScrollArea,
    Paper,
    Transition,
    useMantineTheme,
} from "@mantine/core";
import {useDisclosure, useIntersection, useMediaQuery} from "@mantine/hooks";
import {Circle, MarkerF, OverlayViewF} from "@react-google-maps/api";
import {IconChevronDown, IconChevronUp, IconHotelService} from "@tabler/icons-react";
import React, {useEffect, useMemo, useRef, useState} from "react";

import Map from "@/components/common/Map";
import {update} from "@/features/utils/locationSlice";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {useGeocoding} from "@/hooks/useGeocoding";
import {useGetEntity} from "@/hooks/useGetEntity";
import type {BookMarkApiResponse} from "@/types/bookmarks";
import type {EntityServiceLisitngProps} from "@/types/EntityServiceLisitngProps";
import type {LocationProps} from "@/types/LocationProps";

import {ServiceCard} from "./cards/ServiceCard";
import Empty from "./common/Empty";
import {MapMarker} from "./common/MapMarker";
import {HotelMapMarker} from "./common/HotelMapMarker";
import {SkeletonServiceCard} from "./skeletons/SkeletonServiceCard";
import { cl } from "@fullcalendar/core/internal-common";
import type { Hotel } from "@/components/hotels/HotelCard";
import HotelCard from "@/components/hotels/HotelCard";
import {axiosClient} from "@/utils/axiosClient";
import router from "next/router";

const EntityMapView = ({
                           is_bookmark,
                           is_requested,
                           query,
                           ownerFilter,
                       }: {
    is_bookmark: boolean;
    is_requested: boolean | any;
    query: string;
    ownerFilter: string;
}) => {
    const theme = useMantineTheme();
    const smallScreen = useMediaQuery("(max-width: 991px)");
    const [mapOpened, {open: openMap, close: closeMap}] = useDisclosure(true);

    const dispatch = useAppDispatch();

    const {
        data,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isLoading,
    } = useGetEntity(is_bookmark, is_requested, query, ownerFilter);

    const entity: EntityServiceLisitngProps["result"] &
        BookMarkApiResponse["result"] = useMemo(() => data?.pages.map((page) => page.result).flat() ?? [], [data?.pages]);

    // This flattens all `extra_data` from every entity
    const extraMarkers = useMemo(() => {
        return entity.flatMap((e) => e.extra_data ?? []);
    }, [entity]);
    // console.log('extramarkers', extraMarkers);


    const containerRef = useRef<HTMLDivElement>(null);
    const {ref, entry} = useIntersection({
        root: containerRef.current,
        threshold: 0.5,
    });

    const isLastTaskerOnPage = (index: number) => index === entity?.length - 1;

    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [entry, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const {data: userLocation, radius} = useAppSelector(
        (state) => state.locationReducer
    );
    console.log(radius,"from radius")

    const [location, setLocation] = useState({
        id: "",
        lat: userLocation?.latitude ?? 27,
        lng: userLocation?.longitude ?? 85,
    });

    const [currentLocation, setCurrentLocation] = useState<{
        id: string;
        lat: LocationProps["data"]["latitude"];
        lng: LocationProps["data"]["longitude"];
    }>({
        id: "",
        lat: location?.lat ?? 27,
        lng: location?.lng ?? 85,
    });

    const {data: userPlaceLocate} = useGeocoding(
        `${location.lat},${location.lng}`
    );

    const reftest = useRef<any>(null);

    console.log(radius,"this is for radius")
    const handleCircleRadius = () => {
        return reftest.current && (reftest?.current.state?.circle?.radius as number);
    };

    // Ensure map is opened when switching to larger screens
    useEffect(() => {
        if (!smallScreen && !mapOpened) {
            openMap();
        }
    }, [smallScreen, mapOpened, openMap]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [hotelsLoading, setHotelsLoading] = useState(true);
    const isHotelTab = router.query.type === "hotels";
    const isTaskTab = router.query.type === "task";
    const isServiceTab = router.query.type === "services";
    const isExploreTab = !isHotelTab && !isTaskTab && !isServiceTab;
    useEffect(() => {
        const fetchHotels = async () => {
            setHotelsLoading(true);
            try {
                let cleanedQuery = '';
                if (query) {
                    const queryParams = new URLSearchParams(query);
                    cleanedQuery = queryParams.get('search') || '';
                }

                const params = new URLSearchParams();
                if (cleanedQuery) params.append('search', cleanedQuery.trim());
                if (radius) params.append('radius', radius.toString());
                if (location.lat && location.lng) {
                    params.append('latitude', location.lat.toString());
                    params.append('longitude', location.lng.toString());
                }

                const url = params.toString()
                    ? `/hotel/list/?${params.toString()}`
                    : '/hotel/list/';

                const response = await axiosClient.get(url);
                if (response.data.status === 'success' || response.data.result) {
                    setHotels(response.data.result || response.data.results || []);
                } else {
                    setHotels([]);
                }
            } catch (error) {
                console.error('Error fetching hotels for map:', error);
                setHotels([]);
            } finally {
                setHotelsLoading(false);
            }
        };

        if (isHotelTab || !isServiceTab && !isTaskTab) {
            fetchHotels();
        } else {
            setHotels([]);
        }
    }, [query, location.lat, location.lng, radius]);

    return (
        <Box
            className="border"
            component="section"
            mt={15}
            id="map-view"
            pos="relative"
            sx={{
                display: "flex",
                flexDirection: smallScreen ? "column" : "row-reverse",
                height: smallScreen ? "100vh" : "80vh",
                background: theme.colors.white[0],
                borderRadius: theme.radius.lg,
                boxShadow: theme.shadows.xl,
                overflow: "hidden",
            }}
        >
            {/* Map Section */}
            <Transition
                mounted={smallScreen ? mapOpened : true}
                transition={smallScreen ? "slide-up" : "fade"}
                duration={300}
                timingFunction="ease"
            >
                {(styles) => (
                    <Box
                        style={styles}
                        sx={{
                            flex: smallScreen ? "0 0 auto" : "0 0 60%",
                            height: smallScreen ? (mapOpened ? "50%" : "0") : "100%",
                            position: "relative",
                            zIndex: 10,
                            borderRadius: smallScreen
                                ? `${theme.radius.lg} ${theme.radius.lg} 0 0`
                                : `${theme.radius.lg} 0 0 ${theme.radius.lg}`,
                            overflow: "hidden",
                        }}
                    >
                        <Map location={location} is_fullScreen>
                            <Circle
                                ref={reftest}
                                center={{
                                    lat: location?.lat as number,
                                    lng: location?.lng as number,
                                }}
                                draggable={false}
                                radius={radius}
                                editable
                                options={{
                                    strokeColor: "transparent",
                                    fillColor: "#4DABF7",
                                    clickable: false,
                                }}
                                onRadiusChanged={() => handleCircleRadius()}
                            />
                            <Button
                                size="md"
                                sx={{
                                    float: "right",
                                    marginRight: theme.spacing.md,
                                    position: "absolute",
                                    top: "85%",
                                    zIndex: 1000,
                                    background: theme.colors.brand[3],
                                    color: theme.white,
                                    borderRadius: theme.radius.sm,
                                    padding: `0 ${theme.spacing.lg}`,
                                    "&:hover": {
                                        background: theme.colors.brand[4],
                                        transform: "translateY(-2px)",
                                        boxShadow: theme.shadows.sm,
                                    },
                                    transition: "all 0.2s ease",
                                }}
                                onClick={() => {
                                    dispatch(
                                        update({
                                            data: {
                                                latitude: location.lat,
                                                longitude: location.lng,
                                                city: userPlaceLocate ? userPlaceLocate.split(",")[0] : "",
                                                country: userPlaceLocate
                                                    ? userPlaceLocate.split(",")[userPlaceLocate.split(",").length - 1]
                                                    : "",
                                            },
                                            radius: handleCircleRadius(),
                                            isError: false,
                                            isLoading: false,
                                            isSuccess: true,
                                        })
                                    );
                                }}
                            >
                                Confirm Location
                            </Button>
                            {!(isHotelTab) && (
                                <>
                                    {is_bookmark
                                        ? entity?.map((item: any) =>
                                            item?.data?.extra_data?.map((extra: any, i: number) =>
                                                extra?.latitude && extra?.longitude ? (
                                                    <OverlayViewF
                                                        key={`bm-${item.data.id}-${i}`}
                                                        position={{ lat: extra.latitude, lng: extra.longitude }}
                                                        mapPaneName="overlayMouseTarget"
                                                        getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h / 2 })}
                                                    >
                                                        <MapMarker icons={item.data.icon} data={item.data} />
                                                    </OverlayViewF>
                                                ) : null
                                            )
                                        )
                                        : entity?.map((item: any) =>
                                            item?.extra_data?.map((extra: any, i: number) =>
                                                extra?.latitude && extra?.longitude ? (
                                                    <OverlayViewF
                                                        key={`${item.id}-${i}`}
                                                        position={{ lat: extra.latitude, lng: extra.longitude }}
                                                        mapPaneName="overlayMouseTarget"
                                                        getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h / 2 })}
                                                    >
                                                        <MapMarker icons={item.icon} data={item} />
                                                    </OverlayViewF>
                                                ) : null
                                            )
                                        )}
                                </>
                            )}

                            {/* === HOTEL MARKERS (only in Hotel tab OR Explore) === */}
                            {(isHotelTab || !isTaskTab && !isServiceTab) &&
                                hotels.map((hotel) => {
                                    if (!hotel.latitude || !hotel.longitude) return null;

                                    return (
                                        <OverlayViewF
                                            key={`hotel-marker-${hotel.id}`}
                                            position={{ lat: hotel.latitude, lng: hotel.longitude }}
                                            mapPaneName="overlayMouseTarget"
                                            getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h })}
                                        >
                                            <HotelMapMarker icons={hotel.icon || "<?xml version=\"1.0\" encoding=\"utf-8\"?><svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 122.88 78.63\" style=\"enable-background:new 0 0 122.88 78.63\" xml:space=\"preserve\"><style type=\"text/css\">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style><g><path class=\"st0\" d=\"M3.36,0h7.3c1.85,0,3.36,1.56,3.36,3.36v43.77h37.33L61.99,9.69h41.85c10.47,0,19.04,8.59,19.04,19.04v19.04 h-0.02c0.01,0.12,0.02,0.24,0.02,0.37v30.49h-14.02V64.32H14.02v13.66H0V3.36C0,1.51,1.51,0,3.36,0L3.36,0z M35.44,10.37 c8.62,0,15.61,6.99,15.61,15.61c0,8.62-6.99,15.61-15.61,15.61c-8.62,0-15.61-6.99-15.61-15.61 C19.83,17.36,26.82,10.37,35.44,10.37L35.44,10.37z\"/></g></svg>"} hotel={hotel} />
                                        </OverlayViewF>
                                    );
                                })}


                            {location?.lat && location?.lng && (
                                <MarkerF
                                    icon={"/svgs/pin.svg"}
                                    draggable
                                    onDragEnd={(e) => {
                                        setLocation({
                                            id: "",
                                            lat: e.latLng?.lat() ?? 1,
                                            lng: e.latLng?.lng() ?? 1,
                                        });
                                    }}
                                    position={{
                                        lat: location?.lat,
                                        lng: location?.lng,
                                    }}
                                />
                            )}
                        </Map>
                    </Box>
                )}
            </Transition>

            {/* Service Cards Section */}
            {/*<Paper >*/}
            <Box
                sx={{
                    marginTop: "10px",
                    flex: smallScreen ? "1" : "0 0 40%",
                    height: smallScreen ? (mapOpened ? "50%" : "100%") : "100%",
                    overflow: "hidden",
                    background: theme.white,
                    borderRadius: smallScreen
                        ? `0 0 ${theme.radius.md} ${theme.radius.md}`
                        : `0 ${theme.radius.md} ${theme.radius.md} 0`,
                    boxShadow: smallScreen ? "none" : theme.shadows.lg,
                    position: "relative",
                    transition: "height 0.3s ease",
                }}
            >
                <ScrollArea h="100%" scrollbarSize={8} offsetScrollbars>
                    <Box p="md">
                        {!isHotelTab && entity?.map((item, index) => (
                                    <Box
                                        key={index}
                                        mb="sm"
                                        ref={isLastTaskerOnPage(index) ? ref : null}
                                        onClick={() => {
                                            setCurrentLocation({
                                                id: item?.id,
                                                lat: item?.city?.latitude,
                                                lng: item?.city?.longitude,
                                            });
                                        }}
                                    >
                                        <ServiceCard is_map={true} service={item}/>
                                    </Box>
                                ))
                        }
                        {!isTaskTab && !isServiceTab && (
                        <>
                            {hotelsLoading ? (
                                <SkeletonServiceCard  />
                            ) : hotels.length > 0 ? (
                                hotels.map((hotel) => (
                                    <Box key={hotel.id} mb="sm">
                                        <HotelCard hotel={hotel} />
                                    </Box>
                                ))
                            ) : (
                                <Empty
                                    title="No hotels found"
                                    description="No hotels available in this area"
                                />
                            )}
                        </>
                        )}
                        {isFetchingNextPage || isFetching ? (
                            <SkeletonServiceCard/>
                        ) : null}
                        {!isFetching && !entity.length ? (
                            <Empty
                                title="No data found."
                                description="No Data in this selected region"
                                link=""
                            />
                        ) : null}
                    </Box>
                </ScrollArea>

                {/* Toggle Button for Map */}
                {smallScreen && (
                    <Button
                        onClick={mapOpened ? closeMap : openMap}
                        pos="absolute"
                        // variant="light"
                        sx={{
                            zIndex: 20,
                            top: mapOpened ? "0%" : "0",
                            left: "50%",
                            transform: "translateX(-50%)",
                            transition: "all 0.2s ease",
                            borderRadius: theme.radius.full,
                            boxShadow: theme.shadows.sm,
                            "&:hover": {
                                background: theme.colors.brand[4],
                                color: theme.white,
                                transform: "translateX(-50%) scale(1.1)",
                            },
                        }}
                        px="xs"
                    >Map
                        {!mapOpened ? <IconChevronDown size={20}/> : <IconChevronUp size={20}/>}
                    </Button>
                )}
            </Box>
            {/*</Paper>*/}
        </Box>
    );
};

export default EntityMapView;
