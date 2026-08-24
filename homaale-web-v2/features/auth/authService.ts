import axios from "axios";
import Cookies from "js-cookie";

import urls from "@/constants/urls";
import type {
    FacebookLoginProps,
    GoogleLoginProps,
    LoginInputProps,
} from "@/types/LoginInputProps";
import type { LoginResponseProps } from "@/types/LoginResponseProps";
import { axiosClient } from "@/utils/axiosClient";
import { getApiEndpoint } from "@/utils/helpers";

// import { reset as profileReset } from "../profile/profileSlice";
// import { reset as userReset } from "../user/userSlice";
// import { reset as authReset } from "./authSlice";

const login = async (loginData: LoginInputProps) => {
    const response = await axios.post<LoginResponseProps>(
        `${getApiEndpoint()}${urls.auth.login}`,
        loginData
    );
    return response.data;
};

const googleLogin = async (googleLogindata: GoogleLoginProps) => {
    const response = await axiosClient.post<LoginResponseProps>(
        `${getApiEndpoint()}${urls.auth.google}`,
        googleLogindata
    );
    return response.data;
};
const facebookLogin = async (facebookLogindata: FacebookLoginProps) => {
    const response = await axios.post<LoginResponseProps>(
        `${getApiEndpoint()}${urls.auth.facebook}`,
        facebookLogindata
    );
    return response.data;
};

// const refresh = async (refresh: string) => {
//     const url = new URL("/api/v1/user/token/refresh/", getApiEndpoint());
//     const response = fetch(url.href, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//         },
//         body: JSON.stringify({ refresh: refresh }),
//     });
//     return (await response).json();
// };
const logout = () => {
    Cookies.remove("access");
    Cookies.remove("refresh");
    Cookies.remove("credentials");
    // store.dispatch(profileReset());
    // store.dispatch(authReset());
    // store.dispatch(userReset());
};

const authService = {
    login,
    googleLogin,
    facebookLogin,
    // refresh,
    logout,
};

export default authService;
