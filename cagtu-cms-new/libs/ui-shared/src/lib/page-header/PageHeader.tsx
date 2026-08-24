import { BreadcrumbItems, useDark } from '@cagtu-cms/util-formatter';
import { Box, Group, Title, useMantineTheme } from '@mantine/core';
import { ReactNode } from 'react';
import Breadcrumb from '../breadcrumb/Breadcrumb';

interface PageHeaderProps {
    children?: ReactNode;
    pageTitle: string;
    currentBreadcrumbName?: string;
    breadCrumbItems?: BreadcrumbItems[];
}

const PageHeader = ({ children, pageTitle, breadCrumbItems, currentBreadcrumbName }: PageHeaderProps) => {
    const [dark] = useDark();
    const theme = useMantineTheme();

    return (
        <Group position="apart" mb={theme.spacing.lg}>
            <Box>
                <Title order={4} sx={{ fontWeight: 600, color: dark ? theme.colors['gray'][2] : theme.colors['dark'][9] }}>
                    {pageTitle}
                </Title>
                <Breadcrumb currentTitle={!currentBreadcrumbName ? pageTitle : currentBreadcrumbName} items={breadCrumbItems} />
            </Box>
            <Group position="right">{children}</Group>
        </Group>
    );
};

export default PageHeader;
