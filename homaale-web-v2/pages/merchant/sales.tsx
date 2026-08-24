import SoldProducts from "@/components/merchant/ProfilePage/SoldProducts";
import Layout from "@/components/Layout/Layout";
import {isLoggedIn} from "@/utils/helpers";
import {useProfile} from "@/hooks/useProfile";

export default function SoldProductsPage() {

    const {data: profileData} = useProfile();
    const isPremium = profileData?.merchant_data?.[0]?.is_premium;

    // console.log("Is premium ",isPremium);

    return (
        <Layout currentTitle={"Sold Products"} hideBreadCrumbs={true}>
            {isLoggedIn() && isPremium &&(
                <SoldProducts/>
            )}
        </Layout>
    )
}
