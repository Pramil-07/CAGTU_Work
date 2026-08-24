import { Breadcrumb, Button, PageTabNavbar } from '@cagtu-cms/ui-shared';
import { PageTabNavbarOptions, useBreadCrumbCurrentTitle, useDark } from '@cagtu-cms/util-formatter';
import { Box, Group, Title, useMantineTheme } from '@mantine/core';
import { Outlet, useNavigate } from 'react-router-dom';

const Task = () => {
    const [dark] = useDark();
    const theme = useMantineTheme();
    const { currentTitle } = useBreadCrumbCurrentTitle();
    const navigate = useNavigate();

    const gpNavbarOptions: PageTabNavbarOptions[] = [
        { name: 'Entity Service', to: 'entity-service', pageActivePath: '/task/entity-service' },
        { name: 'Report', to: 'entity-service/report', pageActivePath: '/task/entity-service/report' },
    ];

    return (
        <>
            <Group position="apart" mb={30}>
                <Box>
                    <Title order={4} sx={{ fontWeight: 600, color: dark ? theme.colors['gray'][2] : theme.colors['dark'][9] }}>
                        Entity Service
                    </Title>
                    <Breadcrumb currentTitle={currentTitle} />
                </Box>
                {currentTitle === 'Entity Service' && <Button name="Add Task" onClick={() => navigate('/task/entity-service/create')} />}
            </Group>
            <PageTabNavbar navbarOptions={gpNavbarOptions} />
            <Outlet />
        </>
    );
};

export default Task;
