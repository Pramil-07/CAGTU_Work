import React, { useState } from "react";
import {
    Card,
    Avatar,
    Text,
    Group,
    Button,
    Stack,
    Title,
    Tooltip,
    Badge,
    useMantineTheme,
    Flex,
} from "@mantine/core";
import { Currency } from "lucide-react";
import { budgetType } from "@/constants/BudgetType";

const CalendarCard = ({
    id,
    title,
    profile,
    location,
    assignee,
    start_time,
    end_time,
    start_date,
    end_date,
    currency,
    priceType,
    price,
    is_requested,
}: {
    id: string | number;
    title: string;
    profile: string | null;
    location: string;
    assignee: string;
    start_time: string;
    end_time: string;
    start_date: string;
    end_date: string;
    currency: string;
    price: string;
    is_requested: boolean;
    priceType: string;
}) => {
    // const[startTime,setStartTime]=useState("")
    // const[endTime,setendTime]=useState("")

    const theme = useMantineTheme();

    const formatTimeRange = (startTime: string, endTime: string): string => {
        const formatTime = (time: string): string => {
            // Check if time exists before splitting
            if (!time) {
                return " "; // Or handle it differently based on your needs
            }

            const [hours, minutes] = time.split(":").map(Number);
            const period = hours >= 12 ? "PM" : "AM";
            const adjustedHours = hours % 12 || 12;
            return `${adjustedHours}:${minutes
                .toString()
                .padStart(2, "0")} ${period}`;
        };

        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    };
    const simpleFormatPrice = (price: number | string) => {
        const num = typeof price === "string" ? parseFloat(price) : price;
        return isNaN(num) ? "$0.00" : `${num.toFixed(0)}`;
    };
    return (
        <Stack p="sm">
            <Stack spacing="md">
                <Card
                    key={id}
                    radius="md"
                    padding="xl"
                    withBorder
                    shadow="sm"
                    style={{
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    
                >
                    <Group position="apart" align="center" noWrap>
                        {/* Left Section */}
                        <Group align="flex-start" spacing="md" noWrap>
                            {/* <Avatar
                                src={profile}
                                alt="Profile"
                                radius="xl"
                                size={52}
                            /> */}

                            <Stack spacing={4}>
                                <Tooltip label={title} withArrow>
                                    <Text
                                        fw={600}
                                        size="md"
                                        lineClamp={2}
                                        maw={220}
                                    >
                                        {title.charAt(0).toUpperCase() +
                                            title.slice(1)}
                                    </Text>
                                </Tooltip>

                                <Text c="dimmed" mb={5}>
                                    <Flex style={{ marginRight: 4 }}>
                                        📍{location}
                                    </Flex>
                                </Text>

                                {(start_date || end_date) && (
                                    <Stack>
                                        <Badge
                                            radius="sm"
                                            variant="light"
                                            color="brand"
                                            leftSection="📅"
                                        >
                                            {start_date && end_date
                                                ? `${start_date} – ${end_date}`
                                                : start_date || end_date}
                                        </Badge>
                                        <Text size="sm" c="dimmed" fw={500}>
                                            ⏰{" "}
                                            {formatTimeRange(
                                                start_time,
                                                end_time
                                            )}
                                        </Text>
                                    </Stack>
                                )}

                                <Text size="xs" c="dimmed">
                                    Created By: {assignee}
                                </Text>
                            </Stack>
                        </Group>

                        {/* Right Section */}
                        <Stack spacing={6} align="flex-end">
                            <Text fw={700} size="lg">
                                {currency}
                                {simpleFormatPrice(price)}
                            </Text>

                            <Text size="xs" c="dimmed">
                                per {priceType}
                            </Text>

                            <Badge
                                radius="md"
                                size="lg"
                                variant="filled"
                                style={{
                                    background: is_requested
                                        ? theme.colors.gray[3]
                                        : theme.colors.brand[4],
                                    color: is_requested
                                        ? theme.colors.gray[8]
                                        : "white",
                                }}
                            >
                                {is_requested ? "Task" : "Service"}
                            </Badge>
                        </Stack>
                    </Group>
                </Card>
            </Stack>
        </Stack>
    );
};

export default CalendarCard;
