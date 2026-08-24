import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

export const useForm = <TData = unknown, TPayload = unknown>(url: string) => {
    return useMutation<TData, Error, TPayload>(async (payload) => {
        const { data } = await axiosClient.post<TData>(url, payload);
        return data;
    });
};
