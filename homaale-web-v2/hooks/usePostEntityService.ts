import { useMutation } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

import type { EntityServiceDetailProps } from "@/types/EntityServiceDetailProps";

export const usePostEntityService = (is_requested: boolean) => {
    return useMutation(async ({ id, data }: { id?: string; data: any }) => {
        if (id !== undefined) {
            return await axiosClient
                .patch<EntityServiceDetailProps>(
                    `${urls.entity.list}${id}/`,
                    data
                )
                .then((response) => response.data);
        } else {
            return await axiosClient
                .post<EntityServiceDetailProps>(
                    `${urls.entity.list}?is_requested=${is_requested}`,
                    data
                )
                .then((response) => response.data);
        }
    });
};
