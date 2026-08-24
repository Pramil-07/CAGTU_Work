export type KYCDocumentDetailsProps = {
    id: number;
    document_type: {
        id: number;
        name: string;
        required_for_user: boolean;
        required_for_merchant: boolean;
    };
    created_at: string;
    updated_at: string;
    document_id: string;
    file?: string;
    issuer_organization: string;
    issued_date: string;
    valid_through: string;
    is_verified: boolean;
    is_company: boolean;
    comment: string;
    kyc: number;
};
