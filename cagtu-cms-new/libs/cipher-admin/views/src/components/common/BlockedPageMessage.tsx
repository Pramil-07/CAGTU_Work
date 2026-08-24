import { PaperBox } from '@cagtu-cms/ui-shared';
import { Stack, Text, Title } from '@mantine/core';

const BlockedPageMessage = () => {
    return (
        <PaperBox sx={{ display: 'flex', justifyContent: 'center' }}>
            <Stack align="center">
                <Title order={1}>
                    <span role="img" aria-label="block-emoji">
                        🚫
                    </span>
                </Title>
                <Title order={3}>Permission Denied</Title>
                <Text>You don't have permission to access this page</Text>
            </Stack>
        </PaperBox>
    );
};

export default BlockedPageMessage;
