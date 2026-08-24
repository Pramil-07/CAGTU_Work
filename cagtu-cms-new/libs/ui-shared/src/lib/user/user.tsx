import { auth } from '@cagtu-cms/data-access';
import { useDark, UserContext } from '@cagtu-cms/util-formatter';
import { Avatar, Menu, useMantineTheme } from '@mantine/core';
import { IconLogout, IconSettings, IconUser } from '@tabler/icons';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const User = () => {
    const theme = useMantineTheme();
    const [dark] = useDark();
    const navigate = useNavigate();
    const { username, email, profileImage } = useContext(UserContext);

    const handleLogout = () => {
        auth.logout();
        navigate('/');
    };

    return (
        <Menu
            // sx={{ cursor: 'pointer' }}
            offset={12}
            position="bottom-end"
            width={240}
            transition="pop-top-right"
            // size={240}
            // py={10}
            // control={

            // }
        >
            <Menu.Target>
                <Avatar src={profileImage} radius="xl" size={34} color="blue" sx={{ cursor: 'pointer' }}>
                    {username?.charAt(0).toUpperCase()}
                </Avatar>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label pb={0} sx={{ fontSize: 14, color: dark ? theme.colors.gray[6] : theme.colors.gray[8] }}>
                    @{username}
                </Menu.Label>
                <Menu.Label pt={2} pb={8}>
                    {email}
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item component={Link} to="settings" icon={<IconSettings size={16} />}>
                    Settings
                </Menu.Item>
                <Menu.Item component={Link} to="profile" icon={<IconUser size={16} />}>
                    Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item onClick={handleLogout} icon={<IconLogout size={16} />}>
                    Logout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default User;
