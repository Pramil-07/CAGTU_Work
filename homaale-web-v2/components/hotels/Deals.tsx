"use client";

import { useEffect, useState } from "react";
import { Carousel } from "@mantine/carousel";
import { Card, Image, Text, Group, Badge, Stack, useMantineTheme, Loader } from "@mantine/core";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mantine/hooks";
import { Heart, MapPin } from "lucide-react";
import { axiosClient } from "@/utils/axiosClient";

type Deal = {
  id: number;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  originalPrice: number;
  price: number;
  images: string;
  tag?: string;
};

const DUMMY_DEALS: Deal[] = [
  {
    id: 1,
    name: "Kathmandu Garden Home",
    address: "Kathmandu, Nepal",
    rating: 8.7,
    reviews: 105,
    originalPrice: 2500,
    price: 1826,
    images: "https://images.unsplash.com/photo-1620432970680-73ebcd1674e0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGhvdGVscyUyMGFuZCUyMHJlc29ydHMlMjBwaWN0dXJlc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
    tag: "Late Escape Deal",
  },
  {
    id: 2,
    name: "Temple Himalaya Hotel & Spa",
    address: "Pokhara, Nepal",
    rating: 9.2,
    reviews: 314,
    originalPrice: 6000,
    price: 2310,
    images: "https://plus.unsplash.com/premium_photo-1732745286365-7e2b60a9b0b4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8a2F0aG1hbmR1JTIwaG90ZWxzJTIwYWxsJTIwcGljdHVyZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500",
    tag: "Late Escape Deal",
  },
  {
    id: 3,
    name: "The Fort Resort",
    address: "Nagarkot, Nepal",
    rating: 9.0,
    reviews: 385,
    originalPrice: 28000,
    price: 24288,
    images: "https://plus.unsplash.com/premium_photo-1697729729075-3e56242aef49?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fGthdGhtYW5kdSUyMGhvdGVscyUyMGFsbCUyMHBpY3R1cmVzfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=500",
  },
  {
    id: 4,
    name: "Kathmandu Eco Hotel",
    address: "Kathmandu, Nepal",
    rating: 8.9,
    reviews: 1203,
    originalPrice: 17499,
    price: 9110,
    images: "https://images.unsplash.com/photo-1670566911512-98e465156c19?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzl8fGthdGhtYW5kdSUyMGhvdGVscyUyMGFsbCUyMHBpY3R1cmVzfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=500",
  },
];

export default function WeekendDealsCarousel() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axiosClient.get("/hotel/list/");
        setDeals(response.data.result || DUMMY_DEALS);
      } catch (err) {
        console.error("Failed to fetch deals:", err);
        setDeals(DUMMY_DEALS);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  if (loading) return <Loader size="lg" />;

  return (
    <Stack spacing="md">
      <Stack spacing={0}>
        <Text size="lg" fw={600}>Deals for the weekend</Text>
        <Text size="sm" c="dimmed">Save on stays for 7 November – 9 November</Text>
      </Stack>

      <Carousel
        slideSize={isMobile ? "85%" : "25%"}
        slidesToScroll={isMobile ? 1 : 2}
        slideGap="md"
        align="start"
        loop
        withControls={!isMobile}
        withIndicators={false}
        draggable
      >
        {deals.map((deal, i) => (
          <Carousel.Slide key={deal.id}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card style={{
                maxWidth: isMobile ? "100%" : 360,
                minWidth: isMobile ? "100%" : 310,
              }} radius="lg" p={0} withBorder shadow="sm" className="overflow-hidden">
                <Image src={deal.images} height={180} fit="cover" />
                <Stack p="sm" spacing="xs">
                  <Group position="apart">
                    <Badge color="green" size="sm">{deal.tag ? deal.tag : "Late Escape Deal"}</Badge>
                    <Heart size={18} className="cursor-pointer text-gray-400 hover:text-red-500" />
                  </Group>
                  <Text fw={600} size="sm" lineClamp={1}>{deal.name}</Text>
                  <Group spacing={4}>
                    <MapPin size={14} />
                    <Text size="xs" c="dimmed">{deal.address}</Text>
                  </Group>
                  <Group spacing={4}>
                    <Badge color="blue" variant="filled" size="sm">{deal.rating}</Badge>
                    <Text size="xs" c="dimmed">{deal.reviews} reviews</Text>
                  </Group>
                  <Group spacing={4} align="center">
                    <Text size="sm" td="line-through" c="dimmed">NPR 5,000</Text>
                    <Text fw={700} color="red">NPR {deal.price}</Text>
                  </Group>
                  <Text size="xs" c="dimmed">2 nights</Text>
                </Stack>
              </Card>
            </motion.div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Stack>
  );
}