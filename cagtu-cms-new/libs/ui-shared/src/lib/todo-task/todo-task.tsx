import { useIconColorMode } from '@cagtu-cms/util-formatter';
import { ThemeIcon } from '@mantine/core';
import { IconChecks } from '@tabler/icons';

const TodoTask = () => {
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
            <IconChecks size={20} color={iconColorMode} />
        </ThemeIcon>
    );
};

export default TodoTask;
