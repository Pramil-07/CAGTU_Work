import { useMantineTheme } from "@mantine/core";
import type { DateInputProps } from "@mantine/dates";
import { DateInput } from "@mantine/dates";
import type { FieldProps } from "formik";
import { Field } from "formik";

import type { DateFieldProps } from "@/types/DateFieldProps";

const DateField = ({
    name,
    error,
    touch,
    marginIgnore,
    ...restProps
}: DateFieldProps & DateInputProps) => {
    const errTouch = error && touch ? error : null;
    const theme = useMantineTheme();

    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <DateInput
                    {...field}
                    {...restProps}
                    error={errTouch}
                    sx={{
                        ["& .mantine-DateInput-label"]: {
                            color:
                                theme.colorScheme === "dark"
                                    ? theme.colors.dark[0]
                                    : theme.colors.gray[8],
                            fontWeight: 400,
                            marginBottom: 6,
                        },
                    }}
                    radius="md"
                    size="md"
                    mb={marginIgnore ? 0 : 24}
                />
            )}
        </Field>
    );
};

export default DateField;
