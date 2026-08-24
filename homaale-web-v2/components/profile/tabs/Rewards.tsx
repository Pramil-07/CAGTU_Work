import { Box, Grid, Notification } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useEffect } from "react";
import { IconCheck } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";

import Empty from "@/components/common/Empty";
import OfferCard from "@/components/offer/OfferCard";
import urls from "@/constants/urls";
import type { OffersProps } from "@/types/OfferProps";
import { axiosClient } from "@/utils/axiosClient";
import { useUserStatus } from "@/hooks/useUserStatus";
import { toast } from "@/components/common/Toast";

const Rewards = () => {
    const { checkStatus } = useUserStatus();
    const isKycVerified1 = checkStatus("kyc");

    const { data: rewardlistingdata } = useQuery(["offers_data"], async () => {
        try {
            const { data } = await axiosClient.get<OffersProps>(
                `${urls.offer.rewardlisting}`
            );
            return data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log("🚀 ~ file: Rewards.tsx:22 ~ error:", error);
            }
            throw new Error("Something went wrong");
        }
    });

 

    console.log("first", rewardlistingdata);

    return (
        <Box mt={30} w={"98%"}>
        
            <Grid gutter={0}>
                {rewardlistingdata && rewardlistingdata?.result?.length > 0 ? (
                    rewardlistingdata.result
                        .filter((item) => item?.offer_type === "promo_code")
                        .map((item, index) => (
                            <Grid.Col key={index} lg={4} xs={6}>
                                <OfferCard offers={item} varient="promo" />
                            </Grid.Col>
                        ))
                ) : (
                    <Empty title="NO REWARDS AVAILABLE !!!" description="" />
                )}
            </Grid>
        </Box>
    );
};

export default Rewards;