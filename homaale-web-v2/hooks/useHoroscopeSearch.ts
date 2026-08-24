import { useMemo } from "react";
import { useBrandData } from "@/brand/BrandContext";
import { PAGE_INDEX } from "@/staticData/keywordsForSearch";

export const useHoroscopeSearch = () => {
    const { brandData } = useBrandData();

    return useMemo(() => {
        return PAGE_INDEX.map(page => {
            if (page.key === "horoscopeSearch") {
                const newPath = brandData?.name === "Cagtu"
                    ? "/horoscope/english"
                    : "/horoscope/nepali";
                return { ...page, path: newPath };
            }
            return page;
        });
    }, [brandData?.name]);
};
