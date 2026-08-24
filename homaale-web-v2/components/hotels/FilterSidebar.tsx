// components/hotels/FilterSidebar.tsx
import {
  Card,
  Title,
  Divider,
  Stack,
  Checkbox,
  RangeSlider,
  Button,
  Group,
  Text,
} from "@mantine/core";
import { useMantineTheme } from "@mantine/core";

interface FilterSidebarProps {
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  selectedPropertyType: string[];
  handlePropertyTypeChange: (value: string, checked: boolean) => void;
  selectedRatingType: string[];
  handleRatingChange: (value: string, checked: boolean) => void;
  selectedBedNumber: string[];
  handleBedNumberChange: (value: string, checked: boolean) => void;
  selectedAmenityType: string[];
  handleAmenityTypeChange: (value: string, checked: boolean) => void;
  onClearFilters: () => void;
}

const propertyTypes = [
  { value: "hotel", label: "Hotel" },
  { value: "resort", label: "Resort" },
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Apartment" },
];

const starOptions = Array.from({ length: 5 }, (_, i) => ({
  value: `${i + 1}`,
  label: `${i + 1} Star`,
}));

const bedOptions = Array.from({ length: 5 }, (_, i) => ({
  value: `${i + 1}`,
  label: `${i + 1} Bed`,
}));

const amenities = [
  { value: "pool", label: "Pool" },
  { value: "spa", label: "Spa" },
  { value: "wifi", label: "Free WiFi" },
  { value: "parking", label: "Free Parking" },
  { value: "gym", label: "Gym" },
  { value: "breakfast", label: "Breakfast" },
];

export default function FilterSidebar({
  priceRange,
  setPriceRange,
  selectedPropertyType,
  handlePropertyTypeChange,
  selectedRatingType,
  handleRatingChange,
  selectedBedNumber,
  handleBedNumberChange,
  selectedAmenityType,
  handleAmenityTypeChange,
  onClearFilters,
}: FilterSidebarProps) {
  const theme = useMantineTheme();

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group mb="md"  align="center" className="flex items-center justify-start">
        <Title order={4}>Filter by:</Title>
        <Button variant="subtle" size="xs" onClick={onClearFilters} color="gray">
          Clear All
        </Button>
      </Group>
      <Divider mb="md" />

      {/* Budget Filter */}
      <Title order={6}>Your budget (per night)</Title>
      <Text mt="xs" size="sm" c="dimmed">
        NPR {priceRange[0].toLocaleString()} - NPR {priceRange[1] === 200000 ? "200,000+" : priceRange[1].toLocaleString()}
      </Text>
      <RangeSlider
        value={priceRange}
        onChange={setPriceRange}
        min={100}
        max={200000}
        step={10}
        minRange={10}
        mb="md"
        mt={8}
        styles={{
          thumb: { borderWidth: 2, height: 18, width: 18 },
          track: { backgroundColor: theme.colors.gray[3] },
        }}
      />
      <Divider mb="md" />

      {/* Property Type */}
      <Title order={6} mb="md" mt="md">
        Property Type
      </Title>
      <Stack style={{ maxHeight: "140px", overflowY: "auto" }}>
        {propertyTypes.map((cat) => (
          <Checkbox
            key={cat.value}
            label={cat.label}
            checked={selectedPropertyType.includes(cat.value)}
            onChange={(e) => handlePropertyTypeChange(cat.value, e.currentTarget.checked)}
            styles={{ input: { cursor: "pointer" }, label: { cursor: "pointer" } }}
          />
        ))}
      </Stack>
      <Divider mb="md" mt="md" />

      {/* Property Rating */}
      <Title order={6} mt="md" mb="md">
        Property Rating
      </Title>
      <Stack>
        {starOptions.map((cat) => (
          <Checkbox
            key={cat.value}
            label={cat.label}
            checked={selectedRatingType.includes(cat.value)}
            onChange={(e) => handleRatingChange(cat.value, e.currentTarget.checked)}
            styles={{ input: { cursor: "pointer" }, label: { cursor: "pointer" } }}
          />
        ))}
      </Stack>
      <Divider mb="md" mt="md" />

      {/* Bedroom Number */}
      <Title order={6} mt="md" mb="md">
        Property Beds
      </Title>
      <Stack>
        {bedOptions.map((cat) => (
          <Checkbox
            key={cat.value}
            label={cat.label}
            checked={selectedBedNumber.includes(cat.value)}
            onChange={(e) => handleBedNumberChange(cat.value, e.currentTarget.checked)}
            styles={{ input: { cursor: "pointer" }, label: { cursor: "pointer" } }}
          />
        ))}
      </Stack>
      <Divider mb="md" mt="md" />

      {/* Amenities */}
      <Title order={6} mt="md" mb="md">
        Facilities
      </Title>
      <Stack>
        {amenities.map((cat) => (
          <Checkbox
            key={cat.value}
            label={cat.label}
            checked={selectedAmenityType.includes(cat.value)}
            onChange={(e) => handleAmenityTypeChange(cat.value, e.currentTarget.checked)}
            styles={{ input: { cursor: "pointer" }, label: { cursor: "pointer" } }}
          />
        ))}
      </Stack>
    </Card>
  );
}