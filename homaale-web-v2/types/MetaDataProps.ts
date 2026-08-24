import type { ReactNode } from "react";

import type { BreadcrumbItems } from "./BreadCrumbProps";

export interface MetaDataProps {
    heading?: React.ReactNode;
    title?: string;
    description?: string;
    ogImage?: string;
    ogUrl?: string;
    keywords?: string;
    children: ReactNode;
    currentTitle?: string;
    breadCrumbsItems?: BreadcrumbItems[];
    hideBreadCrumbs?:boolean|false;
    setCurrency?: (currency: string) => void;
  
}
