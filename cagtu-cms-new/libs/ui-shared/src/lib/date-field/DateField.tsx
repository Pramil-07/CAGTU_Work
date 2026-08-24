import { DateFieldProps } from '@cagtu-cms/util-formatter';
import { DatePicker, DatePickerProps } from '@mantine/dates';
import { Field, FieldProps } from 'formik';

const DateField = ({
    name,
    labelName,
    placeHolder,
    error,
    touch,
    fieldRequired,
    textMuted,
    handleChange,
    ...restProps
}: DateFieldProps & DatePickerProps) => {
    const errTouch = error && touch ? error : null;

    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <DatePicker
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
                    styles={{ input: { height: 44 }, error: { fontSize: 13, fontWeight: 500 } }}
                />
            )}
        </Field>
    );
};

export default DateField;
