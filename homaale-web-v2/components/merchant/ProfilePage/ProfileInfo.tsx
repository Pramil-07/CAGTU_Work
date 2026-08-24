import React, {useEffect, useState} from "react";
import {Anchor, Avatar, Box, Group, Stack, Text, Tooltip, useMantineTheme} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {MdVerified} from "react-icons/md";
import {useDark} from "@/utils/helpers";
// import {StarRating} from './Reviews';
import TaskStats from "@/components/merchant/ProfilePage/TaskStats";
import {Profile} from "@/components/merchant/ProfilePage/ProfilePage";
import {StarRating} from "@/components/merchant/ProfilePage/Reviews";
import Image from "next/image";
import {axiosClient} from "@/utils/axiosClient";
import {useUser} from "@/hooks/useUser";


const ProfileInfo = ({hasPermission, data , dynamicMerchantId}: { hasPermission: any, data: Profile | null, dynamicMerchantId: any }) => {
    // const [profile, setProfile] = useState<Profile >(data?);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const isZoomedIn = useMediaQuery("(max-width: 1200px)");
    const [rating, setRating] = useState<number>(4);
    // const [data , setdata] = useState< Profile | null>(null);
    const [loading , setLoading] = useState(false);
    const [isPremium , setIsPremium] = useState(false);
    const theme = useMantineTheme();
    const dark = useDark();


    // console.log("info", data);

    useEffect(() => {
        const fetchApiData = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/merchant/${dynamicMerchantId}`);
                if (response.data) {
                    // setData(response.data);
                    setIsPremium(response.data?.merchant_data?.is_premium || false);
                    // console.log("premium",response.data.merchant_data?.is_premium);
                }
            } catch (error: any) {
                console.error("Error fetching data:", error);

            } finally {
                setLoading(false);
            }
        };

        fetchApiData()
    }, [dynamicMerchantId])

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: isMobile || isZoomedIn ? "column" : "row",
                width: isMobile ? "90%" : "100%",
                maxWidth: "100%",
                backgroundColor: dark ? theme.colors.dark[6] : "#fff",
                justifyContent: "space-between",
                borderRadius: "12px",
                padding: "15px",
                gap: "10px",
                flexWrap: "nowrap",
                alignItems: isMobile || isZoomedIn ? "center" : "flex-start",

            }}
        >

            {/* Profile Section */}
            <Group align="center" spacing="md">
                <Avatar
                    src={data?.merchant_data?.logo}
                    alt={data?.name}
                    size={134}
                    radius="100px"
                />

                <div className="profile-info mt-5">
                    <div className="rating-section">
                        <StarRating rating={Math.round(data?.rating?.total_rating) / (data?.rating?.total_review) || 0}
                                    setRating={setRating} size={24}/>
                        <span className="underline underline-offset-3 flex justify-center "
                              style={{color: "#868E96"}}>{data?.rating?.total_review} Reviews</span>
                    </div>
                </div>

                {/*{profile.rating !== undefined && profile.reviews !== undefined && (*/}
                {/*    <Stack spacing={4} align="center">*/}
                {/*        <Text size="xl" weight={700}>*/}
                {/*            {"★".repeat(profile.rating) || "review here"}*/}
                {/*            {"☆".repeat(5 - profile.rating) || "rating here"}*/}
                {/*        </Text>*/}
                {/*        <Anchor href="#reviews" size="sm" color="gray">*/}
                {/*            {profile.reviews || "reviews"} reviews*/}
                {/*        </Anchor>*/}
                {/*    </Stack>*/}
                {/*)}*/}
            </Group>

            {/* Profile Details */}
            <div>
                <Stack
                    spacing="sm"
                    sx={{
                        flex: 1,
                        padding: "0 0px",
                        maxWidth: isMobile || isZoomedIn ? "100%" : "200vh", // Adjust width for responsiveness
                    }}
                >

                    <Text className={`flex items-center mt-3.5 mb-8 text-gray-800 gap-x-2 font-medium text-lg ${
                        dark ? "text-white" : "text-black"
                    } whitespace-nowrap`}>

                        {data?.merchant_data?.full_name}
                        <Tooltip
                            label={isPremium ? 'Premium Merchant' : 'Standard Merchant'}
                            withArrow
                        >
                            <Image
                                src={isPremium ? '/svgs/PremiumBadge.svg' : '/svgs/StandardBadge.svg'}
                                height={20}
                                width={20}
                                alt={isPremium ? 'Premium Badge' : 'Standard Badge'}
                            />
                        </Tooltip>
                    </Text>
                    {/*<Text className={`flex items-center mt-5 text-gray-800 font-medium text-sm ${*/}
                    {/*    dark ? "text-white" : "text-black"*/}
                    {/*}`}>*/}
                    {/*/!*<span className="bg-teal-500 text-white mr-2 px-2 py-1 rounded-lg text-sm">*!/*/}
                    {/*  /!*Reseller*!/*/}
                    {/*/!*</span>*!/*/}
                    {/*    MERCHANT{" "}*/}
                    {/*    <MdVerified color="#0693E3" className="ml-1"/>*/}

                    {/*</Text>*/}

                    <Text size="sm" color="#868E96" className="flex items-center gap-x-1">
                        <Tooltip label="Address" withArrow>

                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M16.6562 8.03906C16.9297 8.3125 16.9479 8.6224 16.7109 8.96875C16.4375 9.24219 16.1367 9.26042 15.8086 9.02344L15.125 8.47656V13.5625C15.1068 14.1823 14.8971 14.7018 14.4961 15.1211C14.0768 15.5221 13.5573 15.7318 12.9375 15.75H5.0625C4.44271 15.7318 3.92318 15.5221 3.50391 15.1211C3.10286 14.7018 2.89323 14.1823 2.875 13.5625V8.47656L2.21875 9.02344C1.8724 9.26042 1.5625 9.24219 1.28906 8.96875C1.05208 8.6224 1.07031 8.3125 1.34375 8.03906L8.58984 1.91406C8.86328 1.69531 9.14583 1.69531 9.4375 1.91406L16.6562 8.03906ZM5.0625 14.4375H6.375V10.2812C6.375 9.97135 6.48438 9.71615 6.70312 9.51562C6.90365 9.29688 7.15885 9.1875 7.46875 9.1875H10.5312C10.8411 9.1875 11.0964 9.29688 11.2969 9.51562C11.5156 9.71615 11.625 9.97135 11.625 10.2812V14.4375H12.9375C13.1927 14.4375 13.4023 14.3555 13.5664 14.1914C13.7305 14.0273 13.8125 13.8177 13.8125 13.5625V7.35547L9 3.25391L4.1875 7.35547V13.5625C4.1875 13.8177 4.26953 14.0273 4.43359 14.1914C4.59766 14.3555 4.80729 14.4375 5.0625 14.4375ZM7.6875 14.4375H10.3125V10.5H7.6875V14.4375Z"
                                fill="#495057"/>
                        </svg>
                        </Tooltip>

                        {data?.merchant_data?.address_line1 || "Address not provided"}
                    </Text>
                    <Anchor href={`tel:${data?.phone}`} size="sm" color="#868E96" className="flex items-center gap-x-1">
                        <Tooltip label="Phone" withArrow>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M15.125 10.5L12.4453 9.35156C12.1536 9.22396 11.8529 9.19661 11.543 9.26953C11.2331 9.34245 10.9779 9.50651 10.7773 9.76172L10.0117 10.6914C8.77214 9.96224 7.78776 8.98698 7.05859 7.76562L7.98828 7C8.24349 6.79948 8.40755 6.54427 8.48047 6.23438C8.55339 5.92448 8.52604 5.6237 8.39844 5.33203L7.25 2.625C7.10417 2.29688 6.8763 2.0599 6.56641 1.91406C6.27474 1.75 5.95573 1.70443 5.60938 1.77734L3.12109 2.35156C2.77474 2.44271 2.5013 2.61589 2.30078 2.87109C2.10026 3.1263 2 3.41797 2 3.74609C2.01823 5.98828 2.5651 8.01172 3.64062 9.81641C4.71615 11.6029 6.14714 13.0339 7.93359 14.1094C9.73828 15.1849 11.7617 15.7318 14.0039 15.75C14.332 15.75 14.6237 15.6497 14.8789 15.4492C15.1341 15.2487 15.2982 14.9753 15.3711 14.6289L15.9453 12.1406C16.0182 11.7943 15.9818 11.4753 15.8359 11.1836C15.6901 10.8737 15.4531 10.6458 15.125 10.5ZM14.6875 11.8398L14.1133 14.3555C14.0951 14.3919 14.0586 14.4193 14.0039 14.4375C12.0169 14.4193 10.2214 13.9362 8.61719 12.9883C7.01302 12.0221 5.72786 10.737 4.76172 9.13281C3.8138 7.52865 3.33073 5.73307 3.3125 3.74609C3.3125 3.69141 3.33984 3.65495 3.39453 3.63672L5.91016 3.0625C5.91016 3.0625 5.91927 3.0625 5.9375 3.0625C5.97396 3.0625 6.01042 3.08984 6.04688 3.14453L7.19531 5.82422C7.21354 5.87891 7.20443 5.92448 7.16797 5.96094L5.82812 7.02734C5.57292 7.24609 5.50911 7.51042 5.63672 7.82031C6.11068 8.75 6.70312 9.57943 7.41406 10.3086C8.14323 11.0378 8.97266 11.6302 9.90234 12.0859C10.194 12.2135 10.4583 12.1497 10.6953 11.8945L11.7891 10.582C11.8255 10.5273 11.8711 10.5091 11.9258 10.5273L14.6055 11.6758C14.6602 11.7305 14.6875 11.7852 14.6875 11.8398Z"
                                    fill="#495057"/>
                            </svg>
                        </Tooltip>
                        {data?.profile_data?.phone || "Phone not provided"}
                    </Anchor>
                    <Anchor href={`mailto:${data?.email}`} size="sm" color="#868E96" className="flex items-center gap-x-1">
                        <Tooltip label="Email" withArrow>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9.19141 2.1875C7.36849 2.15104 5.78255 2.77083 4.43359 4.04688C3.12109 5.34115 2.45573 6.91797 2.4375 8.77734C2.47396 10.4362 3.01172 11.8672 4.05078 13.0703C5.07161 14.2734 6.40234 15.0208 8.04297 15.3125C8.0612 15.3125 8.08854 15.3125 8.125 15.3125C8.47135 15.2943 8.6901 15.112 8.78125 14.7656C8.79948 14.3646 8.61719 14.1094 8.23438 14C6.92188 13.7812 5.85547 13.1888 5.03516 12.2227C4.19661 11.2565 3.76823 10.1081 3.75 8.77734C3.76823 7.30078 4.30599 6.03385 5.36328 4.97656C6.42057 3.95573 7.6875 3.46354 9.16406 3.5C10.6042 3.59115 11.7982 4.15625 12.7461 5.19531C13.7122 6.23438 14.2135 7.51042 14.25 9.02344V9.54297C14.25 9.88932 14.1315 10.181 13.8945 10.418C13.6758 10.6367 13.3932 10.7552 13.0469 10.7734C12.7005 10.7552 12.418 10.6367 12.1992 10.418C11.9622 10.181 11.8438 9.88932 11.8438 9.54297V6.37109C11.8073 5.97005 11.5885 5.76042 11.1875 5.74219C10.8411 5.76042 10.6315 5.94271 10.5586 6.28906C10.0482 5.88802 9.45573 5.6875 8.78125 5.6875C7.90625 5.70573 7.1862 6.00651 6.62109 6.58984C6.03776 7.15495 5.73698 7.86589 5.71875 8.72266C5.73698 9.57943 6.03776 10.2904 6.62109 10.8555C7.1862 11.4388 7.90625 11.7396 8.78125 11.7578C9.63802 11.7396 10.3581 11.4479 10.9414 10.8828C11.4154 11.612 12.1172 11.9948 13.0469 12.0312C13.7578 12.013 14.3503 11.7669 14.8242 11.293C15.2982 10.819 15.5443 10.2266 15.5625 9.51562V9.02344C15.5443 7.78385 15.2526 6.66276 14.6875 5.66016C14.1224 4.63932 13.3659 3.81901 12.418 3.19922C11.4518 2.5612 10.3763 2.22396 9.19141 2.1875ZM8.78125 10.5C8.28906 10.4818 7.87891 10.3086 7.55078 9.98047C7.22266 9.65234 7.04948 9.2513 7.03125 8.77734C7.04948 8.28516 7.22266 7.875 7.55078 7.54688C7.87891 7.21875 8.28906 7.05469 8.78125 7.05469C9.27344 7.07292 9.68359 7.23698 10.0117 7.54688C10.3398 7.875 10.513 8.28516 10.5312 8.77734C10.513 9.2513 10.3398 9.65234 10.0117 9.98047C9.68359 10.3086 9.27344 10.4818 8.78125 10.5Z"
                                fill="#495057"/>
                        </svg>
                        </Tooltip>
                        {data?.profile_data?.email || "Email not provided"}
                    </Anchor>
                    <Text size="sm" color="#868E96" className="flex items-center gap-x-1" style={{marginRight: "-3rem"}}>
                        <Tooltip label="Service Area" withArrow>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M14.25 4.375H12.5V3.5C12.4818 3.00781 12.3086 2.59766 11.9805 2.26953C11.6523 1.94141 11.2422 1.76823 10.75 1.75H7.25C6.75781 1.76823 6.34766 1.94141 6.01953 2.26953C5.69141 2.59766 5.51823 3.00781 5.5 3.5V4.375H3.75C3.25781 4.39323 2.84766 4.56641 2.51953 4.89453C2.19141 5.22266 2.01823 5.63281 2 6.125V13.125C2.01823 13.6172 2.19141 14.0273 2.51953 14.3555C2.84766 14.6836 3.25781 14.8568 3.75 14.875H14.25C14.7422 14.8568 15.1523 14.6836 15.4805 14.3555C15.8086 14.0273 15.9818 13.6172 16 13.125V6.125C15.9818 5.63281 15.8086 5.22266 15.4805 4.89453C15.1523 4.56641 14.7422 4.39323 14.25 4.375ZM7.25 3.0625H10.75C11.0234 3.08073 11.1693 3.22656 11.1875 3.5V4.375H6.8125V3.5C6.83073 3.22656 6.97656 3.08073 7.25 3.0625ZM3.75 5.6875H14.25C14.5234 5.70573 14.6693 5.85156 14.6875 6.125V8.75H3.3125V6.125C3.33073 5.85156 3.47656 5.70573 3.75 5.6875ZM14.25 13.5625H3.75C3.47656 13.5443 3.33073 13.3984 3.3125 13.125V10.0625H7.25V10.5C7.25 10.7552 7.33203 10.9648 7.49609 11.1289C7.66016 11.293 7.86979 11.375 8.125 11.375H9.875C10.1302 11.375 10.3398 11.293 10.5039 11.1289C10.668 10.9648 10.75 10.7552 10.75 10.5V10.0625H14.6875V13.125C14.6693 13.3984 14.5234 13.5443 14.25 13.5625Z"
                                fill="#495057"/>
                        </svg>
                        </Tooltip>
                        Service Area: {data?.merchant_data?.service_area || "Not specified"}
                    </Text>
                </Stack>
            </div>
            {/* TaskStats Section */}
            <Box
                sx={{
                    // justifyContent:"space-between",
                    minWidth: "250px",
                    marginLeft: isMobile || isZoomedIn ? "10px" : "10px", // Push to the right on desktop
                    marginTop: isMobile || isZoomedIn ? "20px" : "", // Move down when zoomed in
                    width: isMobile || isZoomedIn ? "100%" : "100%", // Full-width on smaller or zoomed screens
                }}
            >
                <TaskStats data={data} hasPermission={hasPermission}/>
            </Box>
        </Box>
    );
};

export default ProfileInfo;
