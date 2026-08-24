import {useMantineTheme} from "@mantine/core";
import Layout from "@/components/Layout/Layout";
import {useMerchantStyles} from "@/styles/pages/MerchantStyles";
import ProfilePage from "@/components/merchant/ProfilePage/ProfilePage";
import React, {useEffect, useState} from "react";
import {isLoggedIn} from "@/utils/helpers";
import FrontPageMerchant from "@/components/merchant/ProfilePage/FrontPageMerchant";
import {axiosClient} from "@/utils/axiosClient";
import router, {useRouter} from "next/router";
import {useProfile} from "@/hooks/useProfile";
import HomaaleLoader from "@/components/common/HomaaleLoader";

interface ProfilePageProps {
    events?: any;
}

const Merchant: React.FC<ProfilePageProps> = ({events}) => {
    const {classes} = useMerchantStyles();
    const theme = useMantineTheme();
    const router = useRouter();
    const {id} = router.query;
    const {data: profileData, isLoading} = useProfile();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && profileData?.user?.id) {
            setUserId(profileData.user.id);
            // console.log("Profile ID from Merchant:", profileData.user.id);
        }
    }, [profileData, isLoading]);
    // console.log("user id ",userId)


    // console.log("merchant ID: test id ", id)
    // if(isLoading)
    // {
    //  return <Layout>
    //  <HomaaleLoader/>
    //  </Layout>
    // }


    return (
        <Layout currentTitle={"Merchant Profile"} hideBreadCrumbs={true}>
            {isLoggedIn() ? (
            <ProfilePage merchantId={id} events={events}/>

            ) : (
                // <FrontPageMerchant />
                <ProfilePage merchantId={id} events={events}/>
            )}
        </Layout>
    );
};

export default Merchant;



