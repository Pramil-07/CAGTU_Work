import { useDark } from '@cagtu-cms/util-formatter';
import { Button, useMantineTheme, ButtonProps } from '@mantine/core';
import { IconChartHistogram } from '@tabler/icons';
import { ButtonHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';

interface ViewAnalyticsButtonProps {
    navigateTo: string;
}

const ViewAnalyticsButton = ({
    navigateTo,
    ...restProps
}: ViewAnalyticsButtonProps & Partial<ButtonProps> & Partial<ButtonHTMLAttributes<HTMLButtonElement>>) => {
    const [dark] = useDark();
    const theme = useMantineTheme();
    const navigate = useNavigate();

    return (
        <Button
            {...restProps}
            variant="white"
            leftIcon={<IconChartHistogram size={18} stroke={1.75} />}
            sx={{
                color: dark ? theme.colors.gray['5'] : theme.colors.dark['5'],
                fontSize: 13,
                background: dark ? theme.colors.dark['5'] : theme.white,
                '&:hover': {
                    color: dark ? theme.colors.gray['2'] : theme.colors.blue['6'],
                },
            }}
            px={15}
            onClick={() => navigate(navigateTo)}>
            View Analytics
        </Button>
    );
};

export default ViewAnalyticsButton;
