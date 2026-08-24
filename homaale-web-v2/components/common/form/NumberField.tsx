import type {NumberInputProps} from "@mantine/core";
import {NumberInput} from "@mantine/core";
import {useMantineTheme} from "@mantine/core";
import type {FieldProps} from "formik";
import {Field} from "formik";

import type {InputFieldProps} from "@/types/InputFieldProps";

const NumberField = ({
                         name,
                         error,
                         touch,
                         minimum = 1,
                         maximum = 10000000,
                         ...rest
                     }: InputFieldProps &
    NumberInputProps &
    React.RefAttributes<HTMLInputElement>) => {
    const errTouch = error && touch ? error : null;
    const theme = useMantineTheme();
    // console.log(name)
    // console.log(error)
    // console.log(touch)
    // console.log(theme)

    return (
        <Field name={name}>
            {({field, form}: FieldProps) => {
              const safeValue =
              field.value == null || isNaN(field.value) ? minimum : Number(field.value);
                return (
                    <NumberInput
                        {...field}
                        value={safeValue}
                        {...rest}
                        mb={24}
                        sx={{
                            ["& .mantine-NumberInput-label"]: {
                                color:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.dark[0]
                                        : theme.colors.gray[8],
                                fontWeight: 400,
                                marginBottom: 6,
                            },
                        }}
                        onChange={(value) => {
                            if (
                                (value as number) >= minimum &&
                                (value as number) < maximum
                            ) {
                                form.setFieldValue(name, value);
                            }
                        }}
                        onBlurCapture={() => form.setFieldTouched(name, true)}
                        error={errTouch}
                        radius="md"
                        size="md"
                        
                    />
                    
                );
            }}
        </Field>
    );
};

export default NumberField;
