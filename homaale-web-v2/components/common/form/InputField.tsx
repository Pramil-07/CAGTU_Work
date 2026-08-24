import type { TextInputProps } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { TextInput } from "@mantine/core";
import type { FieldProps } from "formik";
import { Field } from "formik";

import type { InputFieldProps } from "@/types/InputFieldProps";

const InputField = ({
    name,
    error,
    touch,
    marginIgnore,
    ref,
    ...rest
}: InputFieldProps &
    TextInputProps &
    React.RefAttributes<HTMLInputElement>) => {
    const errTouch = error && touch ? error : null;
    const theme = useMantineTheme();
    return (
        <Field name={name} ref={ref}>
            {({ field, form }: FieldProps) => {
                return (
                    <TextInput
                        {...field}
                        {...rest}
                        mb={marginIgnore ? 0 : 24}
                        sx={{
                            ["& .mantine-TextInput-label"]: {
                                color:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.dark[0]
                                        : theme.colors.gray[8],
                                fontWeight: 400,
                                marginBottom: 6,
                            },
                        }}
                        error={errTouch}
                        radius="md"
                        size="md"
                        onBlur={(e) => {
                            form.setFieldValue(
                                name,
                                e.currentTarget.value.trim()
                            );
                            form.setFieldTouched(name, true);
                        }}
                    />

                );
            }}

        </Field>
    );
};

export default InputField;
