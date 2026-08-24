import {
    Flex,
    Loader,
    ScrollArea,
    Text,
    ThemeIcon,
    Timeline,
    useMantineTheme,
} from "@mantine/core";
import {
    IconCalendarTime,
    IconCirclePlus,
    IconEdit,
    IconGitCommit,
    IconLogin,
    IconMoodSad2,
    IconStar,
    IconTrash,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import React, { useMemo } from "react";

import { useInViewPort } from "@/hooks/useInViewPort";
import { useUserActivities } from "@/hooks/useUserActivities";

const Activities = () => {
    const {
        data: activityPages,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useUserActivities();

    const userActivities = useMemo(
        () =>
            activityPages?.pages
                .map((activityPage) => activityPage.result)
                .flat() ?? [],
        [activityPages?.pages]
    );

    const totalActivities = userActivities?.length;
    const isLastActivityOfPage = (index: number) =>
        index === totalActivities - 1;

    const { ref } = useInViewPort<HTMLDivElement>(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    });
    const theme = useMantineTheme();

    return (
        <>
            <ScrollArea.Autosize mah={760} offsetScrollbars scrollbarSize={5}>
                <Timeline
                    lineWidth={3}
                    mt={24}
                    ml={16}
                    sx={{
                        ".mantine-Timeline-item": {
                            paddingLeft: 32,
                            "&::before": {
                                borderLeft: `3px solid ${theme.colors.blue[1]}`,
                            },
                        },
                    }}
                >
                    {userActivities && userActivities.length > 0 ? (
                        userActivities.map((activity, index) => {
                            const getBackground = () => {
                                if (activity.action === "Login") {
                                    return "blue.5";
                                } else if (
                                    activity.action === "Create" &&
                                    activity.content_type === "booking"
                                ) {
                                    return "green.6";
                                } else if (
                                    activity.action === "Create" &&
                                    activity.content_type === "rating"
                                ) {
                                    return "orange";
                                } else if (
                                    activity.action === "Create" &&
                                    activity.content_type === "entityservice"
                                ) {
                                    return "green.7";
                                } else if (activity.action === "Update") {
                                    return "orange.5";
                                } else if (activity.action === "Delete") {
                                    return "red";
                                } else {
                                    return "yellow.5";
                                }
                            };

                            const getIcon = () => {
                                if (activity.action === "Login") {
                                    return <IconLogin size={18} />;
                                } else if (
                                    activity.action === "Create" &&
                                    activity.content_type === "booking"
                                ) {
                                    return <IconCalendarTime size={18} />;
                                } else if (
                                    activity.action === "Create" &&
                                    activity.content_type === "rating"
                                ) {
                                    return <IconStar size={18} />;
                                } else if (
                                    activity.action === "Create" &&
                                    activity.content_type === "entityservice"
                                ) {
                                    return <IconCirclePlus size={18} />;
                                } else if (activity.action === "Update") {
                                    return <IconEdit size={18} />;
                                } else if (activity.action === "Delete") {
                                    return <IconTrash size={18} />;
                                } else {
                                    return <IconGitCommit />;
                                }
                            };
                            return (
                                <Timeline.Item
                                    bullet={
                                        <ThemeIcon
                                            size={32}
                                            variant="filled"
                                            color={getBackground()}
                                            radius="xl"
                                        >
                                            {getIcon()}
                                        </ThemeIcon>
                                    }
                                    bulletSize={32}
                                    title={activity?.action}
                                    key={activity.id}
                                    ref={
                                        isLastActivityOfPage(index) ? ref : null
                                    }
                                >
                                    <Text color="dimmed" size="sm">
                                        {activity?.object_repr}
                                    </Text>
                                    <Text size="xs" mt={4}>
                                        {formatDistanceToNow(
                                            new Date(activity?.action_time)
                                        )}{" "}
                                        ago
                                    </Text>
                                </Timeline.Item>
                            );
                        })
                    ) : (
                        <Timeline.Item
                            bullet={<IconMoodSad2 size={18} />}
                            title="No activities"
                        >
                            <Text color="dimmed" size="sm">
                                You don&apos;t have any activity yet.
                            </Text>
                        </Timeline.Item>
                    )}
                    <Flex mt={8} align="center" justify={"center"}>
                        {isFetchingNextPage ? <Loader /> : null}
                    </Flex>
                </Timeline>
            </ScrollArea.Autosize>
        </>
    );
};

export default Activities;
