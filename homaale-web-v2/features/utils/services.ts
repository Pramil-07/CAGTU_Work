import axios from "axios";

import urls from "@/constants/urls";
import type { LocationProps } from "@/types/LocationProps";
import { getApiEndpoint } from "@/utils/helpers";

const location = async () => {
    const response = await axios.get<LocationProps>(
        `${getApiEndpoint()}${urls.location}`
    );
    return response.data;
};

const utilsService = {
    location,
};

export default utilsService;
