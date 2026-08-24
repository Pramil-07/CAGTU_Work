import { useMantineTheme } from "@mantine/core";
import type { TimeInputProps } from "@mantine/dates";
import { TimeInput } from "@mantine/dates";
import type { FieldProps } from "formik";
import { Field } from "formik";
import type { Ref } from "react";
import { useRef } from "react";

import type { TimeFieldProps } from "@/types/TimeFieldProps";

const TimeField = ({
    name,
    error,
    touch,
    ...restProps
}: TimeFieldProps & TimeInputProps) => {
    const errTouch = error && touch ? error : null;
    const theme = useMantineTheme();
    const ref = useRef<HTMLInputElement>();

    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <TimeInput
                    {...field}
                    {...restProps}
                    ref={ref as Ref<HTMLInputElement>}
                    onClick={() => ref.current && ref.current.showPicker()}
                    error={errTouch}
                    sx={{
                        ["& .mantine-TimeInput-label"]: {
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
                    mb={20}
                />
            )}
        </Field>
    );
};

export default TimeField;
