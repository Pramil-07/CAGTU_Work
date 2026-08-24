import {useRouter} from "next/router";
import {SetStateAction, useEffect, useState} from "react";
import {Box, Button, Text, Title} from "@mantine/core";
import {BookingForm} from "@/components/booking/BookingForm";
import {BookingDataProps} from "@/types/booking/BookingDataProps";
import Layout from "@/components/Layout/Layout";
import Empty from "@/components/common/Empty";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import EntityProductDetails from "@/components/ProductCard/EntityProductDetail";

const BookingDetailsPage = () => {
    const router = useRouter();
    const [selectedDateTime, setSelectedDateTime] = useState({
        date: "",
        start: "",
        end: "",
    });

    const [bookingData, setBookingData] = useState<BookingDataProps | null>(null);
    // Populate selectedDateTime and bookingData when router is ready
    console.log("booking data", bookingData)
    useEffect(() => {
        if (router.isReady) {
            const {id, date, start, end, bookingData: bookingDataString} = router.query;
            setSelectedDateTime({
                date: (date as string) || "",
                start: (start as string) || "",
                end: (end as string) || "",
            });

            const parsedBookingData = bookingDataString
                ? (JSON.parse(bookingDataString as string) as BookingDataProps)
                : null;
            setBookingData(parsedBookingData);

        }
    }, [router.isReady, router.query]);

    const serviceId = router.query.id;

  // Guard: Redirect if selectedDateTime is incomplete
  if (!selectedDateTime.date || !selectedDateTime.start || !selectedDateTime.end) {
    console.log("Guard: Incomplete selectedDateTime", selectedDateTime);
    return (
      <Box p={20} mt={400} style={{justifySelf:"center", justifyItems:"flex-start" }}>
        {/* <Title order={3}>Error</Title>
        <Text>No booking details provided. Please select a time slot first.</Text>
        <Button onClick={() => router.push(`/services/${bookingData?.id|| "unknown"}`)} mt={10}>
          Go Back
        </Button> */}
        <HomaaleLoader/>
      </Box>
    );
  }

    // Guard: Wait for bookingData

  if (!bookingData) {
    console.log("Guard: Missing bookingData");
    return (
      <Box p={20}>
        {/* <Text>No booking data available.</Text> */}
      <Empty title={""} description={""}></Empty>
        {/* <Button onClick={() => router.push(`/services/${router.query.id || "unknown"}`)} mt={10}>
          Go Back
        </Button> */}
        <HomaaleLoader/>
      </Box>
    );
  }

    const handleBack = () => {
        router.push(`/services/${bookingData.entity_service}`);
    };

    console.log("Rendering BookingForm with:", {bookingData, selectedDateTime});

  return (
  <Layout heading="Book a Service" currentTitle={"Booking Form"} breadCrumbsItems={[{name:bookingData.title,href:`/services/${bookingData.entity_service}`}]}>
      <BookingForm
        is_editing={false}
        setOpened={() => {"g"}}
        prevStep={handleBack}
        bookingData={bookingData}
        selectedDateTime={selectedDateTime}
      />
    </Layout>
  );
};

export default BookingDetailsPage;
