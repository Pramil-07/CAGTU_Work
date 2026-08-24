import { useMantineTheme } from "@mantine/core";
import { ErrorMessage } from "formik";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { checkFormGroup } from "utils/helpers";

import type { FileInputFieldProps } from "@/types/fileInputField";

import Asterik from "../Asterik";

const FileInputField = ({
    name,
    error,
    touch,
    handleChange,
    labelName,
    fieldRequired,
    ...restProps
}: FileInputFieldProps &
    Partial<
        DetailedHTMLProps<
            InputHTMLAttributes<HTMLInputElement>,
            HTMLInputElement
        >
    >) => {
    const theme = useMantineTheme();
    return (
        <div className={checkFormGroup(error)}>
            <label htmlFor={name}>{labelName}</label>
            {fieldRequired && <Asterik />}
            <div
                style={{
                    padding: 8,
                    border: `1px solid ${theme.colors.gray[3]}`,
                    borderRadius: 6,
                }}
                className={
                    error && touch
                        ? "file-attachment is-invalid"
                        : "file-attachment"
                }
            >
                <input
                    {...restProps}
                    type="file"
                    name={name}
                    id={name}
                    className="fileUpload"
                    onChange={handleChange}
                />
            </div>
            {name && (
                <ErrorMessage
                    name={name}
                    component="span"
                    className="invalid-feedback"
                />
            )}
        </div>
    );
};

export default FileInputField;
