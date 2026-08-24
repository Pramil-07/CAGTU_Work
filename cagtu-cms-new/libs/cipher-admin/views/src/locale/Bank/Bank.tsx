import { PageHeader, PageTabNavbar } from '@cagtu-cms/ui-shared';
import { PageTabNavbarOptions, useBreadCrumbCurrentTitle } from '@cagtu-cms/util-formatter';
import { Outlet } from 'react-router-dom';

const Bank = () => {
    const { currentTitle } = useBreadCrumbCurrentTitle();

    const userNavbarOptions: PageTabNavbarOptions[] = [
        { name: 'Bank', to: 'bank', pageActivePath: '/locale/bank' },
        { name: 'Branch', to: 'bank/branch', pageActivePath: '/locale/bank/branch' },
    ];

    return (
        <>
            <PageHeader pageTitle={currentTitle === 'Branch' ? 'Branch' : 'Bank'} currentBreadcrumbName={currentTitle} />
            <PageTabNavbar navbarOptions={userNavbarOptions} />
            <Outlet />
        </>
    );
};

export default Bank;
