import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";
import type { TaxCalculatorProps, TaxResult } from "@/types/TaxCalculatorProps";

export const useTaxCalculator = () => {
    return useMutation<TaxResult, Error, TaxCalculatorProps>(
        async (formDetails) => {
            try {
                const { data } = await axiosClient.post<TaxResult>(
                    urls.taxCalculator,
                    formDetails
                );
                return data;
            } catch (error) {
                if (error instanceof AxiosError) {
                    throw new Error(error?.response?.data?.message);
                }
                throw new Error("Something went wrong");
            }
        }
    );
};
