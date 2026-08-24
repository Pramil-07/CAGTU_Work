import { SwitchCheckboxProps } from '@cagtu-cms/util-formatter';
import { Switch, SwitchProps, Text } from '@mantine/core';
import { Field, FieldProps } from 'formik';

const SwitchCheckbox = ({ name, checked, labelName, error, ...restProps }: SwitchCheckboxProps & Partial<SwitchProps>) => {
    return (
        <>
            <Field name={name}>
                {({ field }: FieldProps) => (
                    <Switch
                        {...field}
                        {...restProps}
                        checked={checked}
                        label={labelName}
                        size="md"
                        sx={{ input: { cursor: 'pointer' } }}
                        color={error ? 'red' : 'blue'}
                    />
                )}
            </Field>
            {error && (
                <Text size="sm" component="div" weight={500} mb={15} color="red" sx={{ fontSize: 13 }}>
                    {error}
                </Text>
            )}
        </>
    );
};

export default SwitchCheckbox;
