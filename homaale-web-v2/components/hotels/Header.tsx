// Header.tsx
'use client';

import { useState } from "react";
import Image from "next/image";
import {
  Container,
  Group,
  Text,
  ActionIcon,
  Drawer,
  Stack,
  Box,
  rem,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconSearch,
  IconMapPin,
  IconCalendar,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mantine/hooks";
import { useMantineTheme } from "@mantine/core";
import SearchForm from "./HotelSearchBar";
 // ← NEW: Import the reusable form

export default function Header() {
  const theme = useMantineTheme();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* HERO WITH OVERLAP */}
      <Box
        className="relative"
        style={{
          height: isMobile ? "350px" : "220px"
        }}
      >
        {/* Background Image */}
        <Box className="absolute inset-0 -z-10">
          <Image
            src="/hotels/hotelsfrontpage.avif"
            alt="Hero Background"
            fill
            className="object-cover object-center"
            placeholder="blur"
            blurDataURL="..."
          />
          <Box className="absolute inset-0 bg-black/30" />
        </Box>

        {/* Top Gradient */}
        <Box
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(13, 120, 207, 1) 0%, transparent 100%)",
          }}
        />

        {/* Hero Text */}
        <Box className="relative z-10 text-center pt-8 md:pt-10 px-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              style={{
                margin: 0,
                marginBottom: rem(6),
                fontSize: rem(36),
                fontWeight: 700,
                lineHeight: 1.2,
                color: "white",
                letterSpacing: "-0.5px",
              }}
              className="tracking-tight"
            >
              Find your perfect stay
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: rem(18),
                color: "white",
                opacity: 0.9,
              }}
            >
              Hotels, homes, and everything in between
            </p>
          </motion.div>
        </Box>

        {/* SEARCH BAR: HALF IN, HALF OUT */}
        <Box
          className="absolute  bottom-0 right-0 z-20 justify-start"
          style={{
            width: "100%",
            transform: "translateY(50%)",
          }}
        >
          <Container size="xl" className="px-0 md:px-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-7xl mx-auto md:mx-0"
            >
              {/* Desktop Search Bar */}
              <Group
                spacing={12}
                className="hidden md:flex w-full"
                align="start"
                p={12}
                style={{
                  background: "transparent",
                  backdropFilter: "blur(36px)",
                  borderRadius: rem(60),
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 -4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(255,255,255,0.4)",
                }}
              >
                {/* REUSE THE SAME FORM */}
                <Box style={{ flex: 1.3 }}>
                  <SearchForm />
                </Box>
              </Group>

              {/* Mobile Search Button */}
              <ActionIcon
                size="40px"
                radius="xl"
                className="md:hidden mx-auto block"
                onClick={() => setDrawerOpened(true)}
                style={{
                  backdropFilter: "blur(6px)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.71)",
                }}
              >
                <IconSearch size={34} style={{ marginLeft: "3px" }} color={theme.colors.brand[8]} />
              </ActionIcon>
            </motion.div>
          </Container>
        </Box>

        {/* Spacer */}
        <Box style={{ height: "80px" }} />
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        position="right"
        size="md"
        padding="md"
        withCloseButton={false}
        styles={{ body: { paddingTop: theme.spacing.lg } }}
      >
        <Stack spacing="md">
          <Group position="apart" mb="sm">
            <Text fw={600} size="lg">Search Stays</Text>
            <ActionIcon onClick={() => setDrawerOpened(false)}>
              <IconX size={20} />
            </ActionIcon>
          </Group>
          {/* SAME FORM IN DRAWER */}
          <SearchForm />
        </Stack>
      </Drawer>
    </div>
  );
}