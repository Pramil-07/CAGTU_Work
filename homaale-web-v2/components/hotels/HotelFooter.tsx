import { Container, Group, Text, Stack, Title, Grid, Divider } from "@mantine/core";
import { IconBrandFacebook, IconBrandInstagram } from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <Container size="xl">
        <Grid gutter="lg">
          <Grid.Col span={12} md={4}>
            <Title order={4} className="text-amber-400">HomaaleStay</Title>
            <Text c="dimmed">Your home away from home.</Text>
          </Grid.Col>
          <Grid.Col span={12} md={4}>
            <Title order={5}>Quick Links</Title>
            <Stack spacing="xs">
              <Text c="dimmed">Home</Text>
              <Text c="dimmed">Rooms</Text>
              <Text c="dimmed">About</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={12} md={4}>
            <Title order={5}>Follow Us</Title>
            <Group><IconBrandFacebook /><IconBrandInstagram /></Group>
          </Grid.Col>
        </Grid>
        <Divider my="lg" />
        <Text ta="center" c="dimmed" size="sm">© 2025 homaale. All rights reserved.</Text>
      </Container>
    </footer>
  );
}