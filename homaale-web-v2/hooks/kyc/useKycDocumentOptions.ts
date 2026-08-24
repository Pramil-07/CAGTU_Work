import { useQuery } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

export type KycDocumentOptionsProps = Array<{
    id: number;
    name: string;
    required_for_user?: boolean;
    required_for_merchant?: boolean;
}>;

export const useKycDocumentOption = () => {
    return useQuery(["kyc-document-options"], async () => {
        try {
            const { data } = await axiosClient.get<KycDocumentOptionsProps>(
                urls.kyc.getDocumentType
            );
            const KycDocuments = data.map((document) => ({
                id: document?.id,
                label: document?.name,
                value: document?.id.toString(),
            }));
            return KycDocuments;
        } catch (error) {
            console.log(
                "🚀 ~ file: useKycDocumentOptions.ts:25 ~ returnuseQuery ~ error:",
                error
            );
        }
    });
};
