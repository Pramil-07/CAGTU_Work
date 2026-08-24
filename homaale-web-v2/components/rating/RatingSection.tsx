import {
    ActionIcon,
    Box,
    Flex,
    Menu,
    ScrollArea,
    Skeleton,
    Text,
} from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { IconArrowsSort, IconFilter } from "@tabler/icons-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { FILTER_DATA_REVIEW } from "@/constants/FilterDataReview";
import { SORTING_DATA_REVIEW } from "@/constants/SortingData";
import { useGetReview } from "@/hooks/useGetReview";
import { useUser } from "@/hooks/useUser";
import { useEntityServiceDetailStyles } from "@/styles/pages/EntityServiceDetailStyles";
import type { ReviewProps } from "@/types/ReviewProps";

import { CommentCard } from "./CommentCard";

const RatingSection = ({
    id,
    created_by,
    total,
    is_service,
    disabled,
}: {
    id: string;
    total: number;
    created_by: { full_name: string; profile_image: string; id: string };
    is_service: boolean;
    disabled?: boolean;
}) => {
    const [filter, setFilter] = useState<string>("");
    const [sort, setSort] = useState<string>("");

    const { classes, theme } = useEntityServiceDetailStyles();

    const {
        data,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        isLoading: reviewLoading,
    } = useGetReview(id, filter, sort, total, is_service);

    const reviews: ReviewProps["result"] = useMemo(
        () => data?.pages.map((page) => page.result).flat() ?? [],
        [data?.pages]
    );

    const containerRef = useRef<HTMLDivElement>(null);

    const { ref, entry } = useIntersection({
        root: containerRef.current,
        threshold: 1,
    });

    const isLastTaskerOnPage = (index: number) => index === reviews?.length - 1;

    useEffect(() => {
        if (entry?.isIntersecting) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entry]);

    const { data: userData } = useUser();

    let is_user: boolean;
    if (userData?.id === created_by?.id) {
        is_user = true;
    } else {
        is_user = false;
    }

    return (
        <Box className={classes.review}>
            <Flex className="review__header">
                <h4>Review</h4>
                <Flex justify={"flex-start"} gap={12}>
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <ActionIcon color={sort ? "orange.4" : "gray.7"}>
                                <IconArrowsSort />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {SORTING_DATA_REVIEW?.map((item, index) => (
                                <Menu.Item
                                    key={index}
                                    onClick={() => setSort(item?.value)}
                                >
                                    {item.label}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                    <Menu shadow="md" width={100}>
                        <Menu.Target>
                            <ActionIcon color={filter ? "orange.4" : "gray.7"}>
                                <IconFilter />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {FILTER_DATA_REVIEW?.map((item, index) => (
                                <Menu.Item
                                    key={index}
                                    onClick={() => setFilter(item?.value)}
                                >
                                    {item.label}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                </Flex>
            </Flex>
            <ScrollArea h={400} offsetScrollbars scrollbarSize={6}>
                {reviews?.length ? (
                    reviews?.map((item, index) => (
                        <div
                            key={index}
                            ref={isLastTaskerOnPage(index) ? ref : null}
                        >
                            {item?.review && (
                                <CommentCard
                                    reviewData={item}
                                    replyerName={created_by?.full_name}
                                    replyImage={created_by?.profile_image}
                                    is_user={is_user}
                                    disabled={disabled}
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <Flex mt={32}>
                        <Text
                            mx={"auto"}
                            size={20}
                            fw={500}
                            component={"p"}
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.homaaleSlate[4]
                                    : theme.colors.homaaleSlate[5]
                            }
                        >
                            No Review Available !
                        </Text>
                    </Flex>
                )}

                {total > 0 && reviewLoading && (
                    <Flex
                        justify={"flex-start"}
                        align={"flex-start"}
                        gap={20}
                        mt={20}
                    >
                        <Skeleton height={50} circle />
                        <Box w={"50%"}>
                            <Skeleton
                                height={20}
                                radius="xl"
                                w={"30%"}
                                mb={10}
                            />
                            <Skeleton height={10} mb={10} radius="xl" />
                            <Skeleton w={"15%"} height={10} radius="xl" />
                        </Box>
                    </Flex>
                )}
            </ScrollArea>
        </Box>
    );
};

export default RatingSection;
