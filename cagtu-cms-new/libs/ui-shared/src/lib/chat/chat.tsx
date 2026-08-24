import { useIconColorMode } from '@cagtu-cms/util-formatter';
import { ThemeIcon } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons';

const Chat = () => {
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
            <IconMessageCircle size={20} color={iconColorMode} />
        </ThemeIcon>
    );
};

export default Chat;
