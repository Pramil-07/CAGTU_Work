import React from 'react';
import { Card, Avatar, Text, Group, Button, Stack, Title, Badge } from '@mantine/core';

const BookingCards = ({ bookings }:any) => {
    return (
        <Stack p="md">
            {/* Header Section */}
            <Group position="apart" mb="md">
                <Title order={2}>December 4</Title>
                <Text c="dimmed" size="sm">
                    4 bookings found on 4 dec, 6:30 AM - 7:30 AM
                </Text>
            </Group>

            {/* Cards Section */}
            <Stack spacing="md">
                {bookings.map((booking: { image: string | null | undefined; taskName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; address: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; timeFrame: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; price: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; status: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | null | undefined; }, index: React.Key | null | undefined) => (
                    <Card
                        key={index}
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        withBorder
                    >
                        <Group position="apart" align="flex-start">
                            {/* Left Section: Avatar and Details */}
                            <Group>
                                <Avatar src={booking.image} alt="Profile" radius="xl" size="lg" />
                                <Stack spacing={5}>
                                    <Text fw={500} size="lg">{booking.taskName}</Text>
                                    <Text c="dimmed" size="sm">{booking.address}</Text>
                                    <Text c="dimmed" size="sm">{booking.timeFrame}</Text>
                                </Stack>
                            </Group>

                            {/* Right Section: Price and Status */}
                            <Stack align="flex-end" spacing={10}>
                                <Text fw={700} size="lg">{booking.price}</Text>
                                <Badge
                                    color={booking.status === 'In Progress' ? 'yellow' : 'orange'}
                                    variant="filled"
                                    size="lg"
                                >
                                    {booking.status}
                                </Badge>
                            </Stack>
                        </Group>
                    </Card>
                ))}
            </Stack>
        </Stack>
    );
};

export default BookingCards;
