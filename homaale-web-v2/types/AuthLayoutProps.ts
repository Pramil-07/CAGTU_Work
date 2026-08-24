import type { ReactNode } from "react";

export type AuthLayoutProps = {
    title?: string;
    description?: string;
    ogUrl?: string;
    keywords?: string;
    children: ReactNode;
    rightImageText: string;
    heading: string;
    subHeading: string;
    bottomRedirectionQuestion: string;
    bottomRedirectionText: string;
    bottomRedirectionUrl: string;
};
