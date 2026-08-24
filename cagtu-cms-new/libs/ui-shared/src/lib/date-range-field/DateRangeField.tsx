import { DateRangeFieldProps } from '@cagtu-cms/util-formatter';
import { DateRangePicker, DateRangePickerProps } from '@mantine/dates';
import { Field, FieldProps } from 'formik';

const DateRangeField = ({
    name,
    labelName,
    placeHolder,
    error,
    touch,
    fieldRequired,
    textMuted,
    handleDateRange,
    ...restProps
}: DateRangeFieldProps & DateRangePickerProps) => {
    const errTouch = error && touch ? error : null;

    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <DateRangePicker
                    {...field}
                    {...restProps}
                    label={labelName}
                    description={textMuted}
                    placeholder={placeHolder}
                    error={errTouch}
                    required={fieldRequired}
                    radius="sm"
                    onChange={handleDateRange}
                    mb={20}
                    styles={{ input: { height: 44 }, error: { fontSize: 13, fontWeight: 500 } }}
                />
            )}
        </Field>
    );
};

export default DateRangeField;
