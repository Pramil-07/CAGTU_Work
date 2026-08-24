export interface TaxCalculatorValueProps {
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

export const TaxCalculatorFormData: TaxCalculatorValueProps = {
    gender: "",
    marital_status: "",
    salary: "",
    income_time: "Monthly",
    festival_bonus: null,
    allowance: null,
    others: null,
    pf: null,
    cit: null,
    life_insurance: null,
    medical_insurance: null,
};
