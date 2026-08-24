import { BreadcrumbProps, useDark } from '@cagtu-cms/util-formatter';
import { Anchor, Breadcrumbs, useMantineTheme } from '@mantine/core';
import { IconSmartHome } from '@tabler/icons';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ currentTitle, items }: BreadcrumbProps) => {
    const theme = useMantineTheme();
    const [dark] = useDark();

    return (
        <Breadcrumbs
            mt={5}
            styles={{
                breadcrumb: {
                    fontSize: 12,
                    fontWeight: 500,
                    color: theme.colors.gray[6],
                    '&:hover': {
                        textDecoration: 'none',
                        color: theme.colors.blue[6],
                    },
                },
                separator: { fontSize: 9, margin: `${0} ${7}px`, fontWeight: 500, color: theme.colors.gray[6] },
            }}>
            <Anchor component={Link} to="/">
                <IconSmartHome size={16} />
            </Anchor>
            {items &&
                items.map((item, index) => (
                    <Anchor key={index} component={Link} to={item.href}>
                        {item.name}
                    </Anchor>
                ))}
            <Anchor
                component="span"
                sx={{
                    color: dark ? theme.colors.gray[0] : theme.colors.dark[6],
                    cursor: 'text',
                    '&:hover': {
                        color: dark ? theme.colors.gray[0] : theme.colors.dark[6],
                    },
                }}>
                {currentTitle}
            </Anchor>
        </Breadcrumbs>
    );
};

export default Breadcrumb;
