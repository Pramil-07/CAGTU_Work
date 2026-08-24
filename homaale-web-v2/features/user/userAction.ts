import Cookies from "js-cookie";

import userService from "./userService";

export const GetUser = async () => {
    const access = Cookies.get("access") ?? "";
    const response = await userService.fetchUser(access);
    return response;
};
