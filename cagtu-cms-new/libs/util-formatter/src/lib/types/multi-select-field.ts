import { SelectItem } from '@mantine/core';
import { ReactNode } from 'react';

export interface MultiSelectFieldProps {
    name: string;
    labelName?: ReactNode;
    placeHolder?: string;
    error?: string;
    touch?: boolean;
    textMuted?: string;
    options: string[];
    handleCreateLabel?: (value: string) => ReactNode;
    handleCreate?: (value: string) => string;
}
export interface CreatableInputFieldProps {
    name: string;
    labelName?: ReactNode;
    placeHolder?: string;
    error?: string;
    touch?: boolean;
    textMuted?: string;
    fieldRequired?: boolean;
    options?: { value: string; label: string }[];
    handleCreateLabel?: (value: string) => ReactNode;
    handleCreate?: (value: string) => string | SelectItem;
    nothingFound?: ReactNode;
}
