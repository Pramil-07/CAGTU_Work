export interface HoroscopeResult {
    id: number | null;
    is_nepali: boolean;
    sign: number;
    description: string;
    start_date: string;
    end_date: string;
    type: number;
}

export interface HoroscopeFormValueProps {
    id: number | null;
    is_nepali: boolean;
    sign: number;
    description: string;
    start_date: string;
    end_date: string;
    type: number;
}
