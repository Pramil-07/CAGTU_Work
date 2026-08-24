import { TextAreaProps } from '@cagtu-cms/util-formatter';
import { Textarea, TextareaProps } from '@mantine/core';
import { Field, FieldProps } from 'formik';

const TextAreaField = ({
    name,
    labelName,
    placeHolder,
    error,
    touch,
    fieldRequired,
    textMuted,
    height = 150,
    ...restProps
}: TextAreaProps & TextareaProps) => {
    const errTouch = error && touch ? error : null;

    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <Textarea
                    {...field}
                    {...restProps}
                    label={labelName}
                    error={errTouch}
                    placeholder={placeHolder}
                    description={textMuted}
                    mb={20}
                    required={fieldRequired}
                    radius="sm"
                    styles={{ input: { height: height }, error: { fontSize: 13, fontWeight: 500 } }}
                />
            )}
        </Field>
    );
};

export default TextAreaField;
