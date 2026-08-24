import { ReactNode } from 'react';

export interface PasswordInputFieldProps {
    name: string;
    labelName?: ReactNode;
    placeHolder?: string;
    error?: string;
    touch?: boolean;
    fieldRequired?: boolean;
    textMuted?: string;
    icon?: ReactNode;
}
