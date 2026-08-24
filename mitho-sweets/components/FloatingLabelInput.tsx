import { useState } from 'react';
import { TextInput } from '@mantine/core';
import classes from '@/styles/FloatingLabelInput.module.css';

interface FloatingLabelInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    name: string;
    className?: string;
    error?: string;
    noBorder?: boolean;
    onKeyDown?: any;
}

const FloatingLabelInput = ({ label, placeholder, value, onChange, required, name, className, error , noBorder , onKeyDown }: FloatingLabelInputProps) => {
    const [focused, setFocused] = useState(false);
    const floating = value.trim().length !== 0 || focused || undefined;

    return (
        <TextInput
            label={label}
            placeholder={placeholder}
            required={required}
            classNames={{ ...classes, input: `${classes.input} ${className || ''}` }}
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            mt="md"
            autoComplete="nope"
            data-floating={floating}
            labelProps={{ 'data-floating': floating }}
            name={name}
            error={error}
            styles={noBorder ? { input: { border: 'none', outline: 'none', boxShadow: 'none' } } : undefined}
            onKeyDown={onKeyDown}
        />
    );
};

export default FloatingLabelInput;