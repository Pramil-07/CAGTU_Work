"use client";

import { Carousel } from "@mantine/carousel";
import { Card, Image, Text, Group, Badge, Stack, useMantineTheme, Box } from "@mantine/core";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/router";
import NoDataAlert from "../common/NoDataAlert";

const destinations = [
  {
    id: 1,
    name: "Kathmandu",
    properties: 1136,
    image: "https://images.unsplash.com/photo-1623492701902-47dc207df5dc?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Pokhara",
    properties: 549,
    image: 'https://images.unsplash.com/photo-1576948187290-457c015b3bff?q=80&w=1470&auto=format&fit=crop',
    
  },
  {
    id: 3,
    name: "Patan",
    properties: 226,
    image: "https://images.unsplash.com/photo-1585597800810-07a63ea8e983?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGF0YW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500",
  },
  {
    id: 4,
    name: "Nagarkot",
    properties: 76,
    image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e",
  },
  {
    id: 5,
    name: "Sauraha",
    properties: 110,
    image: "https://plus.unsplash.com/premium_photo-1664302697540-1406401126ed?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1173",
  },
  {
    id: 6,
    name: "Bhaktapur",
    properties: 96,
    image: "https://images.unsplash.com/photo-1623492961702-549ffd2c7155?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Lumbini",
    properties: 88,
    image: "https://images.unsplash.com/photo-1578235107258-f6e405a4ffc0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1025",
  },
];

export default function DestinationCarousel() {
  const theme = useMantineTheme();
  const router = useRouter();
  const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const isLg = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);

  const getSlideConfig = () => {
    if (isSm) return { size: "75%", scroll: 1 };
    if (isMd) return { size: "50%", scroll: 2 };
    if (isLg) return { size: "33.333%", scroll: 3 };
    return { size: "25%", scroll: 4 }; // 4 cards on large screens
  };

  const { size, scroll } = getSlideConfig();

  return (
    <Stack spacing="md">
      <Stack spacing={0}>
        <Text size="lg" fw={600}>
          Explore Nepal
        </Text>
        <Text size="sm" c="dimmed">
          These popular destinations have a lot to offer
        </Text>
      </Stack>

     {destinations.length>0?( <Carousel
        slideSize={size}
        slidesToScroll={1}
        slideGap="lg"
        align="start"
        loop
        withControls={!isSm}
        withIndicators={false}
        draggable
        styles={{
          control: {
            backgroundColor: theme.colors.gray[2],
            border: "none",
            "&:hover": { backgroundColor: theme.colors.gray[3] },
          },
        }}
      >
        {destinations.map((dest, index) => (
          <Carousel.Slide key={dest.id}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.03 }}
              style={{ height: "100%" }}
            >
              <Card
                radius="xl"
                p={0}
                shadow="md"
                withBorder
                style={{
                  maxWidth:360,
                  minWidth:290,
                }}
                onClick={()=>{
                  router.push(`/hotels/search?location=${dest.name}`);
                }}
                className="overflow-hidden cursor-pointer h-full"
              >
                <Image
                  src={dest.image}
                  height={240}
                  fit="cover"
                  radius="xl"
                  alt={dest.name}
                />
                <Stack p="md" spacing={4}>
                  <Text fw={600} size="md">
                    {dest.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {dest.properties.toLocaleString()} properties
                  </Text>
                </Stack>
              </Card>
            </motion.div>
          </Carousel.Slide>
        ))}
      </Carousel>):(<Box h={200} display="flex" style={{ alignItems: "center", justifyContent: "center" }}>
        <NoDataAlert message="No destinations found." />
        </Box>)}
    </Stack>
  );
}