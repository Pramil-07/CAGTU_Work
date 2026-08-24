import { PageHeader, PageTabNavbar, ViewAnalyticsButton } from '@cagtu-cms/ui-shared';
import { PageTabNavbarOptions, useBreadCrumbCurrentTitle } from '@cagtu-cms/util-formatter';
import { Outlet } from 'react-router-dom';

const Users = () => {
    const { currentTitle } = useBreadCrumbCurrentTitle();

    const userNavbarOptions: PageTabNavbarOptions[] = [
        { name: 'Users', to: 'users', pageActivePath: '/user-roles/users' },
        { name: 'KYC', to: 'users/kyc', pageActivePath: '/user-roles/users/kyc' },
        { name: 'Deactivate History', to: 'users/deactivate-history', pageActivePath: '/user-roles/users/deactivate-history' },
    ];

    return (
        <>
            <PageHeader pageTitle="General Users" currentBreadcrumbName={currentTitle}>
                <ViewAnalyticsButton name="hello" navigateTo="/analytics/user" />
            </PageHeader>
            <PageTabNavbar navbarOptions={userNavbarOptions} />
            <Outlet />
        </>
    );
};

export default Users;
