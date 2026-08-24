import { PasswordInputFieldProps } from '@cagtu-cms/util-formatter';
import { PasswordInput, PasswordInputProps } from '@mantine/core';
import { Field, FieldProps } from 'formik';
import { IconEye, IconEyeOff } from '@tabler/icons';

const PasswordInputField = ({
    name,
    labelName,
    placeHolder,
    error,
    touch,
    fieldRequired,
    textMuted,
    icon,
    ...restProps
}: PasswordInputFieldProps & PasswordInputProps) => {
    const errTouch = error && touch ? error : null;

    return (
        <Field name={name}>
            {({ field }: FieldProps) => (
                <PasswordInput
                    {...field}
                    {...restProps}
                    label={labelName}
                    error={errTouch}
                    placeholder={placeHolder}
                    description={textMuted}
                    required={fieldRequired}
                    icon={icon}
                    radius="sm"
                    visibilityToggleIcon={({ reveal }) => (reveal ? <IconEye size={18} stroke={1.75} /> : <IconEyeOff size={18} stroke={1.75} />)}
                    mb={20}
                    styles={{ input: { height: 44 }, innerInput: { height: 44 }, error: { fontSize: 13, fontWeight: 500 } }}
                />
            )}
        </Field>
    );
};

export default PasswordInputField;
