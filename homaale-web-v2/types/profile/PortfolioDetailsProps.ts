export interface PortfolioDetailsValuesProps {
    id: number;
    images: Array<{
        id: number;
        name: string;
        size: string;
        media_type: string;
        media: string;
    }>;
    files: Array<{
        id: number;
        name: string;
        size: string;
        media_type: string;
        media: string;
    }>;
    title: string;
    description: string;
    issued_date: string;
    credential_url: string;
}
