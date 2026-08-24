"use client";
import {useInterval} from "@mantine/hooks";
import type {GoogleMapProps, LoadScriptProps} from "@react-google-maps/api";
import {
    GoogleMap as ReactGoogleMap,
    useJsApiLoader,
    StandaloneSearchBox,
} from "@react-google-maps/api";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {getGoogleMapsApiKey} from "@/utils/getApiKey";
import {useDark} from "@/utils/helpers";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {IconSearch} from "@tabler/icons-react";
import type {LocationProps} from "@/types/LocationProps";
import {useAppSelector} from "@/hooks";
import {PlacesAutocomplete} from "@/components/common/form/PlacesAutoComplete";
import router from "next/router";
import {usePathname} from "next/navigation";

export type LatLngLiteral = google.maps.LatLngLiteral;
export type GoogleMapOptions = google.maps.MapOptions;
export type Map = google.maps.Map;

const LIBRARIES: LoadScriptProps["libraries"] = ["places"];

const Map = ({
                 children,
                 is_fullScreen,
                 location,
                 style,
                 onLocationChange,
                 ...rest
             }: GoogleMapProps & {
    style?: React.CSSProperties;
    is_fullScreen?: boolean;
    location?: { id: string; lat: number | null; lng: number | null };
    onLocationChange?: (location: { id: string; lat: number; lng: number }) => void;
}): any => {


    const loaderOptions = useMemo(() => ({
        id: "google-map-script",
        googleMapsApiKey: getGoogleMapsApiKey(),
        libraries: ["places"] as LoadScriptProps["libraries"],
    }), []);

    const {isLoaded, loadError} = useJsApiLoader(loaderOptions);


    const mapRef = useRef<Map | null>(null);
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
    const [zoom, setZoom] = useState(6);
    const [error, setError] = useState<string | null>(null);
    const dark = useDark();
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        console.log("isLoaded:", isLoaded, "loadError:", loadError);
        if (loadError) {
            setError(`Failed to load Google Maps: ${loadError.message}`);
        }
    }, [isLoaded, loadError]);

    const pathname =usePathname();
    const hotelPage = pathname?.includes("/hotels");

    const options = useMemo<GoogleMapOptions>(
        () => ({
            fullscreenControl: true,
            disableDefaultUI: true,
            styles: dark
                ? [
                    {elementType: "geometry", stylers: [{color: "#242f3e"}]},
                    {elementType: "labels.text.stroke", stylers: [{color: "#242f3e"}]},
                    {elementType: "labels.text.fill", stylers: [{color: "#746855"}]},
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#f1f1f1"}],
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#fbae50"}],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "geometry",
                        stylers: [{color: "#263c3f"}],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#6b9a76"}],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{color: "#ffffff"}],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{color: "#ffffff"}],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#ffffff"}],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry",
                        stylers: [{color: "#ffffff"}],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.stroke",
                        stylers: [{color: "#ffffff"}],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#ffffff"}],
                    },
                    {
                        featureType: "transit",
                        elementType: "geometry",
                        stylers: [{color: "#2f3948"}],
                    },
                    {
                        featureType: "transit.station",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#d59563"}],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{color: "#17263c"}],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#515c6d"}],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.stroke",
                        stylers: [{color: "#17263c"}],
                    },
                ]
                : [],
        }),
        [dark]
    );

    const center = {
        lat: location?.lat ?? 27.687704388566267,
        lng: location?.lng ?? 85.32785164044478,
    };

    const onLoad = useCallback(
        (map: Map) => {
            console.log("Map loaded with center:", center);
            mapRef.current = map;
            if (location?.lat && location?.lng) {
                map.setCenter({lat: location.lat, lng: location.lng});
                map.setZoom(12);
            }
        },
        [location, center]
    );

    const onUnmount = useCallback(() => {
        console.log("Map unmounted");
        mapRef.current = null;
    }, []);

    const interval = useInterval(() => {
        setZoom((previousZoom) =>
            previousZoom < 12 ? previousZoom + 1 : previousZoom
        );
    }, 50);

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, [interval]);

    const onSearchBoxLoad = useCallback((searchBox: google.maps.places.SearchBox) => {
        console.log("SearchBox loaded");
        searchBoxRef.current = searchBox;
    }, []);

    const handleonPlaceChanged = useCallback(() => {
        const places = searchBoxRef.current?.getPlaces();
        console.log("Places selected:", places);
        if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const newLocation = {id: "", lat, lng};

                interval.stop();
                if (place.geometry.viewport) {
                    mapRef.current?.fitBounds(place.geometry.viewport);
                } else {
                    mapRef.current?.panTo({lat, lng});
                    mapRef.current?.setZoom(17);
                }

                if (onLocationChange) {
                    onLocationChange(newLocation);
                }
            } else {
                console.log("No geometry available for place:", place?.name);
            }
        } else {
            console.log("No places selected");
        }
    }, [interval, onLocationChange]);

    if (error) {
        return <div style={{color: "red", padding: "20px"}}>Error: {error}</div>;
    }

    if (!isLoaded) {
        return <HomaaleLoader/>;
    }

    return (
        <ReactGoogleMap
            {...rest}
            zoom={zoom}
            options={options}
            mapContainerStyle={{
                width: "100%",
                height: is_fullScreen ? "75vh" : hotelPage ? "100%"  : "45vh",
                borderRadius: "4px",
            }}
            center={center}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >


            {children}
        </ReactGoogleMap>
    );
};

export default Map;
