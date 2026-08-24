import { MantineThemeOverride } from '@mantine/core';

export const globalTheme: MantineThemeOverride = {
    fontFamily: 'Poppins',
    fontSizes: { md: 14 },
    headings: {
        fontFamily: 'Poppins',
    },
};

export const homaaleColors: MantineThemeOverride = {
    colors: {
        brand: ['#fff2db', '#ffdbaf', '#fdc580', '#fbae50', '#f9971f', '#e07e06', '#ae6202', '#7d4600', '#4d2900', '#1e0c00'],
    },
    primaryColor: 'brand',
    primaryShade: 4,
};
