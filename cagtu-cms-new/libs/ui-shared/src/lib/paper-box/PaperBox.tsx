import { useDark } from '@cagtu-cms/util-formatter';
import { CSSObject, MantineTheme, Paper, PaperProps, useMantineTheme } from '@mantine/core';
import { ReactNode } from 'react';

interface PaperBoxProps {
    children: ReactNode;
    sx?: CSSObject | ((theme: MantineTheme) => CSSObject);
}

const PaperBox = ({ children, sx, ...resProps }: PaperBoxProps & Partial<PaperProps>) => {
    const [dark] = useDark();
    const theme = useMantineTheme();
    return (
        <Paper
            {...resProps}
            radius={10}
            p={theme.spacing.lg}
            sx={{
                boxShadow: `${dark ? null : '0px 0px 18px rgba(163, 171, 185, 0.15)'}`,
                background: `${dark ? theme.colors.dark[6] : 'white'}`,
                ...sx,
            }}>
            {children}
        </Paper>
    );
};

export default PaperBox;
