import { CSSProperties, ReactNode } from 'react';

export interface FileDropzoneProps {
    name: string;
    accept: string[];
    multiple?: boolean;
    maxSize: number;
    imagePreview?: string;
    error?: string;
    touch?: boolean;
    style?: CSSProperties;
}
export interface MultiFileDropzoneProps {
    name: string;
    labelName?: ReactNode;
    textMuted?: ReactNode;
    accept?: string[];
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    imagePreview?: string;
    error?: string;
    touch?: boolean;
    style?: CSSProperties;
    displayView?: 'grid' | 'list';
    showFileDetail?: boolean;
    withCloseButton?: boolean;
}
