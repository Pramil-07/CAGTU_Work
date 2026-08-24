import { FormikErrors } from 'formik';
import { FocusEvent } from 'react';

export interface ProfileImageFieldProps {
    labelName: string;
    name: string;
    profileImageData: any[] | undefined;
    // error: string | string[] | FormikErrors<any>[] | undefined;
    error: string;
    handleBlur: {
        (e: FocusEvent<any, Element>): void;
        <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
    };
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
    withAsterisk?: boolean;
}
