"use client";

import {
    ActionIcon,
    Avatar,
    Badge,
    Button,
    Flex,
    Group,
    Menu,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {useBrandData} from "@/brand/BrandContext";
import type {Hotel} from "@/components/hotels/HotelCard";
import {number, string} from "yup";
import {IconLocation} from "@tabler/icons-react";

export const HotelMapMarker = ({
                                   hotel,
                                   selectedId,
                                   icons
                               }: {
    hotel: Hotel,
    selectedId?: string | number,
    icons?: string
}) => {
    const theme = useMantineTheme();
    const router = useRouter();
    const [opened, setOpened] = useState(false);
    const {brandData} = useBrandData();
    useEffect(() => {
        if (selectedId === hotel.id) {
            setOpened(true);
        }
    }, [selectedId, hotel.id]);
    const toDataURL = (svgString: string) => {
        // Remove the surrounding <div> if present
        const svgContent = svgString.replace(/<div[^>]*>([\s\S]*?)<\/div>/i, "$1").trim();
        // Encode the SVG string to handle special characters
        const encodedSvg = encodeURIComponent(svgContent)
            .replace(/'/g, "%27")
            .replace(/"/g, "%22");
        return `data:image/svg+xml,${encodedSvg}`;
    };

    // Use the cleaned SVG or fallback to default image
    const iconSrc = icons ? toDataURL(icons) : brandData.favicon;
    return (
        <Group position="center">
            <Menu
                withArrow
                width={300}
                position="right-end"
                transitionProps={{ transition: "pop" }}
                opened={opened}
                onChange={setOpened}
            >
                <Menu.Target>
                    <ActionIcon>
                        <Avatar
                            src={iconSrc}
                            radius="xl"
                            size={45}
                            p={10}
                            sx={{ cursor: "pointer", background: theme.colors.brand[4] }}
                        />
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown
                    py={16}
                    px={24}
                    sx={{
                        boxShadow: "0px 8px 24px rgba(33, 29, 79, 0.15)",
                        borderRadius: theme.radius.lg,
                    }}
                >
                    {/* Hotel Image Preview */}
                    {/*<Image*/}
                    {/*    src={hotel.images?.[0] || "/images/placeholder/hotel-placeholder.jpg"}*/}
                    {/*    alt={hotel.name}*/}
                    {/*    width={260}*/}
                    {/*    height={140}*/}
                    {/*    style={{*/}
                    {/*        borderRadius: theme.radius.md,*/}
                    {/*        objectFit: "cover",*/}
                    {/*        marginBottom: 12,*/}
                    {/*    }}*/}
                    {/*/>*/}

                    {/* Hotel Name */}
                    <Title order={3} size={20} fw={600} mb={6}>
                        {hotel.name}
                    </Title>

                    {/* Location */}
                    <Flex justify={"flex-start"} gap={6} c="dimmed">
                        <IconLocation size={"16"}/>
                        <Text size="sm">{hotel.city}, {hotel.country}</Text>
                    </Flex>

                    {/* Rating */}
                    <Flex align="center" gap={8} mb={12}>
                        <Group spacing={4}>
                            <IconStar fill={theme.colors.brand[3]} color={theme.colors.brand[3]} size={18} />
                            <Text fw={600} size="md">
                                {hotel.rating}
                            </Text>
                            <Text size="sm" c="dimmed">
                                ({hotel.reviews} reviews)
                            </Text>
                        </Group>
                    </Flex>

                    {/* Price */}
                    <Flex justify="space-between" align="center" mb={16}>
                        <div>
                            <Text fw={700} size="xl" color={theme.colors.brand[5]}>
                                ${hotel.price} <Text component="span" size="sm" fw={500}>nightly</Text>
                            </Text>
                        </div>

                        {hotel.discount && (
                            <Badge color="red" variant="filled" size="lg">
                                {hotel.discount}
                            </Badge>
                        )}
                    </Flex>

                    {/* View Button */}
                    <Button
                        fullWidth
                        size="md"
                        onClick={() => router.push(`/hotels/${hotel.slug}`)}
                        style={{ background: theme.colors.brand[4] }}
                    >
                        View Hotel
                    </Button>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
};
