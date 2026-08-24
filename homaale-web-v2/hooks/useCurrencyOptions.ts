import { useQuery } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

import type { CurrencyOptionsProps } from "@/types/CurrencyOptionsProps";
const symbolToCountry: Record<string, string> = {
    'AU$': 'Australia',
    'A$': 'Australia',
    'NZ$': 'New Zealand',
    '$': 'United States',
    '₹': 'India',
    '₨': 'Nepal',
    'रु': 'Nepal',
    'NPR': 'Nepal',
    '£': 'United Kingdom',
    '€': 'European Union',
    '¥': 'Japan',
    'CN¥': 'China',
    '₩': 'South Korea',
    '₽': 'Russia',
    '₺': 'Turkey',
    'R$': 'Brazil',
    'C$': 'Canada',
};
export const useCurrencyOption = () => {
    return useQuery(["currency-options"], async () => {
        try {
            const { data } = await axiosClient.get<CurrencyOptionsProps>(
                urls.locale.currency
            );
            const currencyItems = data.map((currency) => {
                const symbol = currency?.symbol?.trim() ?? '';
                const countryName = symbolToCountry[symbol] || currency?.name;
                return {
                    id: currency?.code,
                    label: `${countryName} (${currency?.code}) `,
                    symbol: currency?.symbol,
                    value: currency?.code,
                };
            });
            return currencyItems;
        } catch (error) {
            console.log(
                "🚀 ~ file: Filters.tsx:18 ~ const{data}=useQuery ~ error",
                error
            );
        }
    });
};
