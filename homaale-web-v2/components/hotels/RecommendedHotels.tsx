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


type Props = {
  searchParams?: { location: string };
  isFrontPage?: boolean;
  showTitle?: boolean;
};

export default function RecommendedHotels({
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

  if(hotels.length===0){
    return null;
  }
 if (loading) {
    return  (  <Stack h={200} spacing={showTitle ? "md" : "xs"}>
        {showTitle && (
          <Title order={3} ta="start" size="h3">
            Recommended Hotels
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
            Recommended Hotels
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
              backgroundColor: theme.colors.brand[3],
              border: "none",
              width: 10,
              height: 10,
              "&:hover": { backgroundColor: theme.colors.brand[7] },
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