import React, {useEffect, useState} from "react";
import Header from "@/components/merchant/ProfilePage/Header";
import AvailableServices from "@/components/merchant/ProfilePage/AvailableServices";
import SpecialOffers from "@/components/merchant/ProfilePage/SpecialOffers";
import AvailablePackages from "@/components/merchant/ProfilePage/AvailablePackages";
import AvailableSlots from "@/components/merchant/ProfilePage/AvailableSlots";
import Reviews from "@/components/merchant/ProfilePage/Reviews";
import 'tailwindcss/tailwind.css';
import About from "@/components/merchant/ProfilePage/About";
import {
    ActionIcon,
    Box,
    useMantineColorScheme,
    useMantineTheme,
    Container, Flex, Grid, Image, Title, Text, Button
} from "@mantine/core";
import {useDark} from "@/utils/helpers";
import {useMediaQuery} from "@mantine/hooks";
import {IconArrowRight, IconMoon, IconSun} from "@tabler/icons-react";
import MerchantTask from "@/components/merchant/ProfilePage/MerchantTask";
import ProfileInfo from "@/components/merchant/ProfilePage/ProfileInfo";
import MembersSection from "@/components/merchant/ProfilePage/Members";
import {axiosClient} from "@/utils/axiosClient";
import {useProfile} from "@/hooks/useProfile";
import {toast} from "@/components/common/Toast";
import {InfoBanner} from "@/components/common/InfoBanner";
import {useRouter} from "next/router";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {TrustCard} from "@/components/common/TrustCard";
import {useLandingStyles} from "@/styles/pages/LandingStyles";
import {FaArrowRight} from "react-icons/fa";
import {openConfirmModal} from "@/components/common/form/ConfirmModal";
import MerchantList from "@/pages/merchants";
import ProductList from "./MerchantProduct";
import MerchantShop from "./MerchantShop";
import ProductAnalytics from "@/components/merchant/ProfilePage/ProductAnalytics";
import {USERSTATUS, useUserStatus} from "@/hooks/useUserStatus";
import Hotels from "@/components/merchant/ProfilePage/Hotels";

interface ProfilePageProps {
    events: { id: string; date: string; title: string }[];
}

interface AboutProps {
    merchantId: any;
    hasPermission: boolean; // Not optional, must be boolean
    // ... other props
}

export interface Profile {
    is_merchant: boolean;
    is_active: boolean;
    merchant_data: {
        id: string;
        is_premium?: boolean;
        full_name: string;
        logo: string;
        [key: string]: any;
    };
    name: string;
    address: string;
    phone: string;
    email: string;
    serviceArea: string;
    rating?: any;
    reviews?: number;
    photos?: string;
    profile_data: any;
    task_data: any;
    is_kyc_verified?: boolean;
    service?: any;
}

const ProfilePage = ({merchantId, events}: { merchantId: any, events: any }) => {
    const theme = useMantineTheme();
    const dark = useDark();
    const {classes} = useLandingStyles();
    const [data, setData] = useState<Profile | null>(null);
    const smallScreen = useMediaQuery("(max-width:768px)");
    const screen150 = useMediaQuery('(max-width: 1400px) and (min-width: 768px)');
    const {toggleColorScheme} = useMantineColorScheme();
    const router = useRouter();
    const {checkStatus} = useUserStatus();
    const {data: profileData} = useProfile();
    const Profileid = profileData?.user?.id;
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);

    // Determine if we're viewing our own profile or someone else's
    const isOwnProfile = !merchantId || merchantId === Profileid;
    const dynamicMerchantId = merchantId || Profileid;
    const name = data?.merchant_data?.full_name;
    const image = data?.merchant_data?.logo;

    // Check if user is a valid merchant
    const isMerchant = Boolean(data?.is_merchant); // Ensure boolean
    const merchantData = data?.merchant_data;
    const hasPermission = Boolean(isOwnProfile && isMerchant); // Ensure boolean

    useEffect(() => {
        if (!dynamicMerchantId) return;

        const fetchApiData = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/merchant/${dynamicMerchantId}`);
                if (response.data) {
                    setData(response.data);
                    setIsPremium(response.data?.merchant_data?.is_premium || false);
                }
            } catch (error: any) {
                // console.error("Error fetching data:", error);
                toast.error(error.response?.data?.message || "Failed to load merchant data");
            } finally {
                setLoading(false);
            }
        };

        fetchApiData();
    }, [dynamicMerchantId]);

    const handleClickImage = () => {
        openConfirmModal({
            title: "Want to become a Premium Merchant?",
            message: "Standard charges may apply to become a Premium Merchant",
            onConfirm: async () => {
                try {
                    const response = await axiosClient.post(`merchant/is_premium/`);
                    toast.success("Merchant upgrade Request Applied successfully!");
                } catch (error: any) {
                    toast.error(error.response?.data?.message || "Something went wrong");
                }
            },
        });
    };

    const handleRegisterAsMerchant = () => {
        const isKycVerified = checkStatus(USERSTATUS?.kyc);
        if (isKycVerified) {
            router.push("/merchant/profile/registration");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <HomaaleLoader/>
            </div>
        );
    }

    if (!isMerchant) {
        return (
            <section className="post-process-section" id="post-process-section">
                <Container size={1568}>
                    <InfoBanner
                        SubHeader={isOwnProfile ? "Complete Your Merchant Registration" : "This User is not a Merchant"}
                        Header={"Register as merchant and make the process of discovering abilities simpler."}
                        description={
                            "We streamline the job search and application procedure for you. Anyone in the world can post a task or a service and locate the finest candidate to complete it."
                        }
                        ImageSrc={"/images/infoBanner/banner1.svg"}
                        list={[
                            "Describe what you need to get done or what service you provide",
                            "Set your price and location",
                            "Receive quotes or negotiate your price",
                            "Earn reward points",
                        ]}
                        bottomComp={
                            isOwnProfile && (
                                <Button
                                    size="md"
                                    color="dark"
                                    onClick={handleRegisterAsMerchant}
                                    rightIcon={<IconArrowRight size={20}/>}
                                >
                                    Merchant Registration
                                </Button>
                            )
                        }
                        has_background
                    />
                </Container>
            </section>
        );
    }
    // console.log("merchantid", dynamicMerchantId);

    return (
        <Box
            style={{
                display: "flex",
                padding: "10px",
                width: "100%",
                background: dark ? theme.colors.dark[8] : "#fff",
            }}
            className="flex flex-col pr-10 pt-8 pb-36 max-md:px-5 max-md:pb-24 gap-8"
        >
            {/* Main Content */}
            <div className="flex flex-wrap gap-5 max-md:flex-col max-md:gap-y-8">
                {/* Left Section */}
                <Box className="flex flex-col grow shrink w-[67%] max-md:w-full">
                    <Header merchantId={dynamicMerchantId}
                            name={name}
                            image={image}
                    />
                    <div
                        style={{width: "100%"}}
                        className="flex flex-col justify-center mt-8 shadow-sm"
                    >
                        <div
                            style={{
                                background: dark ? theme.colors.dark[6] : "#fff",
                                borderRadius: "10px",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                                border: dark ? "1px solid grey" : "1px solid lightgray"
                            }}
                            className="flex flex-wrap gap-10"
                        >
                            <ProfileInfo data={data} hasPermission={hasPermission} dynamicMerchantId={dynamicMerchantId}/>
                        </div>
                    </div>
                </Box>

                <Box style={{
                    display: "flex",
                    width: "100%",
                    gap: "30px",
                    flexDirection: screen150 ? "column-reverse" : smallScreen ? "column-reverse" : "row",
                }} className="flex max-md:w-full">
                    <Box style={{width: smallScreen ? "100%" : screen150 ? "100%" : "60%"}}
                         className="flex flex-col max-md:ml-0 max-md:w-[100%]">
                        <About merchantId={dynamicMerchantId} hasPermission={hasPermission}/>
                        <AvailableServices merchantId={dynamicMerchantId}/>

                        {isPremium && <MembersSection merchantId={dynamicMerchantId}/>}

                        <MerchantTask
                            activeId={1}
                            merchantId={dynamicMerchantId}
                            ownerFilter="some filter"
                            query="example query"
                            is_requested={true}
                            hasPermission={hasPermission}
                        />

                        {isPremium && (
                            <>
                                <SpecialOffers merchantId={dynamicMerchantId} hasPermission={hasPermission}/>
                                <AvailablePackages merchantId={dynamicMerchantId} hasPermission={hasPermission}/>
                                {/*<ProductAnalytics/>*/}
                                <ProductList id={dynamicMerchantId} hasPermission={hasPermission}/>
                                <Hotels id={dynamicMerchantId} hasPermission={hasPermission}/>
                                <MerchantShop id={dynamicMerchantId} hasPermission={hasPermission}/>
                            </>
                        )}

                        <Reviews merchantId={dynamicMerchantId} is_purchased={true}/>
                    </Box>

                    {/* Sidebar */}
                    <div style={{width: smallScreen ? "100%" : screen150 ? "100%" : "40%"}} className="flex">
                        <div
                            className='flex flex-wrap border-2 border-red-500'
                            style={{
                                background: dark ? theme.colors.dark[6] : "#fff",
                                borderRadius: "20px",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                                border: dark ? "1px solid  grey" : "1px solid lightgray",
                                width: "100%"
                            }}
                        >
                            {isPremium ? (
                                <AvailableSlots merchantId={dynamicMerchantId} hasPermission={hasPermission}/>
                            ) : (
                                <section className={classes.trust} id="trust-section">
                                    <Container size="xl" className="my-4">
                                        <Box maw={1200} mx="auto" px="md" py="xl">
                                            <Title order={1} className="text-center text-orange-400" size="h2" mb="md">
                                                Unlock Exclusive Benefits with <br className="hidden sm:block"/>
                                                Premium Merchant!
                                            </Title>

                                            <Flex
                                                direction={{base: "column", sm: "row"}}
                                                align={{base: "center", sm: "center"}}
                                                justify="space-between"
                                                gap="xl"
                                            >
                                                <Box maw={535}>
                                                    <Text size="lg" color={dark ? "gray.3" : "gray.7"}>
                                                        Take your business to the next level with our{" "}
                                                        <Text span fw={700} color={dark ? "gray.1" : "gray.9"}>
                                                            Premium Merchant
                                                        </Text>{" "}
                                                        plan and gain access to powerful tools designed to{" "}
                                                        <Text span fw={700} color={dark ? "gray.1" : "gray.9"}>
                                                            boost your success.
                                                        </Text>
                                                    </Text>
                                                </Box>

                                                <Flex direction="column" gap={50} align="center">
                                                    <Image
                                                        src="/merchant/merchant4.png"
                                                        alt="Premium Merchant"
                                                        w={120}
                                                        h={120}
                                                        radius="50%"
                                                        className="rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-sm cursor-pointer"
                                                        onClick={hasPermission ? handleClickImage : () => toast.error("Visit your account")}
                                                    />

                                                    <Button
                                                        variant="subtle"
                                                        mt="md"
                                                        color={dark ? "orange.6" : "orange.4"}
                                                        className="transition-all duration-300 ease-in-out hover:scale-105"
                                                        onClick={hasPermission ? handleClickImage : () => toast.error("Visit your account")}
                                                    >
                                                        Premium Feature <FaArrowRight/>
                                                    </Button>
                                                </Flex>
                                            </Flex>
                                        </Box>

                                        <Grid mb={80}>
                                            <Grid.Col md={6} sm={12} display="flex">
                                                <TrustCard
                                                    title="Special Offers & Packages"
                                                    image="/svgs/trustCard/trustCard1.svg"
                                                    description="Create exclusive deals and attract more customers with personalized promotions."
                                                    color="#FAF5FF"
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={6} sm={12} display="flex">
                                                <TrustCard
                                                    title="Manage Members & Staff"
                                                    image="/svgs/trustCard/trustCard3.svg"
                                                    description="Easily add and manage team members to streamline service delivery."
                                                    color="#FEF2F2"
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={0} sm={12} display="flex">
                                                <TrustCard
                                                    title="Service Slot Management"
                                                    image="/svgs/trustCard/trustCard2.svg"
                                                    description="Assign staff to specific time slots, ensuring seamless scheduling and optimized workflow."
                                                    color="#ECFDF5"
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    </Container>
                                </section>
                            )}
                            <hr/>
                        </div>
                    </div>
                </Box>
            </div>


        </Box>
    );
};

export default ProfilePage;
