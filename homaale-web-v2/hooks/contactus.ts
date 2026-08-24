import { useMutation } from "@tanstack/react-query";
import type { ContactValuesProps } from "types/contact"
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

export const useContact = () => {
    return useMutation<any, Error, ContactValuesProps>(
        async (contactPayload) => {
            const { data } = await axiosClient.post(
                `${urls.contactus}`,
                contactPayload
            );
            return data;
        }
    );
};
