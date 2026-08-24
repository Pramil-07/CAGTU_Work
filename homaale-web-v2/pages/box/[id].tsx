import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

import { BookingDetail } from "@/components/booking/BookingDetail";
import NotFound from "@/components/common/NotFound";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import type { BookingProps } from "@/types/booking/BookingProps";
import { axiosClient } from "@/utils/axiosClient";

const BoxDetailPage = () => {
    const router = useRouter();
    const { data, isLoading } = useQuery(
        ["booking-detail", router.query.id],
        () => {
            return axiosClient.get<BookingProps["result"][0]>(
                `${urls.booking.initial}${router.query.id}/`
            );
        }
    );
    return (
        <>
            {!data && !isLoading && (
                <Layout>
                    <NotFound />
                </Layout>
            )}
            {data && (
                <Layout
                    heading="Box Details"
                    breadCrumbsItems={[{ name: "box", href: "/box" }]}
                    currentTitle={data?.data?.entity_service?.title ?? ""}
                >
                    <BookingDetail boxDetail={data?.data} />
                </Layout>
            )}
        </>
    );
};

export default BoxDetailPage;
