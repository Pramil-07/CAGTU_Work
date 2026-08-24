import { Text, useMantineTheme } from "@mantine/core";
import { ErrorMessage, Field } from "formik";
import type { InputHTMLAttributes } from "react";
import React from "react";
import PhoneInputWithCountrySelect from "react-phone-number-input";

import type { InputFieldProps } from "@/types/InputFieldProps";
import { checkFormControl, checkFormGroup } from "@/utils/helpers";

const PhoneNumberField = ({
    name,
    error,
    touch,
    placeHolder,
    labelName,
    textMuted,
    className,
    fieldRequired,
    ...restProps
}: InputFieldProps & InputHTMLAttributes<HTMLInputElement>) => {
    const theme = useMantineTheme();
    return (
        <div className={`${checkFormGroup(error)} ${className}`}>
            {labelName && (
                <label htmlFor={name} className="form-label">
                    <Text
                        component="span"
                        sx={{
                            fontSize: 14,
                            fontWeight: 400,
                            color:
                                theme.colorScheme === "dark"
                                    ? theme.colors.dark[0]
                                    : theme.colors.gray[8],
                        }}
                    >
                        {labelName}
                    </Text>{" "}
                    {fieldRequired && <span className="asterisk">*</span>}
                </label>
            )}
            <Field name={name} className={checkFormControl(error, touch)}>
                {({ form, field }: any) => {
                    const { setFieldValue } = form;

                    return (
                        <PhoneInputWithCountrySelect
                            name={name}
                            {...restProps}
                            {...field}
                            international
                            className={`${checkFormControl(error, touch)}`}
                            countrySelectProps={{
                                unicodeFlags: true,
                                style: {
                                    backgroundColor:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[5]
                                            : theme.colors.gray[1],
                                },
                            }}
                            defaultCountry="NP"
                            id={name}
                            placeholder={placeHolder}
                            onChange={(val) => setFieldValue(name, val)}
                        />
                    );
                }}
            </Field>

            <ErrorMessage
                name={name}
                component="span"
                className="invalid-feedback"
            />
            {textMuted && <small className="text-muted">{textMuted}</small>}
        </div>
    );
};

export default PhoneNumberField;
