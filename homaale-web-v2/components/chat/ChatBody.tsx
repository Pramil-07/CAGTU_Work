import { Box, Flex, Input, ScrollArea, Text, Tooltip } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import type { DocumentData } from "firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import type { ApiChatData } from "@/components/chat/ChatLayout";
import Message from "@/components/chat/Message";
import Ellipsis from "@/components/common/Ellipsis";
import FormButton from "@/components/common/form/FormButton";
import urls from "@/constants/urls";
import { db } from "@/firebase";
import { useChatStyles } from "@/styles/components/ChatStyles";
import type { MessageProps } from "@/types/chat/MessageProps";
import type { User } from "@/types/UserProps";
import { axiosClient } from "@/utils/axiosClient";
import { Encrypt } from "@/utils/chat/aes";
import {useDark} from "@/utils/helpers";
import {useMantineTheme} from "@mantine/core";
import { useBrandData } from "@/brand/BrandContext";
import {IconAlertCircle} from "@tabler/icons-react";

const ChatBody = ({
    userId,
    senderId,
    profile,
    is_fragmented = false,
}: {
    senderId: string;
    userId: string;
    profile: User;
    is_fragmented?: boolean;
}) => {
    const { classes } = useChatStyles();

    const [message, setMessage] = useState<DocumentData>();
    const {brandData } =useBrandData()

    const [text, setText] = useState("");
    const dark = useDark();
    const theme = useMantineTheme();
    const chatId =
        userId > senderId ? userId + "_" + senderId : senderId + "_" + userId;

    const handleSend = async () => {
        await updateDoc(doc(db, "chats", chatId), {
            messages: arrayUnion({
                text: Encrypt(text),
                senderId: userId,
                date: Timestamp.now(),
            }),
        });

        {
            userId &&
                (await updateDoc(doc(db, "userChats", userId), {
                    [chatId + ".lastMessage"]: {
                        text: Encrypt(text),
                    },
                    [chatId + ".date"]: serverTimestamp(),
                }));
        }

        await updateDoc(doc(db, "userChats", senderId), {
            [chatId + ".lastMessage"]: {
                text: Encrypt(text),
            },
            [chatId + ".date"]: serverTimestamp(),
            [chatId + ".read"]: false,
        });
        setText("");
    };

    const { data } = useQuery<ApiChatData["data"][0]>(
        ["chat-detail", senderId],
        async () => {
            try {
                const { data } = await axiosClient.get(
                    `${urls.user.chat}${senderId}/`
                );
                return data;
            } catch (error) {
                console.log(
                    "🚀 ~ file: [id].tsx:96 ~ const{data}=useQuery ~ error:",
                    error
                );
            }
        },
        { enabled: !!senderId }
    );

    const { full_name, profile_image } = data ?? ({} as ApiChatData["data"][0]);

    useEffect(() => {
        if (chatId) {
            const unsub = onSnapshot(doc(db, "chats", chatId), (doc) => {
                doc.exists() && setMessage(doc.data().messages);
            });

            return () => {
                unsub();
            };
        }
    }, [chatId]);

    function validateText(inputText: string) {
        // Regular expressions to match email and phone number formats
        const normalized = inputText.replace(/\D/g, "");
        const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /\+?\d{1,3}?[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;

        // Check if input text matches email or phone number format
        return !(emailRegex.test(inputText) || phoneRegex.test(normalized));

    }

    const [error, setError] = useState(false);

    return (
        <>
       <Flex style={{
            fontSize: "Small",
            padding: "0px 30px",
            color: "red",
        }}>

       </Flex>
        <Box className={classes.chat} mb={30}>
             <Flex className="chat__header">
                <Flex className="chat__header--left">
                    <Image
                        src={
                            profile_image
                                ? profile_image
                                : "/images/placeholder/profilePlaceholder.png"
                        }
                        width={50}
                        height={50}
                        alt={`image`}
                        placeholder="blur"
                        blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                        style={{
                            objectFit: "contain",
                            borderRadius: "50%",
                        }}
                        className="img"
                    />
                    <h4>{full_name}</h4>
                </Flex>
                <Flex className="chat__header--right">
                    {/* <IconUserPlus color="#64748b" size={18} /> */}
                    <Ellipsis type={"chat"} />
                </Flex>
            </Flex>
            <ScrollArea
                h={is_fragmented ? 350 : 650}
                className="chat__content"
                scrollbarSize={6}
            >
                {profile && message?.length ? (
                    message?.map((message: MessageProps, index: number) => (
                        <Message
                            key={index}
                            message={message}
                            profile={profile}
                            sender={data}
                            chatId={chatId}
                        />
                    ))
                ) : (
                    <Flex justify={"center"} mt={20}>
                        <h4>Start Conversation</h4>
                    </Flex>
                )}
            </ScrollArea>
            {/*{error ? <Text>No email or phone</Text> : ""}*/}
            {error ? <Text ml={30} color={"red"}>{`⚠️Please don't share your personal information like phone number, emails or social media. If any fraud or any
                other illegal linked with this then ${brandData.name} won't be responsible.`}</Text> : ""}

            <form
                className="chat__input"
                onSubmit={(e) => {
                    e.preventDefault();

                    if (!validateText(text)) {
                        setError(true);
                        return;
                    }

                    setError(false);
                    handleSend();
                }}
            >
                <Input
                    value={text}
                    w={"100%"}
                    placeholder={"Type your message"}
                    onChange={(e: any) => {
                        if (validateText(e.target.value) === false) {
                            setError(true);
                        } else {
                            setError(false);
                        }
                        setText(e.target.value);
                    }}
                    size="md"
                />
                <FormButton
                    name={"Send"}
                    size="md"
                    type="submit"
                    id={"message-send"}
                    disabled={!text}
                />
            </form>
        </Box>
        </>
    );
};

export default ChatBody;
