import { InputFieldProps } from '@cagtu-cms/util-formatter';
import { NumberInput, NumberInputProps } from '@mantine/core';
import { Field, FieldProps } from 'formik';

const NumberField = ({ name, labelName, placeHolder, error, touch, textMuted, ...restProps }: InputFieldProps & NumberInputProps) => {
    const errTouch = error && touch ? error : null;

    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <NumberInput
                    {...field}
                    {...restProps}
                    label={labelName}
                    error={errTouch}
                    placeholder={placeHolder}
                    description={textMuted}
                    mb={20}
                    radius="sm"
                    styles={{ input: { height: 44 }, error: { fontSize: 13, fontWeight: 500 } }}
                />
            )}
        </Field>
    );
};

export default NumberField;
