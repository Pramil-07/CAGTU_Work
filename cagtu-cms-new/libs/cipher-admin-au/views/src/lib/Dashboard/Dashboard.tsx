import { PaperBox } from '@cagtu-cms/ui-shared';
import { Anchor, Text, Title } from '@mantine/core';

const Dashboard = () => {
    return (
        <PaperBox>
            <Title order={3} mb="lg">
                <span style={{ fontWeight: 500 }}>Welcome to Cagtu Australia CMS</span>
            </Title>
            <Text mb={20}>
                <strong>Cagtu Australia CMS</strong> is a portal that enables you to create, edit, collaborate on, publish and store digital content. This
                particular CMS features billing systems, booking systems, user history, transaction history, finance management, tickets management,
                marketing, and the likes of it.
            </Text>
            <Text>
                We hope you enjoy our service. For feedback, please contact us at <Anchor href="mailto:info@homaale.com">info@homaale.com</Anchor>
            </Text>
        </PaperBox>
    );
};

export default Dashboard;
