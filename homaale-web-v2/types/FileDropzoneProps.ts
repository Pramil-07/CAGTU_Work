import type { CSSProperties, ReactNode } from "react";

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
    displayView?: "grid" | "list";
    showFileDetail?: boolean;
    withCloseButton?: boolean;
}

export interface FileDropzoneProps {
    name: string;
    accept: string[];
    fieldRequired?: boolean;
    labelName?: string;
    multiple?: boolean;
    maxSize: number;
    imagePreview?: string;
    error?: string;
    touch?: boolean;
    style?: CSSProperties;
}
