"use client";

import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Stack,
  ActionIcon,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { MapPin, ChevronLeft, ChevronRight, Star, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import {number} from "yup";

export type Hotel = {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  nightly: number;
  price: number;
  originalTotal: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  discount: string;
  images: string[];
  slug?: string;
  latitude?:number;
  longitude?:number;
  icon?:string;
};

export default function HotelCard({hotel, weidth, compact}: { hotel: Hotel, weidth?: number|string, compact?:boolean }) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const cardVariants = {
    rest: { y: 0, scale: 1, boxShadow: theme.shadows.sm },
    hover: {
      y: -6,
      scale: 1.02,
      boxShadow: theme.shadows.lg,
      transition: { type: "spring", stiffness: 320, damping: 24 },
    },
  };

  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.08, transition: { duration: 0.4 } },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.15 } },
  };

  return (
    <Link href={`/hotels/${hotel.slug}`} passHref legacyBehavior>
     <motion.div
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
        animate="rest"
        style={{ height: "100%", width: compact ? "100%" : (weidth ? weidth : 300), borderRadius: 20}}
      >
        <Card
          radius="lg"
          p={0}
          shadow="sm"
          withBorder
          className="overflow-hidden h-full flex flex-col bg-white"
          style={{
              // maxWidth: compact ? 220 : (weidth ? weidth : 300),
              // minWidth: compact ? 220 : (weidth ? weidth : 300)
              ...(compact
                      ? {}
                      : {
                          maxWidth: weidth ? weidth : 300,
                          minWidth: weidth ? weidth : 300,
                      }
              ),
          }}

        >
          {/* ------------------- IMAGE + ARROWS ------------------- */}
          <div className="relative cursor-pointer">
            <Image
              src={hotel?.images?.[0] || hotel?.name}
              height={compact ? 150 : isMobile ? 160 : 230}
              // fit="cover"
              // radius="lg"
              alt={hotel.name}
            />
             {hotel.discount&&(   <Badge
                color={theme.colors.red[6]}
                variant="filled"
                size="sm"
                radius="sm"
                style={{
                    position: "absolute",
                  top: 10,
                  right: 10,
                  fontWeight: 600,
                  fontSize: 12,
                  height: 22,
                  padding: "0 6px",
                }}
              >
                {hotel.discount}
              </Badge>)}

            {/* Left Arrow */}
            {/* <ActionIcon
              size={28}
              radius="xl"
              variant="filled"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              <ChevronLeft size={16} color="white" />
            </ActionIcon> */}

            {/* Right Arrow */}
            {/* <ActionIcon
              size={28}
              radius="xl"
              variant="filled"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              <ChevronRight size={16} color="white" />
            </ActionIcon> */}
          </div>

          {/* ------------------- CONTENT ------------------- */}
          <Stack spacing={compact ? 4 : "xs"} p="sm" style={{ flex: 1 }}>
            {/* ----- Rating + Discount ----- */}
            <Group position="apart" align="flex-start">
              {/* Rating Badge */}
              <Badge
                color={theme.colors.green[6]}
                variant="outlined"
                size="lg"
                radius="sm"

                leftSection={<Star size={14} color="green" />}
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  height: 28,
                //   padding: "-",
                //   display: "flex",
                //   alignItems: "flex-start",
                  border:" none",
                }}
              >
                <Badge c={theme.colors.green[8]} variant="none"  size="2px" left={0} radius="sm">

                {hotel.rating}{" "}
                </Badge>
                <Text component="span" size="xs" ml={4} c="white" fw={400}>
                  {hotel.ratingLabel}
                </Text>
                <Text component="span" size="xs" ml={4} c="white" fw={400} opacity={0.8}>
                  ({hotel.reviews} reviews)
                </Text>
              </Badge>

              {/* Discount Badge */}

            </Group>

            {/* ----- Hotel Name ----- */}
            <Text
              fw={600}
              size={compact ? "sm" : isMobile ? "md" : "lg"}
              lineClamp={1}
              mt={compact ? -2 : 0}
              style={{ fontFamily: "Inter, sans-serif", cursor: "pointer" , }}
            >
              {hotel.name}
            </Text>

            {/* ----- Location ----- */}
            <Group spacing={4}>
              <MapPin size={14} color="#6b7280" />
              <Text size={compact ? "xs" : "sm"} c="#6b7280" style={{ fontFamily: "Inter, sans-serif" }} mt={compact ? -2 : 0}>
                {hotel.city}, {hotel.country}
              </Text>
            </Group>

            {/* ----- Price Section ----- */}
            <Stack spacing={0} mt="1px">
              {/* Strikethrough original total */}
              <Text size={compact ? "xs" : "sm"} c="#6b7280" td="line-through" style={{ fontSize: 13 }}>
                ${hotel.price}
              </Text>

              {/* Nightly + Total + Check */}
              <Group spacing={6} align="center">
                <Text fw={700} size={compact ? "md" : "lg"} style={{ fontSize: 18, color: "#1f2937" }}>
                  ${hotel.price} nightly
                </Text>
                {/* <Text size="sm" c="#6b7280" style={{ fontSize: 14 }}>
                  ${hotel.total} total
                </Text> */}
                <ThemeIcon size={18} color="#1a8754" variant="light" radius="xl">
                  <Check size={12} />
                </ThemeIcon>
              </Group>

              {/* Taxes note */}
              <Text size={compact ? "xs" : "xs"} c="#6b7280" style={{ fontSize: 12 }}>
                Total includes taxes and fees
              </Text>
            </Stack>
          </Stack>
        </Card>
      </motion.div>
    </Link>
  );
}
