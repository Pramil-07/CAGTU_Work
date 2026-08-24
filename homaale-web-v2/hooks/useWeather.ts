import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { useAppSelector } from "@/hooks";
import type { Weather } from "@/types/Weather";

export const useWeather = () => {
    const { data: location } = useAppSelector((state) => state.locationReducer);
    const getOpenWeatherApiKey = () => {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (apiKey === undefined)
            throw new Error(
                "Please specify an API key in the environment variable NEXT_PUBLIC_OPEN_WEATHER_API_KEY"
            );
        return apiKey;
    };

    const openWeatherBaseUrl =
        "https://api.openweathermap.org/data/2.5/weather";
    const query = new URLSearchParams({
        lat: location?.latitude?.toString() as string,
        lon: location?.longitude?.toString() as string,
        units: "metric",
        appId: getOpenWeatherApiKey(),
    });

    const url = `${openWeatherBaseUrl}?${query.toString()}`;

    return useQuery(
        [
            "weather-data",
            location?.latitude?.toString(),
            location?.longitude?.toString(),
        ],
        async () => {
            try {
                const { data } = await axios.get<Weather>(url);
                return data;
            } catch (error) {
                if (error instanceof AxiosError) {
                    throw new Error(error?.response?.data?.message);
                }
                throw new Error("Failed to fetch weather data");
            }
        },
        { enabled: !!location, retry: false }
    );
};
