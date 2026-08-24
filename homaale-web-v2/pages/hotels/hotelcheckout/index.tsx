"use client";

import { useState, useMemo } from "react";
import {
  Container,
  Stack,
  Group,
  Button,
  Card,
  Text,
  TextInput,
  Select,
  Divider,
  Grid,
  Badge,
  Image,
  Loader,
  Center,
  Radio,
  NumberInput,
  Alert,
  Title,
} from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Lock, CreditCard, Calendar, Users, Home, Star } from "lucide-react";
import { motion } from "framer-motion";
import { notifications } from "@mantine/notifications";
import { axiosClient } from "@/utils/axiosClient";
import Layout from "@/components/Layout/Layout";


export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL
  const hotelId = searchParams.get("hotelId");
  const hotelName = searchParams.get("hotelName");
  const hotelImage = searchParams.get("hotelImage");
  const hotelPrice = Number(searchParams.get("hotelPrice")) || 0;
  const nights = Number(searchParams.get("nights")) || 1;
  const rooms = Number(searchParams.get("rooms")) || 1;
  const checkInRaw = searchParams.get("checkIn");
  const checkOutRaw = searchParams.get("checkOut");
  const guests = Number(searchParams.get("guests")) || 1;

  // Parse human dates
const parseDate = (s: string | null): string | null => {
    if (!s) return null;
    const [month, day, year] = s.split("/").map(Number);
    if (!month || !day || !year) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  };

  const checkInISO = parseDate(checkInRaw);
  const checkOutISO = parseDate(checkOutRaw);
  // Form
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", country: "",
    cardNumber: "", expiry: "", cvv: "", cardName: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [step, setStep] = useState<"details" | "payment" | "confirm">("details");
  const [loading, setLoading] = useState(false);

  // Pricing
  const subtotal = hotelPrice * nights * rooms;
  const tax = Math.round(subtotal * 0.12 * 100) / 100;
  const serviceFee = 15;
  const total = subtotal + tax + serviceFee;

  // Confirmation
  const confirmation = useMemo(() => `BK${Math.random().toString(36).substr(2, 9).toUpperCase()}`, []);

  const update = (field: keyof typeof formData, value: string) => {
    setFormData(p => ({ ...p, [field]: value }));
  };

  const goToPayment = () => {
    const { firstName, lastName, email, phone } = formData;
    if (!firstName || !lastName || !email || !phone) {
      notifications.show({ title: "Incomplete", message: "Fill all guest details", color: "red" });
      return;
    }
    setStep("payment");
  };

  const completeBooking = async () => {
    if (!formData.cardNumber || !formData.expiry || !formData.cvv) {
      notifications.show({ title: "Payment Error", message: "Complete card details", color: "red" });
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/api/booking", {
        hotelId, checkIn: checkInISO, checkOut: checkOutISO, nights, rooms, guests, total,
        guest: { ...formData },
        payment: { method: paymentMethod, ...formData },
        confirmationNumber: confirmation,
      });
      setStep("confirm");
    } catch {
      notifications.show({ title: "Failed", message: "Booking failed. Try again.", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    // <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
    <Layout>
      <Container size="xl" py={{ base: "md", md: "xl" }}>
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button
            variant="subtle"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => router.back()}
            mb="lg"
            className="text-amber-700 hover:text-amber-900"
          >
            Back to Hotel
          </Button>
        </motion.div>

        <Grid gutter="xl">
          {/* ========== MAIN FORM ========== */}
          <Grid.Col span={12} md={8}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card radius="xl" p={{ base: "md", md: "xl" }} shadow="xl" className="bg-white/95 backdrop-blur">
                {/* Progress Bar */}
                <Group style={{justifyContent:"center"}} mb="xl">
                  {["details", "payment", "confirm"].map((s, i) => (
                    <Group key={s} spacing="xs">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all ${
                          step === s || (i === 2 && step === "confirm") ? "bg-amber-600" : "bg-gray-300"
                        }`}
                      >
                        {step === "confirm" && i < 2 ? <Check size={16} /> : i + 1}
                      </div>
                      {i < 2 && <div className="w-16 h-1 bg-gray-300" />}
                    </Group>
                  ))}
                </Group>

                {/* STEP 1: Guest Details */}
                {step === "details" && (
                  <Stack spacing="lg">
                    <Title order={3} ta="center" className="text-amber-800">Guest Information</Title>
                    <Grid gutter="md">
                      <Grid.Col span={6}><TextInput label="First Name" placeholder="John" value={formData.firstName} onChange={(e) => update("firstName", e.currentTarget.value)} radius="lg" /></Grid.Col>
                      <Grid.Col span={6}><TextInput label="Last Name" placeholder="Doe" value={formData.lastName} onChange={(e) => update("lastName", e.currentTarget.value)} radius="lg" /></Grid.Col>
                      <Grid.Col span={12}><TextInput label="Email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => update("email", e.currentTarget.value)} radius="lg" /></Grid.Col>
                      <Grid.Col span={12}><TextInput label="Phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => update("phone", e.currentTarget.value)} radius="lg" /></Grid.Col>
                      <Grid.Col span={12}>
                        <Select
                          label="Country"
                          placeholder="Select"
                          data={["United States", "Canada", "United Kingdom", "Nepal", "India"]}
                          value={formData.country}
                          onChange={(v) => update("country", v || "")}
                          radius="lg"
                          searchable
                        />
                      </Grid.Col>
                    </Grid>
                    <Button onClick={goToPayment} size="lg" radius="xl" className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                      Continue to Payment
                    </Button>
                  </Stack>
                )}

                {/* STEP 2: Payment */}
                {step === "payment" && (
                  <Stack spacing="lg">
                    <Title order={3} ta="center" className="text-amber-800">Secure Payment</Title>
                    <Alert icon={<Lock size={16} />} color="orange" radius="lg">
                      Your payment is encrypted and secure.
                    </Alert>

                    <Radio.Group value={paymentMethod} onChange={setPaymentMethod}>
                      <Stack spacing="sm">
                        <Radio value="card" label={<Group><CreditCard size={18} /> Credit/Debit Card</Group>} />
                        <Radio value="paypal" label="PayPal" disabled />
                      </Stack>
                    </Radio.Group>

                    <Grid gutter="md">
                      <Grid.Col span={12}><TextInput label="Card Number" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={(e) => update("cardNumber", e.currentTarget.value)} radius="lg" /></Grid.Col>
                      <Grid.Col span={12}><TextInput label="Name on Card" placeholder="John Doe" value={formData.cardName} onChange={(e) => update("cardName", e.currentTarget.value)} radius="lg" /></Grid.Col>
                      <Grid.Col span={6}><TextInput label="Expiry (MM/YY)" placeholder="12/28" value={formData.expiry} onChange={(e) => update("expiry", e.currentTarget.value)} radius="lg" /></Grid.Col>
                      <Grid.Col span={6}><TextInput label="CVV" placeholder="123" value={formData.cvv} onChange={(e) => update("cvv", e.currentTarget.value)} radius="lg" /></Grid.Col>
                    </Grid>

                    <Group grow>
                      <Button variant="light" onClick={() => setStep("details")} radius="xl">Back</Button>
                      <Button onClick={completeBooking} size="lg" radius="xl" disabled={loading} className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                        {loading ? <Loader size="sm" color="white" /> : `Pay $${total}`}
                      </Button>
                    </Group>
                  </Stack>
                )}

                {/* STEP 3: Confirmation */}
                {step === "confirm" && (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-amber-600 flex items-center justify-center mx-auto mb-6">
                      <Check size={40} className="text-white" />
                    </div>
                    <Title order={2} className="text-amber-800">Booking Confirmed!</Title>
                    <Text c="dimmed" mt="xs">Confirmation: <strong>{confirmation}</strong></Text>

                    <Card mt="xl" radius="lg" p="lg" className="bg-gradient-to-r from-amber-50 to-orange-50">
                      <Stack align="center">
                        <Image src={hotelImage || "/placeholder.svg"} width={200} radius="md" />
                        <Title order={4}>{hotelName}</Title>
                        <Group><Calendar size={16} /><Text>{checkInRaw} → {checkOutRaw}</Text></Group>
                        <Group><Users size={16} /><Text>{guests} Guests • {rooms} Room(s)</Text></Group>
                        <Badge size="lg" color="orange">PAID: ${total}</Badge>
                      </Stack>
                    </Card>

                    <Group mt="xl" grow>
                      <Button variant="light" radius="xl" onClick={() => router.push("/")}>Back Home</Button>
                      <Button radius="xl" className="bg-amber-600 text-white" onClick={() => notifications.show({ message: "Email sent!", color: "green" })}>
                        View Email
                      </Button>
                    </Group>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </Grid.Col>

          {/* ========== SIDEBAR: Summary ========== */}
          <Grid.Col span={12} md={4}>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card radius="xl" p="lg" shadow="xl" className="bg-white/95 backdrop-blur sticky top-6">
                <Title order={4} className="text-amber-800 mb-4">Your Stay</Title>
                <Image src={hotelImage || "/placeholder.svg"} height={160} radius="lg" fit="cover" mb="md" />

                <Stack spacing="xs">
                  <Group style={{justifyContent:"space-between"}}><Text size="sm"><Home size={14} /> Hotel</Text><Text fw={600}>{hotelName}</Text></Group>
                  <Group style={{justifyContent:"space-between"}}><Text size="sm"><Calendar size={14} /> Dates</Text><Text fw={600}>{nights} nights</Text></Group>
                  <Group style={{justifyContent:"space-between"}}><Text size="sm"><Users size={14} /> Guests</Text><Text fw={600}>{guests} • {rooms} room(s)</Text></Group>
                  <Group style={{justifyContent:"space-between"}}><Text size="sm"><Star size={14} /> Rate</Text><Text fw={600}>${hotelPrice}/night</Text></Group>
                </Stack>

                <Divider my="lg" />

                <Stack spacing="xs">
                  <Group style={{justifyContent:"space-between"}}><Text>Subtotal</Text><Text fw={600}>${subtotal}</Text></Group>
                  <Group style={{justifyContent:"space-between"}}><Text>Tax (12%)</Text><Text fw={600}>${tax}</Text></Group>
                  <Group style={{justifyContent:"space-between"}}><Text>Service Fee</Text><Text fw={600}>${serviceFee}</Text></Group>
                </Stack>

                <Divider my="lg" variant="dashed" />

                <Group style={{justifyContent:"space-between"}}>
                  <Text size="lg" fw={700} className="text-amber-800">Total</Text>
                  <Text size="xl" fw={900} className="text-amber-600">${total}</Text>
                </Group>

                <Badge fullWidth mt="md" size="lg" color="orange" radius="xl">
                  Secure Checkout • Instant Confirmation
                </Badge>
              </Card>
            </motion.div>
          </Grid.Col>
        </Grid>
      </Container>
  </Layout>
  );
}