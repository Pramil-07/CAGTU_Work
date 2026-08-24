import Layout from "@/components/Layout/Layout";
import ProfilePage from "@/components/merchant/ProfilePage/ProfilePage";
import React, {useEffect, useState} from "react";
import {isLoggedIn} from "@/utils/helpers";
import FrontPageMerchant from "@/components/merchant/ProfilePage/FrontPageMerchant";
import {useRouter} from "next/router";
import HomaaleLoader from "@/components/common/HomaaleLoader";

interface ProfilePageProps {
    events?: any;
}

const Merchant: React.FC<ProfilePageProps> = ({events}) => {

    const router = useRouter();
    const {id} = router.query;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timeout);
    })
    // if (isLoading) {
    //     return (
    //         <Layout hideBreadCrumbs={true} >
    //             <HomaaleLoader/>
    //         </Layout>
    //     );
    // }


    return (
        <Layout currentTitle={"Merchant Profile"} hideBreadCrumbs={true}>

            {isLoggedIn()  ? (
                <ProfilePage merchantId={id} events={events}/>

            ) : (
                // <FrontPageMerchant/>
                <ProfilePage merchantId={id} events={events}/>
            )}
        </Layout>
    );
};

export default Merchant;
