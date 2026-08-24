import { API, urls } from '@cagtu-cms/data-access';
import { AppShell, SidebarLinks } from '@cagtu-cms/ui-shared';
import { useSidebarCollapsed, SidebarContext, CurrentUserSchema, UserContext, useDark } from '@cagtu-cms/util-formatter';
import { Alert, LoadingOverlay, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Outlet } from 'react-router-dom';
import Header from '../../components/common/Header';
import dashboardRoutes from '../Routes/DashboardRoutes';
import { IconAlertCircle } from '@tabler/icons';

const Admin = () => {
    const [dark] = useDark();
    const theme = useMantineTheme();
    const { opened, minimize, handleAsideToggler } = useSidebarCollapsed();
    const [user, setUser] = useState<CurrentUserSchema>({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        profileImage: '',
    });

    const profileDetailAPI = new API(urls?.buzz?.cms?.profile?.detail);

    const { isLoading, isError } = useQuery(['profile'], () => profileDetailAPI.list(), {
        onSuccess: (data) => {
            setUser({
                username: data?.data?.data?.username,
                email: data?.data?.data?.email,
                firstName: data?.data?.data?.first_name,
                lastName: data?.data?.data?.last_name,
                profileImage: data?.data?.data?.profile_image,
            });
        },
    });

    if (isError) {
        return (
            <Alert icon={<IconAlertCircle size={22} />} title="Bummer!" color="red">
                Something terrible happened!
            </Alert>
        );
    }

    return (
        <UserContext.Provider value={user}>
            <SidebarContext.Provider value={{ opened, minimize, handleAsideToggler }}>
                {isLoading ? (
                    <LoadingOverlay
                        loaderProps={{ size: 'sm', color: 'blue', variant: 'bars' }}
                        overlayColor={dark ? theme.colors.dark[9] : theme.colors.gray[2]}
                        visible={true}
                    />
                ) : (
                    <AppShell sidebarList={<SidebarLinks routes={dashboardRoutes} />} headerComponent={<Header />}>
                        <Outlet />
                    </AppShell>
                )}
            </SidebarContext.Provider>
        </UserContext.Provider>
    );
};

export default Admin;
