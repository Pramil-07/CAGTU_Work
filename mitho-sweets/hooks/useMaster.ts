"use client";

import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import apiClient from "@/axiosConfig";

// Interfaces
interface Address {
    street_address: string;
    suburb: string;
    state: string;
    postcode: string;
    status: string;
    country: string;
}

interface Banner {
    id: number;
    title: string;
    quotes: string | null;
    description: string | null;
    image: string | null;
    header_banner_image: string | null;
    footer_banner_image: string | null;
    order: number;
    category_badge: string | null;
    banner_type: string;
}

interface ExtraInfo {
    note: string;
}

export interface ProfileData {
    id: number;
    phone_number: string | null;
    address: Address;
    banners: Banner[];
    created_at: string;
    updated_at: string;
    hotline_number: string | null;
    email: string | null;
    deleted_at: string | null;
    status: string;
    profile_name: string;
    profile_logo: string;
    phone: string | null;
    opening_day: string;
    closing_day: string;
    opening_time: string;
    closing_time: string;
    extra_info: ExtraInfo;
    user: string;
}

interface ApiResponse {
    status: string;
    data: ProfileData[];
}

export interface UseMasterProfilesReturn {
    profiles: ProfileData[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useMaster(): UseMasterProfilesReturn {
    const [profiles, setProfiles] = useState<ProfileData[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfiles = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.get("/master/");
            if (response.data.status === "success") {
                console.log("Fetched profiles:", response.data.data);
const profilesData = Array.isArray(response.data.data)
                ? response.data.data
                : response.data.data
                ? [response.data.data]
                : [];
            setProfiles(profilesData);            } else {
                throw new Error("API returned unsuccessful status");
            }
        } catch (err) {
            const message = (err as AxiosError<{ message?: string }>)?.response?.data?.message || "Failed to fetch profiles";
            setError(message);
            setProfiles(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    return { profiles, loading, error, refetch: fetchProfiles };
}