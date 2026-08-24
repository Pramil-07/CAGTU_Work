import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";
import type { FileStoreUploadPayload } from "@/types/FileStoreUploadPayload";

/**
 * This hook calls file store api and returns array of id with respect to the files uploaded
 * @returns Array of IDs
 */
export const useFileStore = () => {
    return useMutation<number[], AxiosError, FileStoreUploadPayload>(
        async (payload) => {
            const { files, media_type, url, placeholder } = payload;
            if (typeof files === "string") return [];
            const fileFormData = new FormData();
            const filesToUpload = Array.isArray(files) ? files : [files];
            if (filesToUpload.length <= 0) return [];
            for (const fileToUpload of filesToUpload) {
                fileFormData.append("medias", fileToUpload);
                fileFormData.append("media_type", media_type ?? "image");
                fileFormData.append("placeholder", placeholder ?? "file");
            }
            const { data } = await axiosClient.post<{ data: number[] }>(
                url ?? urls.filestore,
                fileFormData
            );
            return data.data;
        }
    );
};
