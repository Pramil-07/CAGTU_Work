export interface SelectFieldProps {
    name: string;
    labelName?: string;
    touch?: boolean;
    withAsterisk?: boolean;
    error?: string;
    placeHolder?: string;
    textMuted?: string;
    defaultValue?: any;
    as?: string;
    typeOf?: string;
    fieldRequired?: boolean;
    variables?: {
        label: string;
        value: string;
    }[];
    data?: any;
    haveIcon?: boolean;
    inputIcon?: any;
    create?: boolean;
    value?: any;
}
