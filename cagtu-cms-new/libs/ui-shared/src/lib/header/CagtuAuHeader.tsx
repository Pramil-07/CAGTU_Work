import { Burger, useMantineTheme, Header as MantineHeader, Group, useMantineColorScheme, ThemeIcon } from '@mantine/core';
import styles from './header.module.scss';
import { HeaderProps, useDark, useIconColorMode } from '@cagtu-cms/util-formatter';
import { useMediaQuery } from '@mantine/hooks';
import HomaaleUser from '../user/HomaaleUser';
import { IconMenu2, IconMoon, IconSunHigh } from '@tabler/icons';
import CagtuAuLogo from '../common/cagtuAuLogo';

export const CagtuAuHeader = ({ opened, onClick, children }: HeaderProps) => {
    const theme = useMantineTheme();
    const [dark] = useDark();
    const [iconColorMode] = useIconColorMode();
    const { toggleColorScheme } = useMantineColorScheme();
    const mediaMatch = useMediaQuery('(min-width: 900px)');

    return (
        <MantineHeader height={56} px="md">
            <div className={styles['container']}>
                <Group position="left">
                    <ThemeIcon variant="light" radius="xl" size={32} color="gray" onClick={onClick} sx={{ cursor: 'pointer' }}>
                        {mediaMatch ? <IconMenu2 color={iconColorMode} size={24} /> : <Burger opened={opened} size="sm" color={iconColorMode} />}
                    </ThemeIcon>
                    <CagtuAuLogo width={100} />
                </Group>
                <Group position="right" pr={5} spacing="xs">
                    {children}
                    <ThemeIcon
                        variant="light"
                        radius="xl"
                        size={32}
                        color="gray"
                        onClick={() => toggleColorScheme()}
                        sx={{
                            cursor: 'pointer',
                        }}>
                        {dark ? (
                            <IconSunHigh color={theme.colors.yellow[6]} size={18} stroke={1.75} />
                        ) : (
                            <IconMoon color={theme.colors.gray[7]} size={18} stroke={1.75} />
                        )}
                    </ThemeIcon>
                    <HomaaleUser />
                </Group>
            </div>
        </MantineHeader>
    );
};

export default CagtuAuHeader;
