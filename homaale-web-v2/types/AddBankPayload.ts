export type AddBankPayload = {
    bank_account_name: string;
    bank_account_number: string;
    is_primary: boolean;
    bank_name: number | null;
    branch_name: number | null;
};
