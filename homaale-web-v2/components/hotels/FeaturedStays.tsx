// components/FeaturedStays.tsx
'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Center, Grid, Text, Title, useMantineTheme} from '@mantine/core';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { axiosClient } from '@/utils/axiosClient';
import HomaaleLoader from '../common/HomaaleLoader';

// === DUMMY DATA (fallback if API fails) ===
const DUMMY_DESTINATIONS = [
  {
    location: 'kathmandu',
    label: 'Kathmandu',
    image: 'https://images.unsplash.com/photo-1623492701902-47dc207df5dc?q=80&w=1470&auto=format&fit=crop',
  },
  {
    location: 'pokhara',
    label: 'Pokhara',
    image: 'https://images.unsplash.com/photo-1576948187290-457c015b3bff?q=80&w=1470&auto=format&fit=crop',
  },
  {
    location: 'chitwan',
    label: 'Chitwan',
    image: 'https://images.unsplash.com/photo-1674569273857-8500cf8605d9?q=80&w=1470&auto=format&fit=crop',
  },
  {
    location: 'mustang',
    label: 'Mustang',
    image: 'https://images.unsplash.com/photo-1516009183258-eaca18512e83?q=80&w=1470&auto=format&fit=crop',
  },
  {
    location: 'bhaktapur',
    label: 'Bhaktapur',
    image: 'https://images.unsplash.com/photo-1623492961702-549ffd2c7155?q=80&w=1470&auto=format&fit=crop',
  },
];

type Destination = {
  location: string;
  label: string;
  image: string;
};

export default function FeaturedStays() {
  const theme = useMantineTheme();
  const router = useRouter();
  const dark = theme.colorScheme === 'dark';

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await axiosClient.get('/destinations/featured'); // Change to your real endpoint
        setDestinations(res.data); // Expect: { location, label, image }[]
      } catch (err) {
        console.warn('Failed to fetch featured destinations, using dummy data');
        setDestinations(DUMMY_DESTINATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const handleClick = (location: string) => {
    router.push(`/hotels/search?location=${encodeURIComponent(location)}`);
  };

  if (loading) {
    return <Center mt={20}><HomaaleLoader/></Center>}

  return (
    <Box mb="sm">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title order={2} ta="left" mb="md">
          Featured Stays
        </Title>

        <Grid className="flex gap-5 mt-2 mb-2 ml-2 justify-start flex-wrap">
          {destinations&&destinations.map((dest) => (
            <Button
              key={dest.location}
              variant="outline"
              onClick={() => handleClick(dest.location)}
              style={{
                backgroundImage: `url(${dest.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: 150,
                height: 100,
                borderColor: dark ? theme.colors.brand[4] : 'white',
                borderWidth: 2,
                borderRadius: 12,
                position: 'relative',
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <Text
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                  pointerEvents: 'none',
                }}
              >
                {dest.label}
              </Text>
            </Button>
          ))}
        </Grid>
      </motion.div>
    </Box>
  );
}