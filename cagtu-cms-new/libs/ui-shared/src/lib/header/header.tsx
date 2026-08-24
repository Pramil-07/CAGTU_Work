import { Burger, useMantineTheme, Header as MantineHeader, Group, useMantineColorScheme, ThemeIcon } from '@mantine/core';
import Logo from '../common/logo';
import styles from './header.module.scss';
import { HeaderProps, useDark, useIconColorMode } from '@cagtu-cms/util-formatter';
import User from '../user/user';
import { useMediaQuery } from '@mantine/hooks';
import { IconMenu2, IconMoon, IconSun } from '@tabler/icons';

export const Header = ({ opened, onClick, children }: HeaderProps) => {
    const theme = useMantineTheme();
    const [dark] = useDark();
    const [iconColorMode] = useIconColorMode();
    const { toggleColorScheme } = useMantineColorScheme();
    const colorMode = dark ? theme.colors.yellow[6] : theme.colors.gray[7];
    const mediaMatch = useMediaQuery('(min-width: 900px)');

    return (
        <MantineHeader height={60} px="md">
            <div className={styles['container']}>
                <Group position="left">
                    <ThemeIcon variant="light" radius="xl" size={38} color="gray" onClick={onClick} sx={{ cursor: 'pointer' }} mr="md">
                        {mediaMatch ? <IconMenu2 color={iconColorMode} size={20} /> : <Burger opened={opened} size="sm" color={iconColorMode} />}
                    </ThemeIcon>
                    <Logo />
                </Group>
                <Group position="right" pr={'md'} spacing={'xs'}>
                    {children}
                    <ThemeIcon
                        variant="light"
                        radius="xl"
                        size={34}
                        color="gray"
                        onClick={() => toggleColorScheme()}
                        sx={{
                            cursor: 'pointer',
                        }}>
                        {dark ? <IconSun size={20} color={colorMode} /> : <IconMoon size={20} color={colorMode} />}
                    </ThemeIcon>
                    <User />
                </Group>
            </div>
        </MantineHeader>
    );
};

export default Header;
