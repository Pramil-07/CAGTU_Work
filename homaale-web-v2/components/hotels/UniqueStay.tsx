"use client";

import { useEffect, useState } from "react";
import { Carousel } from "@mantine/carousel";
import { Card, Image, Text, Group, Badge, Stack, useMantineTheme, Loader } from "@mantine/core";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mantine/hooks";
import { Heart } from "lucide-react";
import { axiosClient } from "@/utils/axiosClient";

type UniqueStay = {
  id: number;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  tag: string;
  images: string;
};

const DUMMY_UNIQUE: UniqueStay[] = [
  {
    id: 1,
    name: "Domki Wierszyki Shelters",
    address: "Poland, Zakopane",
    rating: 9.6,
    reviews: 90,
    tag: "Exceptional",
    images: "https://images.unsplash.com/photo-1728365743796-ee69341a166d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  },
  {
    id: 2,
    name: "Ranczo w Dolinie",
    address: "Poland, Kłodzko",
    rating: 9.6,
    reviews: 137,
    tag: "Exceptional",
    images: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90",
  },
  {
    id: 3,
    name: "Tiny House Dreischwesterherz",
    address: "Germany, Trier",
    rating: 9.9,
    reviews: 133,
    tag: "Exceptional",
    images: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    id: 4,
    name: "Das rote Haus hinterm Deich",
    address: "Germany, Simonsberg",
    rating: 9.6,
    reviews: 40,
    tag: "Exceptional",
    images: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  },
];

export default function UniqueStaysCarousel() {
  const [stays, setStays] = useState<UniqueStay[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  useEffect(() => {
    const fetchUnique = async () => {
      try {
        const response = await axiosClient.get("/hotel/list/");
        setStays(response.data.result || DUMMY_UNIQUE);
      } catch (err) {
        console.error("Failed to fetch unique stays:", err);
        setStays(DUMMY_UNIQUE);
      } finally {
        setLoading(false);
      }
    };
    fetchUnique();
  }, []);

  if (loading) return <Loader size="lg" />;

  return (
    <Stack spacing="md">
      <Stack spacing={0}>
        <Text size="lg" fw={600}>Stay at our top unique properties</Text>
        <Text size="sm" c="dimmed">From castles and villas to boats and igloos, we’ve got it all</Text>
      </Stack>

      <Carousel
        slideSize={isMobile ? "85%" : "25%"}
        slidesToScroll={isMobile ? 1 : 1}
        slideGap="md"
        align="start"
        loop
        withControls={!isMobile}
        withIndicators={false}
        draggable
      >
        {stays.map((stay, i) => (
          <Carousel.Slide key={stay.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card style={{
                maxWidth: isMobile ? "100%" : 360,
                minWidth: isMobile ? "100%" : 310,
              }} radius="lg" p={0} withBorder shadow="sm" className="overflow-hidden">
                <Image src={stay.images ? stay.images  :""} height={180} fit="cover" />
                <Stack p="sm" spacing="xs">
                  <Group position="apart">
                    <Badge color="blue" size="sm">{stay.tag ? stay.tag : "Exceptional"}</Badge>
                    <Heart size={18} className="cursor-pointer text-gray-400 hover:text-red-500" />
                  </Group>
                  <Text fw={600} size="sm" lineClamp={1}>{stay.name}</Text>
                  <Text size="xs" c="dimmed">{stay.address}</Text>
                  <Group spacing={4}>
                    <Badge color="blue" variant="filled" size="sm">{stay.rating}</Badge>
                    <Text size="xs" c="dimmed">{stay.reviews} reviews</Text>
                  </Group>
                </Stack>
              </Card>
            </motion.div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Stack>
  );
}