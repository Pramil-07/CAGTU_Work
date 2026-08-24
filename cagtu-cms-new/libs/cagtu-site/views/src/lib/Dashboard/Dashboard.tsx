import { PaperBox } from '@cagtu-cms/ui-shared';
import { Text, Title } from '@mantine/core';

const Dashboard = () => {
    return (
        <PaperBox>
            <Title order={3} mb="lg">
                <span style={{ fontWeight: 500 }}>Welcome to Cagtu CMS</span>
            </Title>
            <Text mb={20}>
                <strong>Cagtu CMS</strong> is a admin portal that enables to create, edit, collaborate on, publish and store digital content for cagtu
                official portfolio site.
            </Text>
        </PaperBox>
    );
};

export default Dashboard;
