import { useDark } from '@cagtu-cms/util-formatter';
import { useMantineTheme, LoadingOverlay as MantineLoadingOverlay } from '@mantine/core';

const LoadingOverlay = () => {
    const [dark] = useDark();
    const theme = useMantineTheme();
    return (
        <MantineLoadingOverlay
            loaderProps={{ size: 'sm', color: 'blue', variant: 'bars' }}
            overlayColor={dark ? theme.colors.dark[9] : theme.colors.gray[2]}
            visible={true}
        />
    );
};

export default LoadingOverlay;
