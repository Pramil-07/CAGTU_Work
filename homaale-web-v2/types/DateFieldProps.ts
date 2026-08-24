import type { ReactNode } from "react";

export interface DateFieldProps {
    name: string;
    labelName?: ReactNode;
    placeHolder?: string;
    error?: string;
    touch?: boolean;
    fieldRequired?: boolean;
    textMuted?: ReactNode;
    marginIgnore?: boolean;
}
