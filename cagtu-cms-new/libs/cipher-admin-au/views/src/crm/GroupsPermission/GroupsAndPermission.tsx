import { PageHeader, PageTabNavbar } from '@cagtu-cms/ui-shared';
import { PageTabNavbarOptions, useBreadCrumbCurrentTitle } from '@cagtu-cms/util-formatter';
import { Outlet } from 'react-router-dom';

const GroupsPermission = () => {
    const { currentTitle } = useBreadCrumbCurrentTitle();

    const gpNavbarOptions: PageTabNavbarOptions[] = [
        // { name: 'Groups', to: 'groups', pageActivePath: '/user-groups/groups' },
        { name: 'Roles', to: 'roles', pageActivePath: '/user-roles/roles' },
    ];

    return (
        <>
            <PageHeader pageTitle="Roles" currentBreadcrumbName={currentTitle === 'Roles-groups' ? 'Roles' : currentTitle} />
            <PageTabNavbar navbarOptions={gpNavbarOptions} />
            <Outlet />
        </>
    );
};

export default GroupsPermission;
