import {Box, MantineNumberSize} from "@mantine/core";
import { Button } from "@mantine/core";
import { Title } from "@mantine/core";
import { Flex } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { Modal } from "@mantine/core";
import {LoadScriptProps, MarkerF} from "@react-google-maps/api";
import { Marker, useJsApiLoader } from "@react-google-maps/api";
import { AxiosError } from "axios";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import React from "react";

import Map from "@/components/common/Map";
import { update } from "@/features/utils/locationSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useGeocoding } from "@/hooks/useGeocoding";
import type { LocationProps } from "@/types/LocationProps";
import { getGoogleMapsApiKey } from "@/utils/getApiKey";

import { PlacesAutocomplete } from "./common/form/PlacesAutoComplete";

const libraries: LoadScriptProps["libraries"] = ["places"];

export const MapModal = ({
    opened,
    setOpened,
}: {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
}) => {
    const theme = useMantineTheme();

    const { data: location, radius } = useAppSelector(
        (state) => state.locationReducer
    );

    const dispatch = useAppDispatch();

    const [currentLocation, setCurrentLocation] = useState<{
        lat: LocationProps["data"]["latitude"];
        lng: LocationProps["data"]["longitude"];
    }>({
        lat: location?.latitude ?? 27.687704388566267,
        lng: location?.longitude ?? 85.32785164044478,
    });

    const { data } = useGeocoding(
        `${currentLocation.lat},${currentLocation.lng}`
    );

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: getGoogleMapsApiKey(),
        libraries,
    });

    const HandleLocationSet = async () => {
        try {
            dispatch(
                update({
                    radius: radius,
                    data: {
                        latitude: currentLocation?.lat,
                        longitude: currentLocation?.lng,
                        city: data ? data.split(",")[0] : "",
                        country: data
                            ? data.split(",")[data.split(",").length - 1]
                            : "",
                    },
                    status: "success",
                    isError: false,
                    isLoading: false,
                    isSuccess: true,
                })
            );
            setOpened(false);
            return data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(error?.response?.data?.message);
            }
            throw new Error("Failed to fetch weather data");
        }
    };

    return (
        <Modal.Root
            opened={opened}
            onClose={() => setOpened(false)}
            centered
            size={"100%"}
            zIndex={9999999}
            scrollAreaComponent={Modal.NativeScrollArea}
        >
            <Modal.Overlay
                sx={{
                    opacity: 0.55,
                    blur: 3,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[9]
                            : theme.colors.gray[4],
                }}
            />
            <Modal.Content
                p={
                    {
                        base: "5px",
                    } as unknown as MantineNumberSize
                }
                sx={{
                    "& h3": {
                        marginBottom: 0,
                    },
                }}
            >
                <Modal.Header
                    sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "end",
                    }}
                >
                    <Modal.CloseButton />
                </Modal.Header>
                <Modal.Body
                    sx={{
                        "& p": {
                            color: theme.colors.gray[7],
                            fontWeight: 400,
                            marginBottom: 16,
                            "& span": { color: theme.colors.gray[8] },
                        },
                    }}
                >
                    {isLoaded ? (
                        <>
                            <Flex justify={"start"} gap={24} mb={24}>
                                <Title order={4} fw={400} size={16}>
                                    Choose your location
                                </Title>
                                <PlacesAutocomplete
                                    setCurrentLocation={setCurrentLocation}
                                />
                            </Flex>
                            <Map
                                location={{
                                    id: "1",
                                    lat: currentLocation.lat,
                                    lng: currentLocation.lng,
                                }}
                                is_fullScreen
                                onClick={(e) =>
                                    setCurrentLocation({
                                        lat: e.latLng?.lat() ?? null,
                                        lng: e.latLng?.lng() ?? null,
                                    })
                                }
                            >
                                {currentLocation?.lat &&
                                    currentLocation?.lng && (
                                        <MarkerF
                                            icon={"/svgs/pin.svg"}
                                            draggable
                                            onDragEnd={(e) => {
                                                setCurrentLocation({
                                                    lat:
                                                        e.latLng?.lat() ?? null,
                                                    lng:
                                                        e.latLng?.lng() ?? null,
                                                });
                                            }}
                                            position={{
                                                lat: currentLocation?.lat,
                                                lng: currentLocation?.lng,
                                            }}
                                        />
                                    )}
                            </Map>
                            <Box
                                sx={{
                                    position: "fixed",
                                    bottom: 24,
                                    right: 24,
                                    zIndex: 10000000,
                                }}
                            >
                                <Button size="md" onClick={HandleLocationSet}>
                                    Set Location
                                </Button>
                            </Box>
                        </>
                    ) : (
                        ""
                    )}
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
