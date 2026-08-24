import { useDark } from '@cagtu-cms/util-formatter';
import { Button, ButtonProps, useMantineTheme } from '@mantine/core';
import { IconArrowNarrowLeft } from '@tabler/icons';
import { ButtonHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
    navigateTo: string;
}

const BackButton = ({ navigateTo, ...restProps }: BackButtonProps & Partial<ButtonProps> & Partial<ButtonHTMLAttributes<HTMLButtonElement>>) => {
    const [dark] = useDark();
    const theme = useMantineTheme();
    const navigate = useNavigate();

    return (
        <Button
            {...restProps}
            type="button"
            variant="white"
            leftIcon={<IconArrowNarrowLeft size={22} stroke={1.75} />}
            px={15}
            sx={{
                background: dark ? theme.colors.dark['5'] : theme.white,
                color: dark ? theme.colors.gray[0] : theme.colors.blue[6],
                height: 38,
                fontWeight: 500,
                fontSize: 13,
                minWidth: 120,
                '&:hover': {
                    '.mantine-Button-leftIcon': {
                        left: -4,
                    },
                },
            }}
            styles={{ leftIcon: { position: 'relative', left: 0, transition: 'all 0.1s ease' } }}
            onClick={() => navigate(navigateTo, { replace: true })}>
            Back
        </Button>
    );
};

export default BackButton;
