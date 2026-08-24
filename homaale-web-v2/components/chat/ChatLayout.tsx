import type { DocumentData } from "@firebase/firestore";
import { onSnapshot } from "@firebase/firestore";
import { Box, Grid, Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { doc } from "firebase/firestore";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useState } from "react";
import React from "react";

import urls from "@/constants/urls";
import { db } from "@/firebase";
import { useGetCookieUser } from "@/hooks/useGetCookieUser";
import { useChatStyles } from "@/styles/components/ChatStyles";
import { axiosClient } from "@/utils/axiosClient";

import ChatCard from "./ChatCard";

export type ChatListProps = {
    date: string;
};

export type ApiChatData = {
    data: Array<{
        id: string;
        full_name: string;
        profile_image: string;
    }>;
};

const ChatLayout = ({ children }: { children: ReactNode }) => {
    const { classes } = useChatStyles();
    const user_id = useGetCookieUser();
    const [chatRoom, setChatRoom] = useState<DocumentData | ChatListProps>();

    const [users, setUsers] = useState<DocumentData>({});

    const { mutate } = useMutation<ApiChatData, Error, string[]>(
        async (payload) => {
            return await axiosClient.post(urls.user.chat, { users: payload });
        },
        {
            onSuccess: (data) => {
                const u = users;
                data.data.forEach((item) => {
                    u[item.id] = {
                        ...u[item.id],
                        user: item,
                    };
                });
                setUsers(u);
            },
        }
    );

    useEffect(() => {
        if (user_id) {
            const unsub = onSnapshot(doc(db, "userChats", user_id), (doc) => {
                setChatRoom(doc.data());
                doc.exists() &&
                    Object?.entries(doc.data() as unknown as any)?.forEach(
                        (chat: any) => {
                            users[chat[1]?.userInfo?.uid] = {
                                ...users[chat[1]?.userInfo?.uid],
                                chatId: chat[0],
                            };
                        }
                    );
                setUsers(users);
            });
            return () => {
                unsub();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user_id]);

    useEffect(() => {
        setTimeout(() => {
            mutate(Object.keys(users));
        }, 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box className={classes.root}>
            <Grid gutter={20}>
                <Grid.Col md={3.5}>
                    <Input
                        icon={<IconSearch size={16} />}
                        placeholder="Search User"
                        size={"md"}
                        mb={16}
                    />
                    {chatRoom
                        ? Object?.values(users)?.map((chat, index) => {
                              const fireData = Object.entries(chatRoom)
                                  .find((item) => item[0] === chat.chatId)
                                  ?.map((item) => item);
                              return (
                                  <ChatCard
                                      key={index}
                                      chat_id={chat.chatId}
                                      senderContent={
                                          fireData ? fireData[1] : []
                                      }
                                      user={chat.user}
                                  />
                              );
                          })
                        : "Book a Service/Task to start conversation"}
                </Grid.Col>
                <Grid.Col md={8}>{children}</Grid.Col>
            </Grid>
        </Box>
    );
};

export default ChatLayout;
