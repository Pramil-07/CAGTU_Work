export interface PortfolioValueProps {
    title: string;
    description: string;
    credential_url: string;
    issued_date: string;
    id: number;
    files: File[] | any;
    images: File[] | any;
    imagePreviewUrl?: any[];
    pdfPreviewUrl?: any[];
}
