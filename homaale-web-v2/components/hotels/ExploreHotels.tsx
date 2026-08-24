"use client";

import { Carousel } from "@mantine/carousel";
import { Card, Image, Text, Group, Badge, Stack, useMantineTheme} from "@mantine/core";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mantine/hooks";
import { Bed, Home, Trees, Building } from "lucide-react";
import { useRouter } from "next/router";

const propertyTypes = [
  {
    id: 1,
    label: "Hotels",
    value: "hotel",
    icon: Bed,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
  },
  {
    id: 2,
    label: "Apartments",
    value: "apartment",
    icon: Home,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  },
  {
    id: 3,
    label: "Resorts",
    value: "resort",
    icon: Trees,
    image: "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmVzb3J0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
  },
  {
    id: 4,
    label: "Villas",
    value: "villa",
    icon: Building,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
  },
  {
    id: 5,
    label: "Cottages",
    value: "cottage",
    icon: Home,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
  },
  {
    id: 6,
    label: "Guest Houses",
    value: "guest_house",
    icon: Bed,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
  },
];

export default function PropertyTypeCarousel() {
  const theme = useMantineTheme();
  const router = useRouter();
  const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const isLg = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);

  const getSlideConfig = () => {
    if (isSm) return { size: "80%", scroll: 1 };
    if (isMd) return { size: "50%", scroll: 1 };
    if (isLg) return { size: "33.333%", scroll: 1 };
    return { size: "25%", scroll: 1 }; // 4 cards on large screens
  };

  const { size, scroll } = getSlideConfig();

  return (
    <Stack spacing="md">
      <Text size="lg" fw={600} ta="left">
        Browse by property type
      </Text>

      <Carousel
        slideSize={size}
        slidesToScroll={1}
        slideGap="md"
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
        {propertyTypes.map((type, index) => {
          const Icon = type.icon;
          return (
            <Carousel.Slide key={type.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -6 }}
                style={{ height: "100%" }}
              >
                <Card
                  radius="xl"
                  p={0}
                  shadow="sm"
                  withBorder
                  onClick={() => router.push(`/hotels/search?hotel_type=${type.value}`)}
                  className="overflow-hidden cursor-pointer h-full"
                  style={{ height: "100%",minWidth:290, maxWidth:360 }}
                >
                  <Image
                    src={type.image}
                    height={220}
                    fit="cover"
                    radius="xl"
                    alt={type.label}
                  />
                  <Stack p="md" align="center" spacing={6}>
                    <Icon size={20} />
                    <Text fw={600} size="sm">
                      {type.label}
                    </Text>
                  </Stack>
                </Card>
              </motion.div>
            </Carousel.Slide>
          );
        })}
      </Carousel>
    </Stack>
  );
}