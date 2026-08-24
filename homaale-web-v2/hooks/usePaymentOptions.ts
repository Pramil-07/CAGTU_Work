import { useQuery } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

export type PayementOptionProps = Array<{
    id: number;
    name: string;
}>;

export const usePaymentOptions = (filter: string | null, enabled: boolean) => {
    return useQuery(
        ["payment-options", filter],
        async () => {
            try {
                const { data } = await axiosClient.get<PayementOptionProps>(
                    urls.payment.option
                );
                const paymentItems = data.map((payment) => ({
                    id: payment?.id,
                    label: payment?.name,
                    value: payment?.id.toString(),
                }));
                return paymentItems;
            } catch (error) {
                console.log(
                    "🚀 ~ file: Filters.tsx:18 ~ const{data}=useQuery ~ error",
                    error
                );
            }
        },
        { enabled: !!filter || enabled }
    );
};
