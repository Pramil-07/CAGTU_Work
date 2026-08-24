import { ReactNode } from 'react';

export interface SwitchCheckboxProps {
    name: string;
    labelName: ReactNode;
    checked?: boolean;
    error?: string;
}
