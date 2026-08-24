import { PageHeader, PageTabNavbar, ViewAnalyticsButton } from '@cagtu-cms/ui-shared';
import { CipherUserContext, PageTabNavbarOptions, useBreadCrumbCurrentTitle } from '@cagtu-cms/util-formatter';
import { Outlet } from 'react-router-dom';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import { useContext } from 'react';

const Bookings = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const { currentTitle } = useBreadCrumbCurrentTitle();
    const userNavbarOptions: PageTabNavbarOptions[] = [
        { name: 'Pending', to: 'pending', pageActivePath: '/task/bookings/pending' },
        { name: 'Approved', to: 'approved', pageActivePath: '/task/bookings/approved' },
        { name: 'Rejected', to: 'rejected', pageActivePath: '/task/bookings/rejected' },
        { name: 'Closed', to: 'closed', pageActivePath: '/task/bookings/closed' },
        { name: 'Cancelled', to: 'cancelled', pageActivePath: '/task/bookings/cancelled' },
    ];

    if (!is_superuser && !user_permissions?.includes('view_booking')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Bookings" currentBreadcrumbName={currentTitle}>
                <ViewAnalyticsButton navigateTo="/analytics/booking" />
            </PageHeader>
            <PageTabNavbar navbarOptions={userNavbarOptions} />
            <Outlet />
        </>
    );
};

export default Bookings;
