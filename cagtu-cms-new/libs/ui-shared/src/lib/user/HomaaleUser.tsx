import { auth } from '@cagtu-cms/data-access';
import { CipherUserContext } from '@cagtu-cms/util-formatter';
import { Avatar, Menu, useMantineTheme } from '@mantine/core';
import { IconAt, IconLogout } from '@tabler/icons';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '@mantine/core';

const HomaaleUser = () => {
    const navigate = useNavigate();
    const { username, email } = useContext(CipherUserContext);
    const theme = useMantineTheme();

    const handleLogout = () => {
        auth.logout();
        navigate('/');
    };

    return (
        <Menu
            offset={10}
            position="bottom-end"
            width={220}
            transition="pop-top-right"
            shadow="md"
            styles={{
                item: {
                    fontSize: 13,
                    padding: `${6}px ${theme.spacing.sm}px`,
                },
                itemIcon: {
                    marginRight: 8,
                },
            }}>
            <Menu.Target>
                <Avatar radius="xl" size={32} color={'brand.4'} sx={{ cursor: 'pointer' }}>
                    {username?.charAt(0).toUpperCase()}
                </Avatar>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label pb={0} sx={{ fontSize: 13 }} color="gray.6">
                    <Group position="left" spacing={0}>
                        <IconAt size={14} />
                        {username}
                    </Group>
                </Menu.Label>
                {email && (
                    <Menu.Label pt={0} pb={5}>
                        {email}
                    </Menu.Label>
                )}
                {/* <Menu.Divider />
                <Menu.Item component={Link} to="settings" icon={<IconAdjustmentsHorizontal size={16} stroke={1.75} />}>
                    Settings
                </Menu.Item>
                <Menu.Item component={Link} to="profile" icon={<IconUserCircle size={16} stroke={1.75} />}>
                    Profile
                </Menu.Item> */}
                <Menu.Divider />
                <Menu.Item onClick={handleLogout} icon={<IconLogout size={16} stroke={1.75} />}>
                    Logout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default HomaaleUser;
