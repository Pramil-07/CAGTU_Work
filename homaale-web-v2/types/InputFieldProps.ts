export interface InputFieldProps {
    name: string;
    labelName?: string;
    touch?: boolean;
    withAsterisk?: boolean;
    error?: string;
    postClicked?: boolean;
    placeHolder?: string;
    textMuted?: string;
    defaultValue?: any;
    as?: string;
    typeOf?: string;
    fieldRequired?: boolean;
    forgotPassword?: string;
    variables?: {
        label: string;
        value: string;
    }[];
    handleChange?: (data: string) => void;
    data?: any;
    haveIcon?: boolean;
    inputIcon?: any;
    create?: boolean;
    value?: any;
    hasForgot?: boolean;
    marginIgnore?: boolean;
    minimum?: number;
    maximum?: number;
    hierarchical?:boolean
}
