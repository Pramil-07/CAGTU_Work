"use client";

import {Box, Text, Avatar, Badge, Flex, Group, RingProgress, Tooltip, Image} from "@mantine/core";
import {IconClock, IconMapPin, IconCalendarEvent} from "@tabler/icons-react";
import {formatDistanceToNowStrict, format} from "date-fns";
import {useMediaQuery} from "@mantine/hooks";
import type {MyBookingProps} from "@/types/booking/MyBookingProps";
import {useEntityCardStyles} from "@/styles/components/EntityCardStyles";
import {useRouter} from "next/router"; // Assuming you have this or a similar stylesheet

type WaitingListCardProps = {
    data: MyBookingProps["result"][number];
    onCardClick?: () => void;
};

export default function WaitingListCard({data, onCardClick}: WaitingListCardProps) {
    const {classes} = useEntityCardStyles();
    const isSmallScreen = useMediaQuery("(max-width: 768px)");
    const is150Screen = useMediaQuery("(max-width: 1000px)");
    const router = useRouter();

    const {id, created_by, entity_service, price = '0', earning = '0', status = '', progress_percent = 0, created_at, location = ''} = data;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "green";
            case "pending":
                return "yellow";
            case "rejected":
                return "red";
            case "completed":
                return "blue";
            default:
                return "gray";
        }
    };

    const formatPrice = (amount: string | number, symbol: string) => {
        return `${symbol} ${Number.parseFloat(amount.toString()).toLocaleString()}`;
    };

    const handelId = () => {
        router.push(`/box/${id}`)
    };

    const convertTo12HourFormat = (time?: string) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = Number.parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Fallback for entity_service if undefined
    if (!entity_service) {
        return (
            <Box className={classes.root} onClick={onCardClick}>
                <Text c="red">Error: Service data is missing</Text>
            </Box>
        );
    }

    return (
        <Box
            id={`waiting-card-${id}`}
            className={classes.root}
            onClick={handelId}
        >
            <Flex
                style={{minHeight: "200px"}}
                align={"flex-start"}
                direction={{base: "column", md: "row"}}
                px={16}
            >
                {/* Image Section */}

                <Box
                    ml={1}
                    w={"100%"}
                    mt={{base: 8, md: 1}}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                    className={classes.image}
                    mx={"auto"}
                >
                    <Image
                        src={entity_service.images?.[0]?.media || "/images/placeholder/taskPlaceholder.png"}
                        alt="Service image"
                        // fill
                        // sizes=""
                        placeholder="blur"
                        // blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                        style={{ objectFit: "cover", width: '100%', borderRadius: '8px' }}
                    />
                    <Badge
                        mt="xs"
                        size="md"
                        variant="light"
                        color="gray"
                        radius="xs"
                        style={{
                            marginTop: '4px',
                            maxHeight: "18px",
                            minHeight: "18px",
                            width: isSmallScreen ? "200px" : "130px",
                            textAlign: 'center',
                            textTransform: "none"
                        }}
                    >
                        Waiting
                    </Badge>
                </Box>

                {/* Content Section */}
                <Box ml={1} w={"100%"} mt={{base: 10, md: 0}}>
                    <Flex style={{}}>
                        <Box mr={"xs"}>
                            <Tooltip label={entity_service.title || "Untitled"} withArrow>
                                <Text
                                    truncate
                                    className={classes.title}
                                    lineClamp={2}
                                    maw={"auto"}
                                >
                                    {entity_service.title || "Untitled"}
                                </Text>
                            </Tooltip>
                        </Box>
                        <Box>
                            <Text
                                size="sm"
                                fw={700}
                                className="font-medium text-xs sm:text-sm md:text-base lg:text-sm xl:text-base leading-snug whitespace-nowrap overflow-hidden text-ellipsis"
                            >
                                {entity_service.is_range ? (
                                    <>
                                        {formatPrice(entity_service.budget_from ?? 0, entity_service.currency?.symbol ?? "$")} -{" "}
                                        {formatPrice(entity_service.budget_to ?? 0, entity_service.currency?.symbol ?? "$")}
                                    </>
                                ) : (
                                    formatPrice(price ?? "0", entity_service.currency?.symbol ?? "$")
                                )}
                            </Text>
                            <Text className="per" size={10}>
                                per {entity_service.budget_type || "unit"}
                            </Text>
                        </Box>
                    </Flex>

                    {/* User Info */}
                    <Box className={classes.created}>
                        <Avatar
                            src={created_by.profile_image || "/images/placeholder/profilePlaceholder.png"}
                            alt="User image"
                            radius={"xl"}
                            size={30}
                            style={{objectFit: "cover"}}
                        />
                        <Flex
                            ml={8}
                            justify={"space-between"}
                            className={"created__full"}
                            style={{width: "100%"}}
                        >
                            <Text
                                size="xs"
                                component="span"
                                truncate
                                lineClamp={2}
                                className={classes.createdByTitle}
                            >
                                {created_by.user.full_name || "Unknown User"}
                                &nbsp;  ● &nbsp;
                                {formatDistanceToNowStrict(new Date(created_at), {addSuffix: true})}
                            </Text>
                        </Flex>
                    </Box>

                    {/* Location and Date Info */}
                    <Box className={classes.content}>
                        <Group spacing="xs" c="dimmed" mb={4}>
                            <IconMapPin size={16}/>
                            <Text size="sm" >
                                {entity_service.city?.name || location || "Remote"}
                            </Text>
                        </Group>
                        {entity_service.end_date && (
                            <Group spacing="xs"  c="dimmed" mb={4}>
                                <IconCalendarEvent size={16}/>
                                <Text size="sm">
                                    {format(new Date(entity_service.end_date), "PP")}
                                    {entity_service.start_time && (
                                        <> | {convertTo12HourFormat(entity_service.start_time)}</>
                                    )}
                                    {entity_service.end_time && (
                                        <>-{convertTo12HourFormat(entity_service.end_time)}</>
                                    )}
                                </Text>
                            </Group>
                        )}

                        {/* Progress Ring */}
                        {/*{progress_percent > 0 && (*/}
                        {/*    <RingProgress*/}
                        {/*        style={{*/}
                        {/*            zIndex: 10,*/}
                        {/*            position: isSmallScreen ? "absolute" : "relative",*/}
                        {/*            marginLeft: isSmallScreen ? "" : "auto",*/}
                        {/*            marginTop: isSmallScreen ? "-60px" : "10px",*/}
                        {/*            right: isSmallScreen ? "10px" : "0",*/}
                        {/*        }}*/}
                        {/*        size={80}*/}
                        {/*        sections={[{value: progress_percent, color: getStatusColor(status)}]}*/}
                        {/*        thickness={8}*/}
                        {/*        roundCaps*/}
                        {/*        label={*/}
                        {/*            <Text*/}
                        {/*                color={getStatusColor(status)}*/}
                        {/*                weight={600}*/}
                        {/*                align="center"*/}
                        {/*                size="lg"*/}
                        {/*            >*/}
                        {/*                {progress_percent}%*/}
                        {/*            </Text>*/}
                        {/*        }*/}
                        {/*    />*/}
                        {/*)}*/}
                    </Box>

                </Box>
            </Flex>

            {/* Bottom Section */}
            <Flex
                justify={"space-between"}
                align={{base: "flex-start", xs: "center"}}
                direction={{base: "column", xs: "row"}}
                className={classes.bottomSection}
                gap={10}
                px={16}
            >
                <Flex className={classes.bottomLeft}>
                    <Badge radius="lg" size={"lg"} color={"blue"} style={{ textTransform: "none" }}>
                        <p>{"Waiting"}</p>
                    </Badge>
                </Flex>
            </Flex>
        </Box>
    );
}
