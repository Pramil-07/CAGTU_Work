import {useQuery} from "@tanstack/react-query";
import axios from "axios";

import type {GeocodingResponse} from "@/types/GeocodingResponse";

const getGoogleMapsApiKey = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
    if (!apiKey) throw new Error("Google Maps API key is not defined");
    return apiKey;
};

export const useGeocoding = (latlng: string | null) =>
    useQuery(
        ["google-geocoding", latlng],
        async () => {
            const response = await axios.get<GeocodingResponse>(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&result_type=sublocality|locality|political&key=${getGoogleMapsApiKey()}`
            );

            const result = response.data.results?.[0];

            if (!result?.formatted_address) {
                console.warn("No formatted_address found for:", latlng);
                return null;
            }

            return result.formatted_address;
        },
        {
            onError: (e) => console.log("first", e),
            enabled: !!latlng,
        }
    );

