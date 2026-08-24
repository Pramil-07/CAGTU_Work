import { useQuery } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

import type { SecurityAnswersProps } from "@/types/SecurityAnswersProps";

export const useSecurityAnswers = () => {
    return useQuery(["security-answers"], async () => {
        try {
            const { data } = await axiosClient.get<SecurityAnswersProps>(
                urls.auth.securityAnswer
            );
            return data;
        } catch (error) {
            console.log(
                "🚀 ~ file: useSecurityAnswers.ts:15 ~ returnuseQuery ~ error:",
                error
            );
        }
    });
};
