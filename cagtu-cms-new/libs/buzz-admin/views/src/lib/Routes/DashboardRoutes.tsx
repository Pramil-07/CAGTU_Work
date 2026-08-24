import { DashboardRoutesProps } from '@cagtu-cms/util-formatter';
import { IconBox, IconBoxMultiple, IconGauge, IconLayoutGridAdd, IconTable, IconTags, IconTool } from '@tabler/icons';

export const dashboardRoutes: DashboardRoutesProps[] = [
    {
        path: 'dashboard',
        key: 'dashboard',
        name: 'Dashboard',
        icon: <IconGauge />,
    },
    {
        path: 'brands',
        key: 'brands',
        name: 'Brands',
        icon: <IconTags />,
    },
    {
        path: 'product-attributes',
        key: 'product-attributes',
        name: 'Product Attributes',
        icon: <IconTable />,
    },
    {
        path: 'stock-attributes',
        key: 'stock-attributes',
        name: 'Stock Attributes',
        icon: <IconBoxMultiple />,
    },
    {
        path: 'categories',
        key: 'categories',
        name: 'Categories',
        icon: <IconLayoutGridAdd />,
    },
    {
        path: 'service-categories',
        key: 'service-categories',
        name: 'Service Categories',
        icon: <IconTool />,
    },
    {
        path: 'products',
        key: 'products',
        name: 'Products',
        icon: <IconBox />,
    },
];

export default dashboardRoutes;
