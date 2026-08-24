export interface CurrencyResult {
    code: string;
    name: string;
    current_value: string | number;
    is_active: boolean;
    is_default: boolean;
    enable_currency_configuration: boolean;
    minor: string;
    symbol: string;
}
export interface ExchangeRateResult {
    id: number | null;
    value: string | number;
    currency: {
        code: string | null;
        name: string;
    };
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
    is_default: boolean;
    enable_currency_configuration: boolean;
}
export interface ExchangeRateFormValueProps {
    id: number | null;
    value: string | number;
    currency: string;
    status: string;
    is_active: boolean;
    is_default: boolean;
    enable_currency_configuration: boolean;
}

export interface LanguageResult {
    code: string;
    name: string;
    is_active: boolean;
    is_default: boolean;
    enable_language_configuration: boolean;
}
export interface CountryResult {
    code: string;
    name: string;
    local_name: string;
    phone_code: string;
    is_active: boolean;
    currency: {
        code: string;
        name: string;
    };
    language: {
        code: string;
        name: string;
    };
}
export interface CountryFormValueProps {
    code: string;
    name: string;
    local_name: string;
    phone_code: string;
    currency: string;
    language: string;
    is_active: boolean;
}
export interface CityResult {
    id: number | null;
    name: string;
    local_name: string;
    zip_code: string;
    country: {
        id: number | null;
        name: string;
    };
}
export interface CityFormValueProps {
    id: number | null;
    name: string;
    local_name: string;
    zip_code: string;
    country: string;
}
export interface BankResult {
    id: number | null;
    name: string;
    swift_code: string;
    is_active: boolean;
    logo: unknown[];
    country: {
        code: string;
        name: string;
    };
}
export interface BankFormValuesProps {
    id: number | null;
    name: string;
    swift_code: string;
    is_active: boolean;
    country: string;
    logo: any[];
    profilePreviewUrl?: any[];
}
export interface BranchResult {
    id: number | null;
    name: string;
    is_active: boolean;
    bank: {
        id: number | null;
        name: string;
    };
}
export interface BranchFormValuesProps {
    id: number | null;
    name: string;
    is_active: boolean;
    bank: string;
}

export interface TopSkillsResult {
    id: number | null;
    skills: string;
    country: {
        code: string;
        name: string;
    };
}

export interface TopSkillsFormValuesProps {
    id: number | null;
    skills: string[];
    country: string;
}

export interface SkillsResult {
    id: number | null;
    name: string;
}

export interface SkillsFormValuesProps {
    name: string;
}
