import { CipherDashboardRoutesProps } from '@cagtu-cms/util-formatter';
import { IconAddressBook, IconAt, IconDashboard, IconNotes, IconUserCircle } from '@tabler/icons';

export const dashboardRoutes: CipherDashboardRoutesProps[] = [
    {
        path: 'dashboard',
        key: 'dashboard',
        name: 'Dashboard',
        permissionName: 'public',
        icon: <IconDashboard stroke={1.75} />,
    },
    {
        path: 'careers',
        key: 'careers',
        name: 'Careers',
        permissionName: 'public',
        icon: <IconNotes stroke={1.75} />,
    },
    {
        path: 'candidates',
        key: 'candidates',
        name: 'Candidates',
        permissionName: 'public',
        icon: <IconUserCircle stroke={1.75} />,
    },
    {
        path: 'newsletter',
        key: 'newsletter',
        name: 'Newsletter',
        permissionName: 'public',
        icon: <IconAt stroke={1.75} />,
    },
    {
        path: 'contacts',
        key: 'contacts',
        name: 'Contacts',
        permissionName: 'public',
        icon: <IconAddressBook stroke={1.75} />,
    },
];

export default dashboardRoutes;
