import { useState } from 'react';
import { ErrorAlert, HomaaleAppShell, LoadingOverlay } from '@cagtu-cms/ui-shared';
import { CipherUserContext, SidebarContext, UserContextType, useSidebarCollapsed } from '@cagtu-cms/util-formatter';
import { Outlet } from 'react-router-dom';
import Header from '../../components/common/Header';
import SidebarLinks from '../../components/common/SidebarLinks';
import dashboardRoutes from '../Routes/DashboardRoutes';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { useQuery } from '@tanstack/react-query';



const Admin = () => {
    const { opened, minimize, handleAsideToggler } = useSidebarCollapsed();
    const [user, setUser] = useState<UserContextType>({
        username: '',
        email: '',
        last_login: '',
        groups: [],
        userId: '',
        is_superuser: false,
        user_permissions: [],
    });

    const profileDetailAPI = new CipherAPI(urls?.cipher?.profile?.detail);

    const { isLoading, isError } = useQuery(['admin-profile-detail'], () => profileDetailAPI.list(), {
        onSuccess: (data) => {
            setUser({
                username: data?.data?.username,
                email: data?.data?.email,
                userId: data?.data?.id,
                last_login: data?.data?.last_login,
                groups: data?.data?.groups,
                is_superuser: data?.data?.is_superuser,
                user_permissions: data?.data?.user_permissions,
            });
        },
    });

    if (isError) {
        return <ErrorAlert />;
    }

    return (
        <CipherUserContext.Provider value={user}>
            <SidebarContext.Provider value={{ opened, minimize, handleAsideToggler }}>
                {isLoading ? (
                    <LoadingOverlay />
                ) : (
                    <HomaaleAppShell sidebarList={<SidebarLinks routes={dashboardRoutes} />} headerComponent={<Header />}>
                        <Outlet />
                    </HomaaleAppShell>
                )}
            </SidebarContext.Provider>
        </CipherUserContext.Provider>
    );
};

export default Admin;
