import { TimeFieldProps } from '@cagtu-cms/util-formatter';
import { TimeInput, TimeInputProps } from '@mantine/dates';
import { Field, FieldProps } from 'formik';

const TimeField = ({
    name,
    labelName,
    placeHolder,
    error,
    touch,
    fieldRequired,
    textMuted,
    handleChange,
    ...restProps
}: TimeFieldProps & TimeInputProps) => {
    const errTouch = error && touch ? error : null;

    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <TimeInput
                    {...field}
                    {...restProps}
                    label={labelName}
                    description={textMuted}
                    placeholder={placeHolder}
                    error={errTouch}
                    required={fieldRequired}
                    radius="sm"
                    onChange={handleChange}
                    mb={20}
                    styles={{ input: { height: 44 }, error: { fontSize: 13, fontWeight: 500 }, controls: { height: 44 } }}
                />
            )}
        </Field>
    );
};

export default TimeField;
