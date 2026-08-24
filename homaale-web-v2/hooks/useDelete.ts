import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

export const useDelete = <TData = unknown, TPayload = unknown>(url: string) => {
    return useMutation<TData, Error, TPayload>(async () => {
        try {
            const { data } = await axiosClient.delete<TData>(url);
            return data;
        } catch (error: any) {
            throw new Error(error);
        }
    });
};
