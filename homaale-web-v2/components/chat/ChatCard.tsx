import { Box, Flex, Indicator, Text } from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

import { useChatStyles } from "@/styles/components/ChatStyles";
import { Decrypt } from "@/utils/chat/aes";

import type { ApiChatData } from "./ChatLayout";

export interface SenderContentProps {
    sender_id: string;
    contents: {
        userInfo: { uid: string };
        lastMessage: { text: string };
        date: { seconds: number; nanoseconds: string };
        read: boolean;
    };
}

const ChatCard = ({
    chat_id,
    senderContent,
    user,
}: {
    chat_id: string;
    senderContent: SenderContentProps["contents"];
    user: ApiChatData["data"][0];
}) => {
    const { classes } = useChatStyles();
    const router = useRouter();

    return (
        <Box
            className={classes.card}
            onClick={() => router.push(`/chat/${chat_id}`)}
        >
            <Flex className="card__left">
                <Indicator position="bottom-end" zIndex={2} offset={6}>
                    <Image
                        src={
                            user?.profile_image
                                ? user?.profile_image
                                : "/images/placeholder/profilePlaceholder.png"
                        }
                        width={60}
                        height={60}
                        alt={`image`}
                        placeholder="blur"
                        blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                        style={{
                            objectFit: "contain",
                            borderRadius: "50%",
                        }}
                        className="img"
                    />
                </Indicator>
                <Box className="card__left--content">
                    <h5>{user?.full_name}</h5>
                    <Text
                        component={"p"}
                        truncate
                        lineClamp={1}
                        sx={{ whiteSpace: "break-spaces" }}
                    >
                        {senderContent?.lastMessage?.text
                            ? Decrypt(senderContent?.lastMessage?.text)
                            : "New Chat Started"}
                    </Text>
                </Box>
            </Flex>
            <Box className="card__right">
                <p>
                    {senderContent?.date
                        ? formatDistanceToNow(
                              new Date(
                                  new Date(senderContent?.date?.seconds * 1000)
                              ),
                              {
                                  addSuffix: true,
                              }
                          )
                        : ""}
                </p>
                {senderContent?.read ? "" : <span>new</span>}
            </Box>
        </Box>
    );
};

export default ChatCard;
