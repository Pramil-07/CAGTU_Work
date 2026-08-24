import { useIconColorMode } from '@cagtu-cms/util-formatter';
import { ThemeIcon } from '@mantine/core';
import { IconBell } from '@tabler/icons';

const Notification = () => {
    const [iconColorMode] = useIconColorMode();

    return (
        <ThemeIcon
            variant="light"
            radius="xl"
            size={34}
            color="gray"
            sx={{
                cursor: 'pointer',
            }}>
            <IconBell size={20} color={iconColorMode} />
        </ThemeIcon>
    );
};

export default Notification;
