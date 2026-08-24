"use client";

import { useState } from "react";
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Card,
  Tabs,
  Image,
  NumberInput,
  Divider,
  SimpleGrid,
} from "@mantine/core";

import { motion } from "framer-motion";
import { Bed, MapPin, Star } from "lucide-react";
import { useRouter } from "next/router";

type Props = {
  hotel: any;
  onClose: () => void;
  searchParams: { checkIn: string | null; checkOut: string | null; guests: number };
};

export default function HotelBookingModal({ hotel, onClose, searchParams }: Props) {
  const [rooms, setRooms] = useState(1);
  const [activeTab, setActiveTab] = useState<string|null>("overview");
  const [selectedRoom, setSelectedRoom] = useState("standard");
  const router = useRouter();

  const checkInDate = searchParams.checkIn ? new Date(searchParams.checkIn) : null;
  const checkOutDate = searchParams.checkOut ? new Date(searchParams.checkOut) : null;
  const nights = checkInDate && checkOutDate ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) : 1;
  const roomPrices = { standard: hotel.price, deluxe: hotel.price + 50, suite: hotel.price + 100 };
  const totalPrice = roomPrices[selectedRoom as keyof typeof roomPrices] * nights * rooms;

  const formatDate = (d: Date | null) => d?.toLocaleDateString() || "-";

  const handleBook = () => {
    // Navigate to checkout with room type
    const formatForURL = (d: Date | null) => d ? `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}` : "";
    const params = new URLSearchParams({
      hotelId: hotel.id.toString(),
      hotelName: hotel.name,
      hotelImage: hotel.image,
      hotelPrice: hotel.price.toString(),
      nights: nights.toString(),
      rooms: rooms.toString(),
     checkIn: formatForURL(checkInDate),
    checkOut: formatForURL(checkOutDate),
      guests: searchParams.guests.toString(),
    });
    router.push(`/hotels/hotelcheckout?${params.toString()}`);
    onClose();
 
  };

  const roomsData = [
    { type: "standard", beds: 1, price: hotel.price, desc: "Cozy single room" },
    { type: "deluxe", beds: 2, price: hotel.price + 50, desc: "Spacious with view" },
    { type: "suite", beds: 3, price: hotel.price + 100, desc: "Luxury king suite" },
  ];

  return (
    <Modal opened={!!hotel} onClose={onClose} size="lg" centered title={hotel?.name} radius="md">
      <Stack spacing="lg">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
          <Image src={hotel?.image} height={250} radius="md" />
        </motion.div>

        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="rooms">Rooms</Tabs.Tab>
            <Tabs.Tab value="pricing">Pricing</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Stack spacing="md">
              <Group position="apart">
                <div>
                  <Group><MapPin size={16} /><Text>{hotel?.location}</Text></Group>
                  <Group><Star size={16} fill="gold" /><Text>{hotel?.rating} ({hotel?.reviews})</Text></Group>
                </div>
              </Group>
              <Text c="dimmed">{hotel?.description}</Text>
              <Card p="md" bg="gray.0">
            <Group position="apart">
                  <div><Text c="dimmed">Check-in</Text><Text fw={500}>{formatDate(checkInDate)}</Text></div>
                  <div><Text c="dimmed">Check-out</Text><Text fw={500}>{formatDate(checkOutDate)}</Text></div>
                  <div><Text c="dimmed">Nights</Text><Text fw={500}>{nights}</Text></div>
                </Group>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="rooms">
            <SimpleGrid cols={3} spacing="md">
              {roomsData.map((room) => (
                <motion.div
                  key={room.type}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedRoom(room.type)}
                  className={`p-4 border rounded-lg cursor-pointer ${selectedRoom === room.type ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}
                >
                  <Group><Bed /><Text fw={600}>{room.type.toUpperCase()}</Text></Group>
                  <Text size="sm" c="dimmed">{room.desc}</Text>
                  <Text fw={500} mt="xs">${room.price}/night</Text>
                </motion.div>
              ))}
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="pricing">
            <Card p="md" bg="gray.0">
              <Stack spacing="md">
                <Group style={{justifyContent:"space-between"}}><Text>Room Type</Text><Text fw={600}>{selectedRoom}</Text></Group>
                <Group style={{justifyContent:"space-between"}}><Text>Per Night</Text><Text fw={600}>${roomPrices[selectedRoom as keyof typeof roomPrices]}</Text></Group>
                <Group style={{justifyContent:"space-between"}}><Text>Nights</Text><Text fw={600}>{nights}</Text></Group>
                <Group style={{justifyContent:"space-between"}}><Text>Rooms</Text><NumberInput value={rooms} onChange={(v) => setRooms(v || 1)} min={1} max={5} /></Group>
                <Divider />
                <Group style={{justifyContent:"space-between"}}><Text fw={700} size="lg">Total</Text><Text fw={700} size="lg" className="text-amber-600">${totalPrice}</Text></Group>
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>

        <Group grow>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleBook} className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            Book Now - ${totalPrice}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}