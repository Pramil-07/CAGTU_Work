import {
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
    IconClock,
    IconMapPin,
    IconTrophy,
} from "@tabler/icons-react";
import {IconMoodSmileBeam} from "@tabler/icons-react";
import {format} from "date-fns";
import Image from "next/image";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";

import {useFollow} from "@/hooks/useFollow";
import {useUser} from "@/hooks/useUser";
import {useUserStatus} from "@/hooks/useUserStatus";
import {useTaskerCardStyles} from "@/styles/components/TaskerCardStyles";
import type {TaskerProps} from "@/types/TaskerProps";
import {ShareButton} from "./ShareButton";
import {toast} from "./Toast";


export const TaskerCard = ({
                               tasker,
                           }: {
    tasker: TaskerProps["result"][0];
}) => {
    const theme = useMantineTheme();
    const {classes} = useTaskerCardStyles();
    const {mutate, isLoading: isFollowLoading} = useFollow();
    const {checkStatus} = useUserStatus();
    // console.log("tasker ", tasker);
    const {
        full_name,
        profile_image,
        rating,
        designation,
        city,
        stats,
        user,
        is_followed,
        experience_level,
        is_profile_verified,
    } = tasker ?? ({} as TaskerProps["result"][0]);
    const router = useRouter();

    const {data: userData} = useUser();
    //Checks IF the user owns the entity service or not
    let is_user: boolean;

    if (userData?.id === user?.id) {
        is_user = true;
    } else {
        is_user = false;
    }
    const [isFollowed, setIsFollowed] = useState(is_followed);
    useEffect(() => {
        setIsFollowed(is_followed);
    }, [is_followed]);

    const handleFollowClick = (user: string, type: string) => {
        if (!user || !type) return;
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
                    // type === "follow"
                    //     ? toast.success("User followed successfully")
                    //     : toast.success("User unfollowed successfully");
                },
                onError: (err: any) => {
                    toast.error(err.response.data.message);
                },
            }
        );
    };

    return (
        <Box
            className={classes.mainBox}
            onClick={() =>
                router.push(is_user ? "/profile" : `/tasker/${user?.id}`)
            }
        >
            <Box className={classes.UpperBox}>
                <Box className={classes.wrapper1}>
                    <Flex className={classes.upperBox} gap={20}>
                        <Flex gap={16}>
                            <Image
                                src={
                                    profile_image
                                        ? profile_image
                                        : "/images/placeholder/profilePlaceholder.png"
                                }
                                style={{
                                    borderRadius: "50%",
                                    objectFit: "contain",
                                }}
                                alt={full_name + "profile"}
                                height={48}
                                width={48}
                            />
                            <Box className={classes.headerwrapper}>
                                <Flex gap={4} justify="flex-start">
                                    <Text
                                        truncate
                                        lineClamp={1}
                                        component="h3"
                                        style={{
                                            fontWeight: 500,
                                            fontSize: 18,
                                            whiteSpace: "break-spaces",
                                        }}
                                    >
                                        {full_name}
                                    </Text>
                                    {is_profile_verified && (
                                        <Tooltip label="Verified Tasker" withArrow>
                                        <Image
                                            src="/CardImages/Vector.svg"
                                            alt="verified-tick"
                                            height={16}
                                            width={16}
                                            // title="verified Tick"
                                        />
                                        </Tooltip>
                                    )}
                                </Flex>
                                <Box className={classes.starwrapper}>
                                    <Image
                                        src="/svgs/ratingstar.svg"
                                        alt="rating"
                                        height={13}
                                        width={12}
                                    />
                                    <h3
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {rating?.avg_rating &&
                                            +rating?.avg_rating?.toFixed(2)} {rating.user_rating_count > 0 ? `(${rating.user_rating_count})` : ""}
                                    </h3>
                                    <h4
                                        style={{
                                            fontWeight: 400,
                                            fontSize: 12,
                                        }}
                                    >
                                        {designation?.charAt(0).toUpperCase() + designation?.slice(1)}
                                    </h4>
                                </Box>
                            </Box>
                        </Flex>
                        {!is_user ? (
                            isFollowed ? (
                                <Button
                                    compact
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (checkStatus("kyc")) {
                                            handleFollowClick(
                                                user?.id,
                                                "unfollow"
                                            );
                                        }
                                    }}
                                    loading={isFollowLoading}
                                    className={classes.unfollowButton}
                                >
                                    Followed
                                </Button>
                            ) : (
                                <Button
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: 12,
                                        transition: "all 0.25s ease-in-out",
                                    }}
                                    compact
                                    className={classes.followButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (checkStatus("kyc")) {
                                            handleFollowClick(
                                                user?.id,
                                                "follow"
                                            );
                                        }
                                    }}
                                    loading={isFollowLoading}
                                >
                                    Follow
                                </Button>
                            )
                        ) : (
                            ""
                        )}
                    </Flex>
                    <Box className={classes.description}>
                        <Tooltip
                            withArrow
                            label="Joined Date"
                            color={theme.colors.socialicons[9]}
                        >
                            <Flex gap={6}>
                                <IconCalendar
                                    size={16}
                                    color={
                                        theme.colorScheme === "dark"
                                            ? theme.colors.gray[6]
                                            : theme.colors.homaaleSlate[5]
                                    }
                                />
                                <h4 className={classes.header4}>
                                    {user?.created_at &&
                                        format(
                                            new Date(user?.created_at),
                                            "PP"
                                        )}
                                </h4>
                            </Flex>
                        </Tooltip>
                    </Box>
                    <Box className={classes.description}>
                        <Tooltip
                            withArrow
                            label="Experience"
                            color={theme.colors.socialicons[9]}
                        >
                            <Flex gap={6}>
                                <IconBriefcase
                                    size={16}
                                    color={
                                        theme.colorScheme === "dark"
                                            ? theme.colors.gray[6]
                                            : theme.colors.homaaleSlate[5]
                                    }
                                />
                                <h4 className={classes.header4}>
                                    {experience_level}
                                </h4>
                            </Flex>
                        </Tooltip>
                    </Box>
                    <Box className={classes.description}>
                        <IconMapPin
                            size={16}
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.gray[6]
                                    : theme.colors.homaaleSlate[5]
                            }
                        />
                        <h4 className={classes.header4}>{city?.name}</h4>
                    </Box>
                </Box>
            </Box>
            <Box className={classes.lowerwrapper}>
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
                                <p>{stats?.happy_clients}</p>
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
                                <p>{+stats?.success_rate.toFixed(2) + "%"}</p>
                            </Box>
                        </Tooltip>
                        <Tooltip
                            withArrow
                            label="Task Completed"
                            color={theme.colors.socialicons[9]}
                        >
                            <Box className={classes.flexlowerbox}>
                                <IconChecklist
                                    color={theme.colors.socialicons[8]}
                                    size={18}
                                />
                                <p>{stats?.task_completed}</p>

                            </Box>
                        </Tooltip>
                    </Box>
                </Box>
                <Group>
                    <ShareButton
                        showText
                        className={classes.share}
                        url={
                            typeof window !== "undefined"
                                ? window.location.origin + `/tasker/${user?.id}`
                                : ""
                        }
                    />
                </Group>
            </Box>
        </Box>
    );
};
