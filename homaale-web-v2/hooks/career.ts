import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import type { CareerDetailsData } from "@/types/CareerListProps";

export const useCareer = (id: any) => {
    return useMutation<any, Error, CareerDetailsData>(async (careerPayload) => {
        const { data } = await axiosClient.post(
            `/career/candidate/apply/${id}/`,
            careerPayload
        );
        return data;
    });
};
