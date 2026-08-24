import { Button as MantineButton, ButtonProps } from '@mantine/core';
import { ButtonHTMLAttributes } from 'react';
// import { MouseEventHandler } from 'react';

interface MantineButtonProps {
    loading?: boolean;
    name: string;
    type?: string;
}

const Button = ({
    loading,
    type = 'button',
    name,
    ...restProps
}: MantineButtonProps & Partial<ButtonProps> & Partial<ButtonHTMLAttributes<HTMLButtonElement>>) => {
    return (
        <MantineButton {...restProps} type={type} loading={loading} px={15} sx={{ height: 38, fontWeight: 500, fontSize: 13, minWidth: 120 }}>
            {name}
        </MantineButton>
    );
};

export default Button;
