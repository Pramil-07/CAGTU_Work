import axios from "axios";
import Cookies from "js-cookie";

import { logout } from "@/features/auth/authSlice";
import { store } from "@/store";

import { getApiEndpoint } from "./helpers";

const axiosClient = axios.create({
    baseURL: getApiEndpoint(),
});

axiosClient.interceptors.request.use(
    (config) => {
        const access = Cookies.get("access");
        if (access) {
            config.headers = {
                ...(config.headers as any),
                Authorization: `Bearer ${access}`,
            };
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let blocked = false;

axiosClient.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const originalConfig = err.config;

        if (originalConfig.url !== "/auth/login" && err.response) {
            // Access Token was expired
            if (
                err.response.status === 401 &&
                !originalConfig._retry &&
                !blocked
            ) {
                originalConfig._retry = true;
                try {
                    blocked = true;
                    await axios
                        .post(
                            `${getApiEndpoint()}/user/token/refresh/`,
                            JSON.stringify({ refresh: Cookies.get("refresh") }),
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Accept: "application/json",
                                },
                            }
                        )
                        .then((response) => {
                            blocked = false;
                            const access = response.data.access;
                            const refresh = response.data.refresh;

                            Cookies.set("access", access);
                            Cookies.set("refresh", refresh);
                        });

                    return axiosClient(originalConfig);
                } catch (_error) {
                    blocked = false;
                    // toast.error('Session time out. Please login again.');
                    // Logging out the user by removing all the tokens from local
                    store.dispatch(logout());
                    // Redirecting the user to the landing page
                    // window.location.href = window.location.origin;
                    return Promise.reject(_error);
                }
            }
        }

        return Promise.reject(err);
    }
);

export { axiosClient };
