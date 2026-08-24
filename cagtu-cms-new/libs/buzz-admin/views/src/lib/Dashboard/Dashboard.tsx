import { UserContext } from '@cagtu-cms/util-formatter';
import { Text, Title } from '@mantine/core';
import { useContext } from 'react';

const Dashboard = () => {
    const { firstName } = useContext(UserContext);
    return (
        <>
            <Title order={3} sx={{ fontFamily: 'Poppins' }} mb="lg">
                <span style={{ fontWeight: 500 }}>Welcome,</span> {firstName}!
            </Title>
            <Text sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.dark[8] })}>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text
                ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not
                only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s
                with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
                PageMaker including versions of Lorem Ipsum.
            </Text>
        </>
    );
};

export default Dashboard;
