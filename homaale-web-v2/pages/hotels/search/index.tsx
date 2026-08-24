"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  Text,
  Group,
  Stack,
  Title,
  Switch,
  Rating,
  Pagination,
  Loader,
  Alert,
  Select,
  Box,
  Checkbox,
  Button,
  RangeSlider,
  Divider ,
  Accordion,
  Drawer,
  useMantineTheme
} from "@mantine/core";
import Image from "next/image";
import { IconAlertCircle } from "@tabler/icons-react";
import { FiFilter } from "react-icons/fi";
import { motion } from "framer-motion";
import { Heart, Link } from "lucide-react";
import { IoIosArrowForward } from "react-icons/io";
import { useSearchParams } from "next/navigation";
import Header from "@/components/hotels/Header";
import { axiosClient } from "@/utils/axiosClient";
import Layout from "@/components/Layout/Layout";
import { useMediaQuery } from "@mantine/hooks";
import FilterSidebar from "@/components/hotels/FilterSidebar";
import { useRouter } from "next/router";

interface Hotel {
  id: number;
  name: string;
  rating: number;
  price: number;
  images: string[];
  address: string;
  city: string;
  description: string;
  slug:string;
  reviews?: string;
  stars: number;
}

export default function SearchPage() {
   // URL params for display
  const searchParams = useSearchParams();
  const loc = searchParams.get("location") ?? "";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";
  const guests = searchParams.get("guests") 
    // State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedPropertyType, setSelectedPropertyType] = useState<string[]>([])
  const [selectedAmenityType, setSelectedAmenityType] = useState<string[]>([])
  const [selectedRatingType, setSelectedRatingType] = useState<string[]>([])
  const [selectedBedNumber, setSelectedBedNumber] = useState<string[]>([])
  const [value, setValue] = useState<string | null>('');
  const [priceRange, setPriceRange] = useState<[number, number] >([100, 200000])
  const [debouncedRange, setDebouncedRange] = useState(priceRange);
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  const theme = useMantineTheme()
  const [drawerOpened, setDrawerOpened] = useState(false);
  const router = useRouter()

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRange(priceRange);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [priceRange]);


  useEffect(() => {
  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();

      if (selectedPropertyType?.length > 0) {
        selectedPropertyType.forEach((slug) => queryParams.append("hotel_type", slug));
      }
      if (selectedAmenityType?.length > 0) {
        selectedAmenityType.forEach((slug) => queryParams.append("amenity_type", slug));
      }
      if (debouncedRange) {
        queryParams.set("price_min", debouncedRange[0].toString());
        queryParams.set("price_max", debouncedRange[1].toString());
      }
      if (selectedRatingType?.length > 0) {
        selectedRatingType.forEach((slug) => queryParams.append("rating", slug));
      }
      if (selectedBedNumber?.length > 0) {
        selectedBedNumber.forEach((slug) => queryParams.append("bed_count", slug));
      }
      if (value) {
        queryParams.set("city", value);
      }
       queryParams.set("location", loc);
      queryParams.set("checkIn", checkIn);
      queryParams.set("checkOut", checkOut);
      queryParams.set("guests", guests ?? "" );
  console.log("search params", loc, checkIn,checkOut, guests)

      const response = await axiosClient.get(`/hotel/list/?${queryParams}`);
      const fetchedHotels: Hotel[] = response.data?.result || [];
      setHotels(fetchedHotels);
    } catch (err: any) {
      console.error("Error fetching hotels:", err);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };
    fetchHotels();
}, [
  selectedPropertyType,
  selectedAmenityType,
  debouncedRange,
  selectedRatingType,
  value,
  selectedBedNumber,
  loc,
  checkIn,
  checkOut,
  guests
]);

  // === PAGINATION ===
  const perPage = 8;
  const totalPages = Math.ceil(hotels.length / perPage);
  const pageItems = hotels.slice((activePage - 1) * perPage, activePage * perPage);

  // === TOGGLE FAVORITE ===
  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Clear Filters
  const clearAllFilters = () => {
  setSelectedPropertyType([]);
  setSelectedAmenityType([]);
  setSelectedRatingType([]);
  setSelectedBedNumber([]);
  setPriceRange([100, 200000]);
  setValue(null);
  router.replace("/hotels/search")
  };

  // Property Type Change Filter
    const handlePropertyTypeChange = (propertyvalue: string, checked: boolean) => {
        if (checked) {
            setSelectedPropertyType([...selectedPropertyType, propertyvalue ])
        } else {
            setSelectedPropertyType(selectedPropertyType.filter((cat) => cat !== propertyvalue))
        }
    }

    // Property Type Change Filter
    const handleAmenityTypeChange = (amenity: string, checked: boolean) => {
        if (checked) {
            setSelectedAmenityType([...selectedAmenityType, amenity ])
        } else {
            setSelectedAmenityType(selectedAmenityType.filter((cat) => cat !== amenity))
        }
    }

    //Property rating filter
   const handleRatingChange = (rating: string, checked: boolean) => {
        if (checked) {
            setSelectedRatingType([...selectedRatingType, rating ])
        } else {
            setSelectedRatingType(selectedRatingType.filter((cat) => cat !== rating))
        }
    }

     //Bed number filter
   const handleBedNumberChange = (bedNumber: string, checked: boolean) => {
        if (checked) {
            setSelectedBedNumber([...selectedBedNumber, bedNumber ])
        } else {
            setSelectedBedNumber(selectedBedNumber.filter((cat) => cat !== bedNumber))
        }
    }

  

  // === ERROR STATE ===
  if (error) {
    return (
      <Layout  hideBreadCrumbs>
        <Header />
        <Container size="xl" className="py-10">
          <Alert  icon={<IconAlertCircle size={16} />} title="Error" color="red" radius="md">
            {error}
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout  hideBreadCrumbs>
     <Box mb={20} style={{ position: "relative",zIndex:10, }} >

      <Header  />
     </Box>
      <Container size="xl" className="py-6">
        {/* RESULTS HEADER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Title order={2} mb="xs" mt="xl">
            {hotels.length} stay{hotels.length !== 1 ? "s" : ""} in {loc}
          </Title>
          <Group spacing="md" mb="xl" align="center">
            <Group spacing="md">
              <Text size="sm">Check-in: {checkIn}</Text>
              <Text size="sm">Check-out: {checkOut}</Text>
              <Text size="sm">
                {guests} Guest{Number(guests) > 1 ? "s" : ""}
              </Text>
            </Group>
            
           {hotels.length > 0 && !isSmallScreen && (
            <Switch
              size="lg"
              onLabel="Grid"
              offLabel="List"
              ml="auto"
              checked={isGridView}
              onChange={(e: any) => setIsGridView(e.currentTarget.checked)}
            />
          )}
           
          </Group>
        </motion.div>

        <Grid gutter="lg">
<Grid.Col span={12} md={3}>
  {/* Desktop Filter */}
  <Box className="hidden lg:block">
    <FilterSidebar
      priceRange={priceRange}
      setPriceRange={setPriceRange}
      selectedPropertyType={selectedPropertyType}
      handlePropertyTypeChange={handlePropertyTypeChange}
      selectedRatingType={selectedRatingType}
      handleRatingChange={handleRatingChange}
      selectedBedNumber={selectedBedNumber}
      handleBedNumberChange={handleBedNumberChange}
      selectedAmenityType={selectedAmenityType}
      handleAmenityTypeChange={handleAmenityTypeChange}
      onClearFilters={clearAllFilters}
    />
  </Box>

  {/* Mobile Filter Button */}
  <Box className="lg:hidden">
  
 <Button
      fullWidth
      onClick={() => setDrawerOpened(true)}
      variant="outline"
      size="md"
      className=" w-fit"
    >
      <Text className="mr-2">
      <FiFilter />

      </Text>

       <Text>
      Filter

      </Text>
    </Button>
      
   

    {/* Mobile Drawer */}
    <Drawer
      opened={drawerOpened}
      onClose={() => setDrawerOpened(false)}
      padding="xl"
      size="md"
      position="bottom"
      styles={{
        title: { width: "100%" },
        header: { borderBottom: `1px solid ${theme.colors.gray[3]}` },
      }}
    >
      <FilterSidebar
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedPropertyType={selectedPropertyType}
        handlePropertyTypeChange={handlePropertyTypeChange}
        selectedRatingType={selectedRatingType}
        handleRatingChange={handleRatingChange}
        selectedBedNumber={selectedBedNumber}
        handleBedNumberChange={handleBedNumberChange}
        selectedAmenityType={selectedAmenityType}
        handleAmenityTypeChange={handleAmenityTypeChange}
        onClearFilters={() => {
          clearAllFilters();
          setDrawerOpened(false);
        }}
      />
      <Group  mt="xl"  className="flex justify-end items-end">
        <Button onClick={() => setDrawerOpened(false)} variant="outline">
          Close
        </Button>
       
      </Group>
    </Drawer>
  </Box>
</Grid.Col>

                            {/* HOTEL LIST */}
                            <Grid.Col span={12} md={9}>
                            {loading ? (


                          // === LOADING SKELETON SECTION ===
                          isGridView ? (
                            // === GRID VIEW SKELETON ===
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
                              {[...Array(6)].map((_, i) => (
                                <div
                                  key={i}
                                  className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden animate-pulse"
                                >
                                  <div className="w-full h-40 bg-gray-200" /> 
                                  <div className="p-4 space-y-3">
                                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    <div className="h-3 bg-gray-200 rounded w-full" />
                                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                  </div>
                                </div>
                              ))}
                            </div>
  ) : (
    // === LIST VIEW SKELETON ===
    <div className="space-y-6 py-10">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden flex flex-col md:flex-row animate-pulse"
        >
          <div className="w-full md:w-60 h-48 bg-gray-200" />

          {/* Content placeholder */}
          <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-4/6 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/6" />
            </div>

            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
) : pageItems.length === 0 ? (
  // When no hotels are found
  <div className="p-6 rounded-md border border-gray-200 shadow-sm text-center">
    <Text c="dimmed">No hotels available. Try re-adjusting your filters.</Text>
  </div>
) : (
  // When hotels are available
  <Text
    className={`${
      isGridView
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-6 max-h-52"
    }`}
  > 



    {pageItems.map((hotel) => (
      <motion.div
        key={hotel.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Text className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden p-4">
          <Text
            className={`${
              isGridView ? "flex flex-col" : "flex flex-col md:flex-row"
            }`}
          >
            {/* === IMAGE SECTION === */}
            <div
              className={`relative group ${
                isGridView ? "w-full" : "w-full md:w-60"
              }`}
            >
              <Image
                src={hotel.images[0] || "/placeholder.svg"}
                alt={hotel.name}
                width={300}
                height={300}
                 onClick={() =>
                router.push(`/hotels/${hotel.slug}`)
                    }
                className={`cursor-pointer ${ 
                  isGridView
                    ? "w-full h-56 object-cover"
                    : "w-full h-48 md:h-56 object-cover rounded-xl" // height
                }`}
              />
              <Button
                onClick={() => toggleFavorite(hotel.id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform z-10"
              >
                <Heart
                  size={20}
                  className={`${
                    favorites.has(hotel.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600"
                  }`}
                />
              </Button>
            </div>

            {/* === DETAILS SECTION === */}
            <div
              className={`flex-1 p-5 flex flex-col justify-between ${
                isGridView ? "" : "md:p-6"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div
                      className={`flex items-center gap-4 mb-1 ${
                        isGridView && `h-12`
                      }`}
                    >
                      <h2
                        className={` cursor-pointer ${ 
                          isGridView
                            ? "font-semibold md:text-lg text-xl line-clamp-2"
                            : "font-semibold text-lg lg:text-xl"
                        }`}  onClick={() =>
                router.push(`/hotels/${hotel.slug}`)
                    }
                    style={{ color: theme.colors.brand[5] }}
                      >
                        {hotel.name}
                      </h2>
                      <div>
                        <Rating
                          defaultValue={hotel.rating || 5}
                          color="#ffb700"
                          readOnly
                        />
                      </div>
                    </div>

                    <div
                      className={`${
                        isGridView ? "flex gap-3 mb-1" : "hidden"
                      }`}
                    >
                      <div className="block bg-[#003b95] text-white text-sm font-medium px-1 py-0 rounded" style={{ backgroundColor: theme.colors.brand[7] }}
>
                        {hotel.rating || "0"}
                      </div>
                      <div className="mr-2 flex items-center gap-2">
                        <div className="font-semibold">Review Score</div>
                        <div className="text-xs">
                          {hotel.reviews ? hotel.reviews : "456 reviews"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 text-sm  items-center underline" style={{ color: theme.colors.brand[5] }}>
                      <span className="text-xs">{hotel.city}</span>
                      <span className="text-xs">Show on Map</span>
                    </div>
                {isGridView && (
                  <div className="">
                    <div className="line-clamp-3 text-gray-600 text-xs mt-2">
                      {hotel.description}
                    </div>
                  </div>
                )}                  </div>

                  <div
                    className={`${
                      isGridView ? "hidden" : "flex justify-end items-center"
                    }`}
                  >
                    <div className="mr-2">
                      <div className="font-semibold">Review Score</div>
                      <div className="text-xs">
                        {hotel.reviews ? hotel.reviews : "456 reviews"}
                      </div>
                    </div>
                    <div className="block text-white text-sm font-medium px-2 py-1 rounded"
                    style={{ backgroundColor: theme.colors.brand[7] }}
                    >
                      {hotel.rating || "0"}
                    </div>
                  </div>
                </div>

                {!isGridView && (
                  <div className="">
                    <div className="line-clamp-3 text-gray-600 text-xs mb-3">
                      {hotel.description}
                    </div>
                  </div>
                )}

                <div
                  className={`${
                    isGridView
                      ? "hidden"
                      : "flex flex-col justify-end items-end"
                  }`}
                >
                  <div>
                    <p
                      className={`${
                        isGridView
                          ? "font-medium text-sm text-black"
                          : "font-medium text-xl text-black flex justify-end items-end"
                      }`}
                    >
                      NPR {hotel.price?.toLocaleString() || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Additional charges may apply
                    </p>
                  </div>
                  <Button
                  onClick={()=>router.push(`/hotels/${hotel.slug}`)}                    
                  className={`${
                      isGridView
                        ? "hidden"
                        : "bg-[#006ce4] w-fit hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition"
                    }`}
                  >
                    View Property
                    <IoIosArrowForward />
                  </Button>
                </div>
              </div>

              <div
                className={`${
                  isGridView ? "flex justify-end items-end mt-5" : "hidden"
                }`}
              >
                <div>
                  <p
                    className={`${
                      isGridView
                        ? "font-medium text-xl text-black flex justify-end items-end"
                        : "font-medium text-xl text-black"
                    }`}
                  >
                    NPR {hotel.price?.toLocaleString() || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Additional charges may apply
                  </p>
                </div>
                <button
                  className={`${
                    isGridView
                      ? "hidden"
                      : "bg-[#006ce4] hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition"
                  }`}
                >
                  View Property
                  <IoIosArrowForward />
                </button>
              </div>
            </div>
          </Text>
        </Text>
      </motion.div>
    ))}
  </Text>
)}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <Pagination
                  total={totalPages}
                  value={activePage}
                  onChange={setActivePage}
                  color="blue"
                  withEdges
                />
              </div>
            )}
          </Grid.Col>
        </Grid>
      </Container>
    </Layout>
  );
}