import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";
import type { FeedbackValuesProps } from "@/types/feedback";

export const useFeedback = () => {
    return useMutation<any, Error, FeedbackValuesProps>(
        async (feedbackPayload) => {
            const { data } = await axiosClient.post(
                `${urls.feedback}`,
                feedbackPayload
            );
            return data;
        }
    );
};
