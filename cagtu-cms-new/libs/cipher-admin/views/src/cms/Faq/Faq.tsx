import { PageHeader, PageTabNavbar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, PageTabNavbarOptions, useBreadCrumbCurrentTitle } from '@cagtu-cms/util-formatter';
import { Outlet } from 'react-router-dom';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import { useContext } from 'react';

const Faq = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const { currentTitle } = useBreadCrumbCurrentTitle();

    const userNavbarOptions: PageTabNavbarOptions[] = [
        { name: 'FAQ', to: 'faq', pageActivePath: '/cms/faq' },
        { name: 'FAQ Topic', to: 'faq/topic', pageActivePath: '/cms/faq/topic' },
    ];

    if (!is_superuser && !user_permissions?.includes('view_faq')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="FAQs" currentBreadcrumbName={currentTitle} />
            <PageTabNavbar navbarOptions={userNavbarOptions} />
            <Outlet />
        </>
    );
};

export default Faq;
