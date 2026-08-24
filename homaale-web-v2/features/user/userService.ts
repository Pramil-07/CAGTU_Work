import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

import type { User } from "@/types/UserProps";
import { getApiEndpoint } from "@/utils/helpers";

const fetchUser = async (refresh: string) => {
    const access = Cookies.get("access");
    const { user_id } = jwtDecode<{ user_id: string }>(refresh);
    const url = new URL(`/api/v1/user/${user_id}`, getApiEndpoint());

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${access}`,
        },
    });

    const user = (await response.json()) as User;
    return user;
};

const userService = {
    fetchUser,
};
export default userService;
