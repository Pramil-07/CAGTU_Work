export interface KycDocumentResult {
    id: string;
    name: string;
    required_for_merchant: boolean;
    required_for_user: boolean;
}

export interface KycDocumentFormValuesProps {
    name: string;
    required_for_merchant: string | boolean;
    required_for_user: string | boolean;
}
