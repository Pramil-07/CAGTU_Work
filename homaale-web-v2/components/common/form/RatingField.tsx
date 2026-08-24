import type { RatingProps } from "@mantine/core";
import { Rating, useMantineTheme } from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import type { FieldProps } from "formik";
import { Field } from "formik";

import type { InputFieldProps } from "@/types/InputFieldProps";

const RatingField = ({
    name,
    marginIgnore,
    ...restProps
}: InputFieldProps & RatingProps) => {
    const theme = useMantineTheme();

    return (
        <Field name={name}>
            {({ field, form }: FieldProps) => (
                <Rating
                    emptySymbol={
                        <IconStar color={theme.colors.gray[4]} size={40} />
                    }
                    fullSymbol={
                        <IconStar
                            fill={theme.colors.brand[3]}
                            color={theme.colors.brand[3]}
                            size={40}
                        />
                    }
                    {...field}
                    {...restProps}
                    size={"xl"}
                    onChange={(value) => form.setFieldValue(name, value)}
                    mb={marginIgnore ? 0 : 24}
                />
            )}
        </Field>
    );
};

export default RatingField;
