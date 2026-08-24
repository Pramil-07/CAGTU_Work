import { Button, Flex, LoadingOverlay } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

import HomaaleLoader from "@/components/common/HomaaleLoader";
import { toast } from "@/components/common/Toast";
import urls from "@/constants/urls";

import { axiosClient } from "./axiosClient";
import { handleChatRoomCreation } from "./chat/handleChatRoomCreation";
import { handleUserCreation } from "./chat/handleUserCreate";

export enum APPROVAL_STATUS {
    pending = "pending",
    approved = "approved",
    rejected = "rejected",
    closed = "closed",
    cancelled = "cancelled",
}

type Props = {
    enitity_id: string;
    status: string;
    id: number;
    is_negotiable: boolean;
    serviceCreator: string;
    bookingCreator: string;
    is_accepted: boolean;
    is_range: boolean;
};

export const RenderStatusButtons = (props: Props) => {
    const {
        enitity_id,
        status,
        id,
        is_negotiable,
        serviceCreator,
        bookingCreator,
        is_accepted,
        is_range,
    } = props;

    const combinedId =
        bookingCreator > serviceCreator
            ? bookingCreator + "_" + serviceCreator
            : serviceCreator + "_" + bookingCreator;

    const router = useRouter();
    const queryClient = useQueryClient();

    const sendBookApproval = useMutation<any, Error, number>((id) =>
        axiosClient.post(urls.booking.approval, {
            booking: id,
        })
    );

    const handleAcceptClick = () => {
        sendBookApproval.mutate(id, {
            onSuccess: async () => {
                await handleUserCreation({
                    userID: serviceCreator,
                    taskerID: bookingCreator,
                });
                await handleChatRoomCreation({
                    userID: serviceCreator,
                    taskerID: bookingCreator,
                });
                queryClient.invalidateQueries(["get-applicants", enitity_id]);
                queryClient.invalidateQueries(["booking-detail", id]);
                toast.success("Booking Approved");
            },
            onError: (e: any) => {
                toast.error(e.response.data.booking.message);
            },
        });
    };

    const sendBookNegotiate = useMutation<any, Error, number>((id) =>
        axiosClient.post(`${urls.booking.accept}${id}/`)
    );

    const handleNegotiateClick = async () => {
        if (is_accepted) {
            router.push(`/chat/${combinedId}`);
            await handleUserCreation({
                userID: serviceCreator,
                taskerID: bookingCreator,
            });
            await handleChatRoomCreation({
                userID: serviceCreator,
                taskerID: bookingCreator,
            });
        } else
            sendBookNegotiate.mutate(id, {
                onSuccess: async () => {
                    queryClient.invalidateQueries([
                        "get-applicants",
                        enitity_id,
                    ]);
                    await handleUserCreation({
                        userID: serviceCreator,
                        taskerID: bookingCreator,
                    });
                    await handleChatRoomCreation({
                        userID: serviceCreator,
                        taskerID: bookingCreator,
                    });

                    queryClient.invalidateQueries(["booking-detail", id]);
                    router.push(`/chat/${combinedId}`);
                    toast.success("You can now negotiate the price via Chat");
                },
                onError: (e: any) => {
                    toast.error(e.response.data.booking.message);
                },
            });
    };

    const statusButton = () => {
        switch (status) {
            case APPROVAL_STATUS?.pending:
                return (
                    <>
                        <LoadingOverlay
                            loader={<HomaaleLoader />}
                            visible={sendBookApproval.isLoading}
                            sx={{
                                position: "fixed",
                                inset: 0,
                                height: "100vh",
                            }}
                        />
                        <Flex justify={"flex-start"} gap={15}>
                            <Button
                                onClick={handleNegotiateClick}
                                disabled={
                                    sendBookApproval.isLoading ||
                                    (!is_negotiable && !is_range)
                                }
                                loading={sendBookApproval.isLoading}
                                variant={"outline"}
                            >
                                Negotiate
                            </Button>
                            <Button
                                onClick={handleAcceptClick}
                                disabled={sendBookApproval.isLoading}
                                loading={sendBookApproval.isLoading}
                            >
                                Accept
                            </Button>
                        </Flex>
                    </>
                );
            case APPROVAL_STATUS?.approved:
                return (
                    <Button
                        color={"green"}
                        disabled={sendBookApproval.isLoading}
                        loading={sendBookApproval.isLoading}
                    >
                        Approved
                    </Button>
                );
            case APPROVAL_STATUS?.cancelled:
                return (
                    <Button
                        color={"red"}
                        disabled={sendBookApproval.isLoading}
                        loading={sendBookApproval.isLoading}
                    >
                        Cancelled
                    </Button>
                );
            case APPROVAL_STATUS?.closed:
                return (
                    <Button
                        color={"red"}
                        disabled={sendBookApproval.isLoading}
                        loading={sendBookApproval.isLoading}
                    >
                        closed
                    </Button>
                );
            case APPROVAL_STATUS?.rejected:
                return (
                    <Button
                        color={"red"}
                        disabled={sendBookApproval.isLoading}
                        loading={sendBookApproval.isLoading}
                    >
                        rejected
                    </Button>
                );
        }
    };

    return <>{statusButton()}</>;
};

export default RenderStatusButtons;
