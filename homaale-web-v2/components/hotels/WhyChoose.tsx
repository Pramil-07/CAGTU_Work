"use client";

import { Card, Text, Group, Stack, useMantineTheme } from "@mantine/core";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mantine/hooks";
import { CreditCard, MessageCircle, Globe, Headphones } from "lucide-react";

const benefits = [
  {
    id: 1,
    icon: CreditCard,
    title: "Book now, pay at the property",
    subtitle: "FREE cancellation on most rooms",
  },
  {
    id: 2,
    icon: MessageCircle,
    title: "300M+ reviews from fellow travellers",
    subtitle: "Get trusted information from guests like you",
  },
  {
    id: 3,
    icon: Globe,
    title: "2+ million properties worldwide",
    subtitle: "Hotels, guesthouses, apartments, and more...",
  },
  {
    id: 4,
    icon: Headphones,
    title: "Trusted customer service you can rely on, 24/7",
    subtitle: "We're always here to help",
  },
];

export default function WhyChooseHomaaleStay() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Stack spacing="lg">
      <Text size="lg" fw={600}>Why HomaaleStay?</Text>
      <Group grow={isMobile} spacing={isMobile ? "sm" : "md"} align="stretch">
        {benefits.map((benefit, i) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                radius="lg"
                p="md"
                withBorder
                bg="gray.0"
                style={{
                  height: "100%",
                  minHeight: isMobile ? 100 : 120,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Group spacing="sm" align="flex-start">
                  <Icon size={28} color={theme.colors.brand[6]} />
                  <Stack spacing={1}>
                    <Text fw={600} size="sm">{benefit.title}</Text>
                    <Text size="xs" c="dimmed">{benefit.subtitle}</Text>
                  </Stack>
                </Group>
              </Card>
            </motion.div>
          );
        })}
      </Group>
    </Stack>
  );
}