import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";
import type { FeedbackValuespayloadProps } from "@/types/FeedbackValuePayladProps";
export const useFeedbackCategoryOption = () => {
    return useQuery(["feedback_category"], async () => {
        try {
            const { data } = await axiosClient.get<FeedbackValuespayloadProps>(
                `${urls.feedbackcategory}`
            );
            const FeedbackCategoryTypes = data?.map((category) => ({
                id: category?.name,
                label: category?.name,
                value: category?.id,
            }));
            return FeedbackCategoryTypes;
        } catch (error) {
            console.log(error);
        }
    });
};
