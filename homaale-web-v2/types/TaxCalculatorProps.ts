export interface TaxCalculatorProps {
    marital_status: string;
    gender: string;
    salary: number | null | string;
    income_time: string;
    festival_bonus: number | null | string;
    allowance: number | null | string;
    others: number | null | string;
    pf: number | null | string;
    cit: number | null | string;
    life_insurance: number | null | string;
    medical_insurance: number | null | string;
}

export interface TaxResult {
    status: string;
    details: Details;
    data: TaxTableResultData[];
}

export interface TaxTableResultData {
    name: string;
    taxable_amount: number;
    tax_liability: number;
    tax_rate: string;
}

export interface Details {
    "annual gross salary": number;
    "net taxable income": number;
    "tax rate": string;
    "net tax liability yearly": number;
    "net tax liability monthly": number;
    "rebate for female tax payers (10%)": number;
    "net payable tax yearly": number;
    "net payable tax monthly": number;
}
