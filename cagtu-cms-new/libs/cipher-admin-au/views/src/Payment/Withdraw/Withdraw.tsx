import { PageHeader, PageTabNavbar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, PageTabNavbarOptions, useBreadCrumbCurrentTitle } from '@cagtu-cms/util-formatter';
import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const Withdraw = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const { currentTitle } = useBreadCrumbCurrentTitle();

    const userNavbarOptions: PageTabNavbarOptions[] = [
        { name: 'Withdraw Request', to: 'withdraw-request', pageActivePath: '/payment/withdraw-request' },
        { name: 'User Wallets', to: 'withdraw-request/user-wallets', pageActivePath: '/payment/withdraw-request/user-wallets' },
    ];

    if (!is_superuser && !user_permissions?.includes('view_withdraw')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Withdraw" currentBreadcrumbName={currentTitle} />
            <PageTabNavbar navbarOptions={userNavbarOptions} />
            <Outlet />
        </>
    );
};

export default Withdraw;
