import { CreatableInputFieldProps } from '@cagtu-cms/util-formatter';
import { MultiSelect, MultiSelectProps } from '@mantine/core';
import { Field, FieldProps } from 'formik';

const CreatableInputField = ({
    name,
    labelName,
    placeHolder,
    handleCreate,
    handleCreateLabel,
    options = [],
    error,
    touch,
    textMuted,
    fieldRequired,
    nothingFound = 'No options',
    ...restProps
}: CreatableInputFieldProps & Partial<MultiSelectProps>) => {
    const errTouch = error && touch ? error : null;
    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <MultiSelect
                    {...field}
                    {...restProps}
                    label={labelName}
                    data={options}
                    placeholder={placeHolder}
                    searchable
                    creatable
                    getCreateLabel={handleCreateLabel}
                    onCreate={handleCreate}
                    description={textMuted}
                    error={errTouch}
                    autoComplete="off"
                    styles={{ input: { minHeight: 42, padding: `${2}px ${30}px ${2}px ${12}px` }, error: { fontSize: 13, fontWeight: 500 } }}
                    mb={20}
                    nothingFound={nothingFound}
                    required={fieldRequired}
                />
            )}
        </Field>
    );
};

export default CreatableInputField;
