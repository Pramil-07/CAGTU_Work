"use client";

import { useEffect, useState, useMemo } from "react";
import { Stack, Center, Loader, Title, useMantineTheme } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import HotelCard, { Hotel } from "./HotelCard"; // <-- import the new card
import { set } from "nprogress";
import { axiosClient } from "@/utils/axiosClient";
import NoDataAlert from "../common/NoDataAlert";
import { s } from "@fullcalendar/core/internal-common";
import HomaaleLoader from "../common/HomaaleLoader";

// Data matching your screenshot
const HOTELS_FROM_SCREENSHOT = [
  {
    id: 1,
    name: "Hotel Fewa Trip",
    location: "Pokhara",
    nightly: 41,
    total: 101,
    originalTotal: 201,
    rating: 9.4,
    ratingLabel: "Exceptional",
    reviews: 11,
    discount: "50% off",
    images: ["/hotels/gerson-repreza-CepDpEiALqM-unsplash.jpg"],
  },
  {
    id: 2,
    name: "SQUARE hotel",
    location: "Lalitpur",
    nightly: 109,
    total: 272,
    originalTotal: 340,
    rating: 9.0,
    ratingLabel: "Wonderful",
    reviews: 4,
    discount: "20% off",
    images: ["/hotels/izuddin-helmi-adnan-1e71PSox7m8-unsplash.jpg"],
  },
  {
    id: 3,
    name: "Dwarika's Sanctuary",
    location: "Dhulikhel",
    nightly: 489,
    total: 1127,
    originalTotal: 1834,
    rating: 9.6,
    ratingLabel: "Exceptional",
    reviews: 43,
    discount: "39% off",
    images: ["/hotels/manuel-nobauer-FGGunjsjG6Y-unsplash.jpg"],
  },
  {
    id: 4,
    name: "Nagarkot Shangrila Resort",
    location: "Nagarkot",
    nightly: 45,
    total: 112,
    originalTotal: 140,
    rating: 10,
    ratingLabel: "Exceptional",
    reviews: 1,
    discount: "20% off",
    images: ["/hotels/christian-lambert-vmIWr0NnpCQ-unsplash.jpg"],
  },
  {
    id: 5,
    name: "Manang Hotel",
    location: "Tilott",
    nightly: 31,
    total: 78,
    originalTotal: 130,
    rating: 10,
    ratingLabel: "Exceptional",
    reviews: 1,
    discount: "40% off",
    images: ["/hotels/hotelsfrontpage.avif"],
  },
];

type Props = {
  searchParams?: { location: string };
  isFrontPage?: boolean;
  showTitle?: boolean;
};

export default function HotelListing({
  searchParams,
  isFrontPage = true,
  showTitle = true,
}: Props) {
  const [hotels,setHotels] = useState<Hotel[]>([]);
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(true);

  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
   
useEffect(() => {
  setLoading(true);
  const fetchHotels = async () => {
    try {
      const response = await axiosClient.get('/hotel/list/');
      setHotels(response.data.result);
      console.log("hotel data", response.data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
     
      setHotels([]); // Example: reset hotels on error
    } finally {
      setLoading(false);
    }
  };
  fetchHotels();
}, [searchParams]);

  // const filteredHotels = useMemo(() => {
  //   if (!searchParams?.location) return hotels;
  //   return hotels.filter((h) =>
  //     h.location.toLowerCase().includes(searchParams.location.toLowerCase())
  //   );
  // }, [hotels, searchParams?.location]);
 if (loading) {
    return  (  <Stack h={200} spacing={showTitle ? "md" : "xs"}>
        {showTitle && (
          <Title order={3} ta="start" size="h3">
            Find Hotels
          </Title>
        )}
    <Center mt={20}><HomaaleLoader/></Center>
      </Stack>);
  }
  if (isFrontPage) {
    return (
      <Stack spacing={showTitle ? "md" : "xs"}>
        {showTitle && (
          <Title order={3} ta="start" size="h3">
            Find Hotels
          </Title>
        )}

       {
       
       hotels.length>0?( <Carousel
          loop
          withIndicators={false}
          withControls={!isXs || hotels.length>0}
          align="start"
          slideGap="md"
          slidesToScroll={1}
          slideSize={isXs ? "85%" : isSm ? "50%" : isMd ? "33.333%" : "25%"}
          height="auto"
          draggable
          styles={{
            control: {
              backgroundColor: theme.colors.brand[0],
              border: "none",
              width: 10,
              height: 10,
              
            },
          }}
        >
          { hotels.map((hotel) => (
            <Carousel.Slide key={hotel.id}>
              <HotelCard hotel={hotel} />
            </Carousel.Slide>
          ))}
        </Carousel>):(<Center style={{ height: 200 }}>
            <NoDataAlert message="No hotels found." />
          </Center>)}
      </Stack>
    );
  }

  // Grid view for search results
  return (
    <Stack spacing="xl">
      <Title order={2} ta="center">
        Stays in {searchParams?.location || "Everywhere"}
      </Title>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        { hotels&&hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </Stack>
  );
}