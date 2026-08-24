import { Box, Button, Flex, Text } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";

import { useFollow } from "@/hooks/useFollow";
import type { MyFollowersProps } from "@/types/profile/MyFollowersProps";

import { toast } from "../common/Toast";

const FollowUserBlock = ({ user }: { user: MyFollowersProps["result"][0] }) => {
    const { mutate, isLoading: isFollowLoading } = useFollow();
    const queryClient = useQueryClient();

    const handleFollowClick = (user: string, type: string) => {
        mutate(
            {
                user: user,
                follow: type === "follow" ? true : false,
            },
            {
                onSuccess: () => {
                    type === "follow"
                        ? toast.success("followed successfully")
                        : toast.success("Unfollowed successfully");
                    queryClient.invalidateQueries(["tasker-listing"]);
                    queryClient.invalidateQueries(["get-followings"]);
                    queryClient.invalidateQueries(["get-followers"]);
                },
                onError: (err: any) => {
                    toast.error(err.response.data.message);
                },
            }
        );
    };
    return (
        <Flex key={user?.id} mb={24}>
            <Flex>
                <Image
                    src={
                        user?.profile_image ??
                        "/images/placeholder/personPlaceholder.jpg"
                    }
                    height={48}
                    width={48}
                    alt={`img-${user?.full_name}`}
                    placeholder="blur"
                    blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                    style={{
                        // objectFit: "contain",
                        borderRadius: "50%",
                    }}
                />
                <Box ml={8}>
                    <Text component="h4" mb={0}>
                        {user?.full_name}
                    </Text>
                    <p>{user?.designation}</p>
                </Box>
            </Flex>
            {user?.is_followed ? (
                <Button
                    variant="outline"
                    color="gray.8"
                    loading={isFollowLoading}
                    disabled={isFollowLoading}
                    onClick={() => {
                        handleFollowClick(user?.id, "unfollow");
                    }}
                >
                    Unfollow
                </Button>
            ) : (
                <Button
                    loading={isFollowLoading}
                    disabled={isFollowLoading}
                    onClick={() => {
                        handleFollowClick(user?.id, "follow");
                    }}
                >
                    Follow
                </Button>
            )}
        </Flex>
    );
};

export default FollowUserBlock;
