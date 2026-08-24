import { SelectInputFieldProps } from '@cagtu-cms/util-formatter';
import { Select, SelectProps } from '@mantine/core';
import { Field, FieldProps } from 'formik';

const SelectInputField = ({
    name,
    labelName,
    placeHolder,
    textMuted,
    options,
    error,
    touch,
    searchable,
    clearable,
    handleChange,
    nothingFound = 'No options',
    ...restProps
}: SelectInputFieldProps & Partial<SelectProps>) => {
    const errTouch = error && touch ? error : null;

    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <Select
                    {...field}
                    {...restProps}
                    label={labelName}
                    error={errTouch}
                    placeholder={placeHolder}
                    nothingFound={nothingFound}
                    data={options}
                    description={textMuted}
                    mb={20}
                    onChange={handleChange}
                    styles={{ input: { height: 44 }, error: { fontSize: 13, fontWeight: 500 } }}
                    autoComplete="off"
                    searchable={searchable}
                    clearable={clearable}
                />
            )}
        </Field>
    );
};

export default SelectInputField;
