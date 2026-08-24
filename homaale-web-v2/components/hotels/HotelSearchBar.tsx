// components/SearchForm.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DatePickerInput } from '@mantine/dates';
import {
  Select,
  Button,
  Box,
  rem,
} from '@mantine/core';
import { IconSearch, IconMapPin, IconCalendar, IconUser } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useCityOption } from '@/hooks/useCityOptions';

const guestOptions = [
  { value: '1 Adult', label: '1 Adult' },
  { value: '2 Adults', label: '2 Adults' },
  { value: '2 Adults, 1 Child', label: '2 Adults, 1 Child' },
  { value: '3 Adults', label: '3 Adults' },
  { value: 'Family', label: 'Family' },
];

const parseGuestCount = (s?: string | null) => {
  const m = s?.match(/(\d+)/);
  return m ? parseInt(m[0], 10) : 2;
};

type Props = {
  initialValues?: {
    location?: {
      id: number;
      name: string;
    };
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
};

export default function SearchForm({ initialValues }: Props = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [location, setLocation] = useState<string | null>(initialValues?.location ? initialValues.location.name : null);
  const { data: cityData = [] } = useCityOption(location ?? '', true);
  const cityOptions = [ ...cityData];
  const [dates, setDates] = useState<[Date | null, Date | null]>([
    initialValues?.checkIn ? new Date(initialValues.checkIn) : null,
    initialValues?.checkOut ? new Date(initialValues.checkOut) : null,
  ]);
  const [guests, setGuests] = useState<string | null>(
    initialValues?.guests ? `${initialValues.guests} Adult${initialValues.guests > 1 ? 's' : ''}` : ''
  );

  useEffect(() => {
    setLocation(initialValues?.location ? initialValues.location.name : null);
    setDates([
      initialValues?.checkIn ? new Date(initialValues.checkIn) : null,
      initialValues?.checkOut ? new Date(initialValues.checkOut) : null,
    ]);
    setGuests(
      initialValues?.guests ? `${initialValues.guests} Adult${initialValues.guests > 1 ? 's' : ''}` : '2 Adults'
    );
  }, [initialValues]);

  const handleSearch = () => {
    const [checkIn, checkOut] = dates;
    if (!location || !checkIn || !checkOut) return;
    const payload = {
      location,
      checkIn: format(checkIn, 'yyyy-MM-dd'),
      checkOut: format(checkOut, 'yyyy-MM-dd'),
      guests: parseGuestCount(guests),
    };
    const sp = new URLSearchParams(payload as any);
    const url = `/hotels/search?${sp.toString()}`;
    const pushOrReplace = pathname === '/hotels/search' ? router.replace : router.push;
    pushOrReplace(url);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(12),
        alignItems: 'stretch',
      }}
    >
      <Select
        data={cityOptions}
        value={location}
        searchable
        clearable
        onChange={setLocation}
        placeholder="Where to?"
        icon={<IconMapPin size={20} />}
        styles={{
          input: {
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: rem(50),
            height: rem(48),
            fontSize: rem(15),
            color: '#212529',
            width: '100%',
            '&:focus': { borderColor: '#228be6' },
          },
        }}
        style={{ flex: 1, minWidth: rem(200) }}
      />
      <DatePickerInput
        type="range"
        placeholder="Check in – Check out"
        icon={<IconCalendar size={20} />}
        value={dates}
        onChange={setDates}
        minDate={new Date()}
        clearable
        styles={{
          input: {
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: rem(50),
            height: rem(48),
            fontSize: rem(15),
            color: '#212529',
            '&:focus': { borderColor: '#228be6' },
          },
        }}
        style={{ flex: 1, minWidth: rem(200) }}
      />
      <Select
        data={guestOptions}
        value={guests}
        onChange={(val) => setGuests(val)}
        placeholder="Guests"
        icon={<IconUser size={20} />}
        styles={{
          input: {
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: rem(50),
            height: rem(48),
            fontSize: rem(15),
            color: '#212529',
            width: '100%',
            '&:focus': { borderColor: '#228be6' },
          },
        }}
        style={{ flex: 1, minWidth: rem(150) }}
      />
      <Button
        size="lg"
        leftIcon={<IconSearch size={20} />}
        onClick={handleSearch}
        disabled={!location }
        color="blue"
        radius="xl"
        style={{ height: rem(48), flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        Search
      </Button>
    </Box>
  );
}