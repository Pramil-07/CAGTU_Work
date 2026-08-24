import { Breadcrumb, PageTabNavbar } from '@cagtu-cms/ui-shared';
import { PageTabNavbarOptions, useBreadCrumbCurrentTitle, useDark } from '@cagtu-cms/util-formatter';
import { Box, Group, Title, useMantineTheme } from '@mantine/core';
import { Outlet } from 'react-router-dom';

const Service = () => {
    const [dark] = useDark();
    const theme = useMantineTheme();
    const { currentTitle } = useBreadCrumbCurrentTitle();

    const gpNavbarOptions: PageTabNavbarOptions[] = [
        { name: 'Services', to: '/services', pageActivePath: '/services' },
        // { name: 'Packages', to: 'packages', pageActivePath: '/services/packages' },
        // { name: 'Report', to: 'report', pageActivePath: '/services/report' },
    ];

    return (
        <>
            <Group position="apart" mb={30}>
                <Box>
                    <Title order={4} sx={{ fontWeight: 600, color: dark ? theme.colors['gray'][2] : theme.colors['dark'][9] }}>
                        Services
                    </Title>
                    <Breadcrumb currentTitle={currentTitle} />
                </Box>
            </Group>
            <PageTabNavbar navbarOptions={gpNavbarOptions} />
            <Outlet />
        </>
    );
};

export default Service;
