import { useQuery } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

import type { SecurityQuestionsProps } from "@/types/SecurityQuestionsProps";

export const useSecurityQuestion = () => {
    return useQuery(["currency-options"], async () => {
        try {
            const { data } = await axiosClient.get<SecurityQuestionsProps>(
                urls.auth.securityQuestion
            );
            const questions = data.map((question) => ({
                id: question?.id,
                label: `${question?.question}`,
                value: `${question?.id}`,
            }));
            return questions;
        } catch (error) {
            console.log(
                "🚀 ~ file: useSecurityQuestions.ts:20 ~ returnuseQuery ~ error:",
                error
            );
        }
    });
};
