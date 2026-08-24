import { InputFieldProps } from '@cagtu-cms/util-formatter';
import { TextInput, TextInputProps } from '@mantine/core';
import { Field, FieldProps } from 'formik';

const InputField = ({
    name,
    labelName,
    placeHolder,
    error,
    touch,
    fieldRequired,
    textMuted,
    type = 'text',
    ...restProps
}: InputFieldProps & TextInputProps) => {
    const errTouch = error && touch ? error : null;

    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <TextInput
                    {...field}
                    {...restProps}
                    type={type}
                    label={labelName}
                    error={errTouch}
                    placeholder={placeHolder}
                    description={textMuted}
                    mb={20}
                    required={fieldRequired}
                    radius="sm"
                    styles={{ input: { height: 44 }, error: { fontSize: 13, fontWeight: 500 } }}
                />
            )}
        </Field>
    );
};

export default InputField;
