"use client";

import { useState } from "react";
import { Container, Stack, Title, Text, Grid, Card, Image, Badge, SimpleGrid, Group, Box, Button, useMantineTheme } from "@mantine/core";
import { motion } from "framer-motion";
import { IconStar } from "@tabler/icons-react";
import Layout from "@/components/Layout/Layout";
import Header from "@/components/hotels/Header";
import HotelListing from "@/components/hotels/HotelListing";
import HotelBookingModal from "@/components/hotels/hotelBookingModal";
import { Carousel } from "@mantine/carousel";
import Footer from "@/components/hotels/HotelFooter";
import { useDark } from "@/utils/helpers";
import DestinationCarousel from "@/components/hotels/Destination";
import PropertyTypeCarousel from "@/components/hotels/ExploreHotels";
import WeekendDealsCarousel from "@/components/hotels/Deals";
import UniqueStaysCarousel from "@/components/hotels/UniqueStay";
import WhyChooseHomaaleStay from "@/components/hotels/WhyChoose";
import FeaturedStays from "@/components/hotels/FeaturedStays";
import RecommendedHotels from "@/components/hotels/RecommendedHotels";

// Hero Images (CozyStay-inspired stock photos)
const heroImages = [
  "https://images.unsplash.com/photo-1623492701902-47dc207df5dc?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200", // Mountain lodge
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200", // City hotel
];

export default function Home() {
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [searchParams, setSearchParams] = useState({
    location: "",
    checkIn: null as string | null,
    checkOut: null as string | null,
    guests: 1,
  });
      const theme = useMantineTheme();
      const dark = useDark();

  return (
    <Layout heading={"Stays"} hideBreadCrumbs={true}>
   <Box mb="xl" style={{ zIndex: 10, position: "relative"  }}>

     <Header  />
   </Box>

      {/* Hero Section (CozyStay Parallax-Style) */}

      <Container size="xl" py="xl">


        <Stack  spacing="sm">
          {/* Featured Hotels */}
         <FeaturedStays/>

          {/* Hotel Listing */}
          <HotelListing searchParams={searchParams}isFrontPage={true} />
          <DestinationCarousel/>
          <PropertyTypeCarousel/>
          <WeekendDealsCarousel/>
          <RecommendedHotels isFrontPage={true} />
          <UniqueStaysCarousel/>

          {/* Testimonials (CozyStay Slider) */}
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Title order={3} ta="start" mb="lg">What Guests Say</Title>
            <Carousel height={200} slideSize="33.33%" slideGap="lg">
              {["Amazing stay! Cozy rooms and great service.", "Perfect for families. Highly recommend!", "Luxurious and relaxing. Will return!"].map((t, i) => (
                <Carousel.Slide key={i}>
                  <Card radius="md" p="md" ta="center">
                    <Text size="sm" c="dimmed">{t}</Text>
                    <Text mt="xs" size="xs" fw={500}>– Happy Guest</Text>
                  </Card>
                </Carousel.Slide>
              ))}
            </Carousel>
          </motion.section>
          <WhyChooseHomaaleStay/>
        </Stack>
      </Container>

      {selectedHotel && (
        <HotelBookingModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
          searchParams={searchParams}
        />
      )}
      <Footer/>
    </Layout>
  );
}
