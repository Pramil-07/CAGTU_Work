"use client"

import { useState, useEffect } from "react"
import apiClient from "@/axiosConfig";
import {User} from "@/components/Profile/Profile";




interface UseUserReturn {
    user: User | null
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useUser(): UseUserReturn {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUser = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await apiClient.get("/account/customer/profile")
            setUser(response.data.data)
        } catch (err: any) {
            if (err.response?.status !== "success") {
                // User is not authenticated
                setUser(null)
                setError(null)
            } else {
                setError(err.response?.data?.message || err.message || "Failed to fetch user")
                setUser(null)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const refetch = () => {
        fetchUser()
    }

    return {
        user,
        loading,
        error,
        refetch,
    }
}
