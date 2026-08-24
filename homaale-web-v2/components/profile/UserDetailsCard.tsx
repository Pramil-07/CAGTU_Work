import {
    Box,
    Button,
    Flex,
    Group,
    Rating,
    Text,
    useMantineTheme,
} from "@mantine/core";
import {
    IconAt,
    IconAward,
    IconCalendarEvent,
    IconGift,
    IconPhone,
    IconSmartHome,
    IconSparkles,
} from "@tabler/icons-react";
import {useQueryClient} from "@tanstack/react-query";
import {format} from "date-fns";
import Image from "next/image";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";

import {useFollow} from "@/hooks/useFollow";
import {useGetCookieUser} from "@/hooks/useGetCookieUser";
import {useUserDetailsCardStyles} from "@/styles/components/UserDetailsCardStyles";
import type {ProfileResponseProps} from "@/types/ProfileResponseProps";

import Ellipsis from "../common/Ellipsis";
import {toast} from "../common/Toast";
import FollowListModal from "./FollowListModal";
import MyEarnings from "./MyEarnings";
import {useProfile} from "@/hooks/useProfile";
import {axiosClient} from "@/utils/axiosClient";
import { useUserStatus, USERSTATUS } from "@/hooks/useUserStatus";
import {Profile} from "@/components/merchant/ProfilePage/ProfilePage";
import loader from "next-translate/plugin/loader";
import { useBrandData } from "@/brand/BrandContext";

const UserDetailsCard = ({
                             profile,
                             isOwn,
                         }: {
    profile: ProfileResponseProps;
    isOwn: boolean;
}) => {
    const [openedFollowList, setOpenedFollowList] = useState(false);

    const {classes} = useUserDetailsCardStyles();
    const theme = useMantineTheme();
    const router = useRouter();
    const userId = router.query.id;
    const queryClient = useQueryClient();
    const [data, setData] = useState<Profile | null>(null);
    const {mutate, isLoading: isFollowLoading} = useFollow();
    const {data: profileData} = useProfile();
    const ProfileId = profileData?.user?.id
    const skills = profile?.skills ?? [];
    const user_id = useGetCookieUser();
    const [isFollowed, setIsFollowed] = useState(profile?.is_followed);
    const isMerchant = data?.is_merchant
    const { checkStatus } = useUserStatus();
    const {brandData}= useBrandData()
    // console.log("user id ", userId)

    const buttonText = isMerchant ? (isOwn ? "Merchant Page" : ` Merchant Page`) : ((isOwn) ? "Merchant Registration" : null);
    // const buttonOnClick = () => router.push(isMerchant ? (isOwn ? "/merchant" : `/merchant/${userId}`) : (isOwn ? "/merchant/registration" : "Notfound/"));
    const buttonOnClick = () => {
        if (isMerchant) {
            // Navigate to merchant page if user is already a merchant
            router.push(isOwn ? "/merchant/profile" : `/merchant/profile/${userId}`);
        } else if (isOwn) {
            // Check KYC status before allowing merchant registration
            const isKycVerified = checkStatus(USERSTATUS.kyc);
            // console.log("isKycVerified:", isKycVerified);
            if (isKycVerified) {
                router.push("/merchant/profile/registration");
            }
        } else {
            router.push("/Notfound/");
        }
    };
    // console.log("button Text", buttonText)
    useEffect(() => {
        setIsFollowed(profile?.is_followed);
    }, [profile?.is_followed]);
    // merchant/a8d8b79d-9419-4897-8cb3-b699f7946213
    // console.log("merchant data", data)
    // console.log("merchant Id", isMerchant)

    useEffect(() => {
        const fetchApiData = async () => {
            try {
                const response = await axiosClient.get(`/merchant/${ProfileId}`);
                // console.log("API Response:", response.data);

                if (response.data) {
                    setData(response.data);
                }
            } catch (error: any) {
                // console.error("Error fetching data:", error);
            }
        };

        fetchApiData();
    }, [ProfileId]);


    const handleFollowClick = (user: string, type: string) => {
        mutate(
            {
                user: user,
                follow: type === "follow" ? true : false,
            },
            {
                onSuccess: (data: any) => {
                    if (data.data.user === user) {
                        if (data.data.follow === true) {
                            setIsFollowed(true);
                        } else {
                            setIsFollowed(false);
                        }
                    }
                    type === "follow"
                        ? toast.success("User followed successfully")
                        : toast.success("User unfollowed successfully");
                    queryClient.invalidateQueries(["tasker-listing"]);
                    queryClient.invalidateQueries(["tasker-detail"]);
                },
                onError: (err: any) => {
                    toast.error(err.response.data.message);
                },
            }
        );
    };

    return (
        <Box className={classes.wrapper}>
            <Flex align={"center"} justify={"center"} direction={"column"}>
                {!isOwn && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 15,
                            right: 15,
                        }}
                    >
                        {user_id && (
                            <Ellipsis
                                size={16}
                                type={"entity"}
                                reportedUserId={profile?.user?.id}
                                reportedUserImage={profile?.profile_image}
                                reportedUserName={profile?.user?.full_name}
                                reportedDesignation={profile?.designation}
                            />
                        )}
                    </Box>
                )}
                <figure className="user-img">
                    <Image
                        src={
                            profile?.profile_image ??
                            brandData.favicon
                        }
                        alt="user-img"
                        fill
                    />
                    <Image
                        className="user-badge"
                        src={
                            profile?.badge?.image ??
                            brandData.favicon
                        }
                        alt="badge-img"
                        height={48}
                        width={48}
                    />
                </figure>
                <h1 className="basic-info">{profile?.user?.full_name.charAt(0).toUpperCase() + profile?.user?.full_name.slice(1)}</h1>
                <Text className="basic-info">
                    Individual | {profile?.designation.charAt(0).toUpperCase()  + profile?.designation.slice(1)}
                    
                </Text>
                <Group position="center" className="basic-info">
                    <Rating
                        value={profile?.rating?.avg_rating}
                        fractions={2}
                        readOnly
                        size="lg"
                    />
                </Group>
                <p className="basic-info review-count">
                    {profile?.rating?.user_rating_count} reviews
                </p>
                {!isOwn ? (
                    isFollowed ? (
                        <Button
                            id="user-unfollow-btn"
                            mt={16}
                            mb={24}
                            sx={{
                                width: 200,
                                transition: "all 0.2s ease-in-out",
                            }}
                            onClick={() => {
                                if (!checkStatus("profile")) {
                                    return;
                                }
                                handleFollowClick(
                                    profile?.user?.id,
                                    "unfollow"
                                );
                            }}
                            loading={isFollowLoading}
                            variant="outline"
                        >
                            Followed
                        </Button>
                    ) : (
                        <Button
                            id="user-follow-btn"
                            mt={16}
                            mb={24}
                            sx={{
                                width: 200,
                                background: theme.colors.homaaleSlate[8],
                                transition: "all 0.2s ease-in-out",
                            }}
                            onClick={() => {
                                if (!checkStatus("profile")) {
                                    return;
                                }
                                handleFollowClick(profile?.user?.id, "follow");
                            }}
                            loading={isFollowLoading}
                        >
                            Follow
                        </Button>
                    )
                ) : (
                    ""
                )}
                {isOwn && (
                    <Flex mt={16} mb={25}>
                        <Box
                            sx={{
                                textAlign: "center",
                                borderRight: `2px solid ${theme.colors.gray[2]}`,
                                padding: "0 24px",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                setOpenedFollowList(true);
                            }}
                        >
                            <h4>Followers</h4>
                            <Text>{profile?.followers_count}</Text>
                        </Box>
                        <Box
                            sx={{
                                textAlign: "center",
                                padding: "0 24px",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                setOpenedFollowList(true);
                            }}
                        >
                            <h4>Followings</h4>
                            <Text>{profile?.following_count}</Text>
                        </Box>
                    </Flex>
                )}
                {isOwn && (
                    <Flex gap={24}>
                        <Flex direction={"column"} fw={500}>
                            Reward Points
                            <Text component="p" display={"flex"}>
                                <IconAward color={theme.colors.brand[3]}/>{" "}
                                <Text
                                    component="span"
                                    fw={500}
                                    size={16}
                                    ml={8}
                                    color={
                                        theme.colorScheme === "dark"
                                            ? theme.colors.brand[3]
                                            : theme.colors.homaaleSlate[8]
                                    }
                                >
                                    {profile?.remaining_points}
                                </Text>
                            </Text>
                        </Flex>
                        <Button
                            onClick={() => router.push("/redeem")}
                            color={"dark"}
                            fw={400}
                            leftIcon={<IconGift/>}
                        >
                            Redeem
                        </Button>
                    </Flex>
                )}
                <Flex
                    wrap="wrap"
                    gap={{ base: "12px", sm: "16px", md: "20px" }}
                    direction={{ base: "column", sm: "row" }}
                    mt="25px"
                    mb="24px"
                    justify="center"
                >
                    {isOwn && (

                        <Button
                            id="edit-profile-btn"
                            variant="outline"
                            // mb={24}
                            // mt={25}
                            sx={{
                                color:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[4]
                                        : theme.colors.gray[7],
                                borderColor: theme.colors.gray[6],
                                "&:hover": {
                                    color: theme.colors.brand[4],
                                    borderColor: theme.colors.brand[4],
                                    transition: "0.25s all ease",
                                },
                            }}
                            onClick={() => router.push("/settings/account")}
                        >
                            Edit Profile
                        </Button>


                    )}
                    {data !== null && buttonText && (
                        <Button
                            id="register-merchant-btn"
                            variant="outline"
                            // mb={24}
                            // mt={25}
                            sx={{
                                color:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[4]
                                        : theme.colors.gray[7],
                                borderColor: theme.colors.gray[6],
                                "&:hover": {
                                    color: theme.colors.brand[4],
                                    borderColor: theme.colors.brand[4],
                                    transition: "0.25s all ease",
                                },
                            }}
                            onClick={buttonOnClick}
                        >
                            {buttonText}
                        </Button>
                    )}
                </Flex>

            </Flex>

            <Box
                className="contact-block"
                sx={{
                    borderTop:
                        theme.colorScheme === "dark"
                            ? `1px solid ${theme.colors.gray[7]}`
                            : `1px solid rgba(0, 0, 0, 0.08)`,
                    borderBottom:
                        theme.colorScheme === "dark"
                            ? `1px solid ${theme.colors.gray[7]}`
                            : `1px solid rgba(0, 0, 0, 0.08)`,
                    padding: "24px 0",
                }}
            >
                {profile?.user?.created_at && (
                    <p className="contact-info">
                        <IconCalendarEvent size={18} className="svg-icon"/>
                        {format(new Date(profile?.user?.created_at), "PP")}
                    </p>
                )}

                <p className="contact-info">
                    <IconSmartHome size={18} className="svg-icon"/>
                    {profile?.address_line1}
                </p>
                {isOwn && profile?.user?.phone && (
                    <p className="contact-info">
                        <IconPhone size={18} className="svg-icon"/>
                        {profile?.user?.phone}
                    </p>
                )}
                {isOwn && profile?.user?.email && (
                    <p className="contact-info">
                        <IconAt size={18} className="svg-icon"/>
                        {profile?.user?.email}
                    </p>
                )}

                {skills && skills.length > 0 && (
                    <Text
                        component="p"
                        className="contact-info flex flex-wrap"
                        sx={{display: "block"}}
                    >
                        <IconSparkles size={18} className="svg-icon"/>
                        {skills.map((item, index) => (
                            <span key={index}>
                                {item?.name}
                                {index < skills.length - 2
                                    ? ", "
                                    : index < skills.length - 1
                                        ? " and"
                                        : ""}
                            </span>
                        ))}
                    </Text>
                )}
                <p
                    className={classes.description}
                    dangerouslySetInnerHTML={{__html: profile?.bio || ""}}
                ></p>

            </Box>

            <Group
                className="stat-block"
                grow
                sx={{
                    padding: 16,
                    border:
                        theme.colorScheme === "dark"
                            ? `1px solid ${theme.colors.gray[7]}`
                            : `1px solid rgba(0, 0, 0, 0.08)`,
                    borderRadius: 4,
                    marginTop: 16,
                    marginBottom: 16,
                }}
            >
                <Box className="stat-content">
                    <h1 className="success-rate">
                        {profile?.stats?.success_rate.toFixed(2)}
                    </h1>
                    <Text
                        component="span"
                        truncate
                        lineClamp={1}
                        sx={{
                            whiteSpace: "break-spaces",
                        }}
                    >
                        Success Rate
                    </Text>
                </Box>
                <Box className="stat-content">
                    <h1 className="happy-clients">
                        {profile?.stats?.happy_clients}
                    </h1>
                    <Text
                        component="span"
                        truncate
                        lineClamp={1}
                        sx={{
                            whiteSpace: "break-spaces",
                        }}
                    >
                        Happy Clients
                    </Text>
                </Box>
                <Box className="stat-content">
                    <h1 className="task-completed">
                        {profile?.stats?.task_completed}
                    </h1>
                    <Text
                        component="span"
                        truncate
                        lineClamp={1}
                        sx={{
                            whiteSpace: "break-spaces",
                        }}
                    >
                        Tasks Completed
                    </Text>
                </Box>
            </Group>

            {isOwn && <MyEarnings/>}
            {openedFollowList && (
                <FollowListModal
                    openedFollowList={openedFollowList}
                    setOpenedFollowList={setOpenedFollowList}
                />
            )}
        </Box>
    );
};

export default UserDetailsCard;
