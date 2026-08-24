import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";
import { useEffect, useState } from "react";

export const useGetCookieUser = () => {
    const [userId, setUserId] = useState("");

    const fetchCookie = async () => {
        const access = Cookies.get("access");
        try {
            if (access) {
                const { user_id } = jwtDecode<{ user_id: string }>(access);
                setUserId(user_id);
            }
        } catch (error) {
            console.log(
                "🚀 ~ file: useGetCookieUser.ts:11 ~ useGetCookieUser ~ error:",
                error
            );
        }
    };
    useEffect(() => {
        fetchCookie();
    }, []);
    return userId;
};
