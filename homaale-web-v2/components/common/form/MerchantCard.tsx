import {
    Avatar,
    Box,
    Button,
    Flex,
    Group,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import {
    IconBriefcase,
    IconCalendar,
    IconChecklist,
    IconMapPin,
    IconTrophy,
    IconUser,
    IconUsers,
} from "@tabler/icons-react";
import {IconMoodSmileBeam} from "@tabler/icons-react";
import Image from "next/image";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";

import {useFollow} from "@/hooks/useFollow";
import {useUser} from "@/hooks/useUser";
import {useUserStatus} from "@/hooks/useUserStatus";
import {useTaskerCardStyles} from "@/styles/components/TaskerCardStyles";
import {Merchant} from "@/types/merchant/merchantListprops";
import {ShareButton} from "@/components/common/ShareButton";
import {toast} from "@/components/common/Toast";
import {MdOutlineWorkspacePremium, MdWorkspacePremium} from "react-icons/md";

export const MerchantCard = ({
                                 merchant,
                                 cities,
                             }: {
    merchant: Merchant["result"][0];
    cities: { value: string; label: string }[];
}) => {
    const theme = useMantineTheme();
    const {classes} = useTaskerCardStyles();
    const {mutate, isLoading: isFollowLoading} = useFollow();
    const {checkStatus} = useUserStatus();
    const router = useRouter();

    const {data: userData} = useUser();
    const {
        full_name,
        logo,
        service_area,
        active_hour_start,
        is_premium,
        active_hour_end,
        user,
        city,
        stats,
        rating,
        is_followed,
        staff_count
    }: any = merchant;
    // const {

    //     profile_image,
    //     rating,
    //     designation,
    //     city,
    //     stats,
    //     user,
    //     is_followed,
    //     experience_level,
    //     is_profile_verified,
    // } = tasker ?? ({} as TaskerProps["result"][0]);

    // console.log("mercant data ", merchant)

    const matchedCity = cities.find((c) => c.value == city)?.label || "Unknown City";
    const isUser = userData?.id === user;
    const [isFollowed, setIsFollowed] = useState(is_followed);
    // console.log("User Data from useUser:", userData); // Logs the current user data
    // console.log("Merchant User ID:", user); // Logs the merchant's user ID
    // console.log("Is Followed State:", isFollowed); // Logs the follow state
    // console.log("Is Current User the Merchant?:", isUser);

    const calculateAverageRating = () => {
        if (!rating || rating.total_review === 0) return "0";
        const average = rating.total_rating / rating.total_review;
        return average.toFixed(1);
    };


    useEffect(() => {
        setIsFollowed(is_followed);
    }, [is_followed]);


    const handleFollowClick = (userId: string, type: string) => {
        if (!userId || !type) return;
        mutate(
            {
                user: userId,
                follow: type === "follow",
            },
            {
                onSuccess: (data: any) => {
                    if (data.data.user === userId) {
                        setIsFollowed(data.data.follow);
                        // toast.success(
                        //     type === "follow"
                        //         ? "User followed successfully"
                        //         : "User unfollowed successfully"
                        // );
                    }
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || "An error occurred");
                },
            }
        );
    };

    function convertTo12Hour(start_time: string, end_time: string) {
        const to12Hour = (time: string) => {
            try {
                const [hours, minutes] = time.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) {
                    throw new Error('Invalid time format');
                }
                const period = hours >= 12 ? 'PM' : 'AM';
                const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
                return minutes === 0 ? `${adjustedHours}${period}` : `${adjustedHours}:${minutes.toString().padStart(2, '0')}${period}`;
            } catch (error) {
                console.error(`Error converting time: ${time}`, error);
                return time; // Fallback to original time if conversion fails
            }
        };

        const start = to12Hour(start_time);
        const end = to12Hour(end_time);
        return `${start} - ${end}`;
    }


    return (
        <Box
            className={classes.mainBox}
            onClick={() => router.push(isUser ? "/profile" : `/merchant/profile/${merchant.id}`)}
        >
            {/* Upper Section */}
            <Box className={classes.UpperBox}>
                <Box className={classes.wrapper1}>
                    <Flex className={classes.upperBox} gap={20}>
                        <Flex gap={16}>
                            <Avatar
                                src={logo || "/images/placeholder/profilePlaceholder.png"}
                                style={{borderRadius: "50%", objectFit: "contain"}}
                                alt={`${full_name} logo`}
                                // height={48}
                                // width={48}
                            />
                            <Box className={classes.headerwrapper}>
                                <Flex gap={4} justify="flex-start">
                                    <Text
                                        lineClamp={1}
                                        component="h3"
                                        style={{
                                            fontWeight: 500,
                                            fontSize: 18,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 5, // space between name and icon
                                            whiteSpace: 'normal',
                                        }}
                                    >
                                        <Tooltip label={full_name} withArrow>
                                            <Box
                                                component="span"
                                                style={{
                                                    display: 'inline-block',
                                                    maxWidth: 150,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {full_name}
                                            </Box>
                                        </Tooltip>

                                        <Box component="span">
                                            <Tooltip
                                                label={is_premium ? 'Premium Merchant' : 'Standard Merchant'}
                                                withArrow
                                            >
                                                <Image
                                                    src={is_premium ? '/svgs/PremiumBadge.svg' : '/svgs/StandardBadge.svg'}
                                                    height={20}
                                                    width={20}
                                                    alt={is_premium ? 'Premium Badge' : 'Standard Badge'}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </Text>
                                    {/* Merchant doesn't have is_profile_verified; omit or set default */}
                                    {false && (
                                        <Image
                                            src="/CardImages/Vector.svg"
                                            alt="verified-tick"
                                            height={16}
                                            width={16}
                                        />
                                    )}
                                </Flex>
                                <Box className={classes.starwrapper}>
                                    <Image src="/svgs/ratingstar.svg" alt="rating" height={13} width={12}/>
                                    <h3 style={{fontSize: 12, fontWeight: 500}}>
                                        {calculateAverageRating()} {rating.total_review > 0 ? `( ${rating.total_review} reviewed)` : "" }
                                    </h3>
                                    {/*<h4 style={{fontWeight: 400, fontSize: 12}}>*/}
                                    {/*    Merchant*/}
                                    {/*</h4>*/}
                                </Box>
                            </Box>
                        </Flex>
                        {!isUser && (
                            <Button
                                compact
                                variant={isFollowed ? "outline" : "filled"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFollowClick(user, isFollowed ? "unfollow" : "follow");
                                }}
                                loading={isFollowLoading}
                                className={isFollowed ? classes.unfollowButton : classes.followButton}
                            >
                                {isFollowed ? "Followed" : "Follow"}
                            </Button>
                        )}
                    </Flex>
                    {/* Joined Date - Merchant doesn't have created_at */}
                    <Box className={classes.description}>
                        <Tooltip withArrow label="Active Hour" color={theme.colors.socialicons[9]}>
                            <Flex gap={6}>
                                <IconCalendar
                                    size={16}
                                    color={
                                        theme.colorScheme === "dark" ? theme.colors.gray[6] : theme.colors.homaaleSlate[5]
                                    }
                                />
                                <p>{convertTo12Hour(active_hour_start,active_hour_end)}</p>
                            </Flex>
                        </Tooltip>
                    </Box>
                    {/*<Box className={classes.description}>*/}
                    {/*    <Tooltip withArrow label="Status" color={theme.colors.socialicons[9]}>*/}
                    {/*        <Flex gap={6}>*/}
                    {/*            <IconBriefcase*/}
                    {/*                size={16}*/}
                    {/*                color={*/}
                    {/*                    theme.colorScheme === "dark" ? theme.colors.gray[6] : theme.colors.homaaleSlate[5]*/}
                    {/*                }*/}
                    {/*            />*/}
                    {/*            <h4 className={classes.header4}>{`${is_premium ? "Premium" : "Standard"}`}</h4>*/}
                    {/*        </Flex>*/}
                    {/*    </Tooltip>*/}
                    {/*</Box>*/}
                    <Box className={classes.description}>
                        <IconMapPin
                            size={16}
                            color={
                                theme.colorScheme === "dark" ? theme.colors.gray[6] : theme.colors.homaaleSlate[5]
                            }
                        />
                        <h4 className={classes.header4}>{city || "No city added"}</h4>
                    </Box>
                </Box>
            </Box>

            {/* Lower Section */}
            <Box style={{
                padding: "8px 12px 8px",
                display: "flex",
                justifyContent: "space-between",
                [theme.fn.smallerThan("22em")]: {
                    flexDirection: "column",
                },
                }}
                 >
                {/* <Box className={classes.description1}>*/}
                {/*    <Box className={classes.flexlowerleft}>*/}
                {/*        /!* Merchant doesn't have stats; provide fallbacks or omit *!/*/}
                {/*        <Tooltip withArrow label="Active Hours" color={theme.colors.socialicons[9]}>*/}
                {/*            <Box className={classes.flexlowerbox}>*/}
                {/*                <IconMoodSmileBeam color={theme.colors.socialicons[6]} size={18}/>*/}
                {/*                <p>{`${active_hour_start} - ${active_hour_end}`}</p>*/}
                {/*            </Box>*/}
                {/*        </Tooltip>*/}
                {/*        <Tooltip withArrow label="Success Rate" color={theme.colors.socialicons[9]}>*/}
                {/*            <Box className={classes.flexlowerbox}>*/}
                {/*                <IconTrophy color={theme.colors.socialicons[7]} size={18}/>*/}
                {/*                <p>N/A</p>*/}
                {/*            </Box>*/}
                {/*        </Tooltip>
                {/*        <Tooltip withArrow label="Task Completed" color={theme.colors.socialicons[9]}>*/}
                {/*            <Box className={classes.flexlowerbox}>*/}
                {/*                <IconChecklist color={theme.colors.socialicons[8]} size={18}/>*/}
                {/*                <p>N/A</p>*/}
                {/*            </Box>*/}
                {/*        </Tooltip>*/}
                {/*    </Box>*/}
                {/*</Box>*/}
                <Box className={classes.description1}>
                    <Box className={classes.flexlowerleft}>
                        <Tooltip
                            withArrow
                            label="Happy Client"
                            color={theme.colors.socialicons[9]}
                        >
                            <Box className={classes.flexlowerbox}>
                                <IconMoodSmileBeam
                                    color={theme.colors.socialicons[6]}
                                    size={18}
                                />
                                <p>{stats?.happy_clients||0}</p>
                            </Box>
                        </Tooltip>
                        <Tooltip
                            withArrow
                            label="Success Rate"
                            color={theme.colors.socialicons[9]}
                        >
                            <Box className={classes.flexlowerbox}>
                                {" "}
                                <IconTrophy
                                    color={theme.colors.socialicons[7]}
                                    size={18}
                                />
                                <p>{+stats?.success_rate.toFixed(2)||0 + "%"}</p>
                            </Box>
                        </Tooltip>
                        <Tooltip
                            withArrow
                            label="Number of Staffs"
                            color={theme.colors.socialicons[9]}
                        >
                            <Box className={classes.flexlowerbox}>
                                <IconUsers
                                    color={theme.colors.socialicons[8]}
                                    size={18}
                                />
                                <p>{staff_count||1}</p>
                            </Box>
                        </Tooltip>
                    </Box>
                    </Box>
                <Group>
                    <ShareButton
                    style={{
                        justifySelf:"flex-end"

                    }}
                        showText
                        className={classes.share}
                        url={
                            typeof window !== "undefined"
                                ? window.location.origin + `/merchant/profile/${merchant.id}`
                                : ""
                        }
                    />
                </Group>
            </Box>
        </Box>
    );
};
