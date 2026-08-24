import {useQuery} from "@tanstack/react-query";
import {useRouter} from "next/router";

import {BookingDetail} from "@/components/booking/BookingDetail";
import NotFound from "@/components/common/NotFound";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import type {TaskBookDetailProps} from "@/types/booking/TaskBookDetailProps";
import {axiosClient} from "@/utils/axiosClient";
import {useBookingDetail} from "@/hooks/useBookingDetail";

const BookingDetailPage = () => {
    const router = useRouter();
    const {id} = router.query;
    console.log("id", id);
    const {data, isLoading} = useBookingDetail(id as string)

    console.log("this booking details", data)
    return (
        <>
            {!data && !isLoading && (
                <Layout>
                    <NotFound/>
                </Layout>
            )}
            {data && (
                <Layout
                    heading="Booking Details"
                    breadCrumbsItems={[{name: "Task & Bookings", href: ""}, {name: "Bookings", href: "/bookings"}]}
                    currentTitle={data?.title ?? ""}
                >
                    <BookingDetail bookingDetail={data}/>
                </Layout>
            )}
        </>
    );
};

export default BookingDetailPage;
