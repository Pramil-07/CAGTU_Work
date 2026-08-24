import { ReactNode } from 'react';

export interface SelectFieldProps {
    name: string;
    labelName?: ReactNode;
    placeHolder?: string;
    error?: string;
    touch?: boolean;
    textMuted?: string;
    options: string[] | { value: string; label: string }[];
    handleChange: (value: string) => void;
}
export interface SelectInputFieldProps {
    name: string;
    labelName?: ReactNode;
    placeHolder?: string;
    error?: string;
    touch?: boolean;
    textMuted?: ReactNode;
    searchable?: boolean;
    clearable?: boolean;
    handleChange: (value: string) => void;
    options: { value: string; label: string }[];
    nothingFound?: ReactNode;
}
