import { updateDoc } from "@firebase/firestore";
import { Box, Flex } from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { doc } from "firebase/firestore";
import Image from "next/image";
import React, { useCallback, useEffect, useRef } from "react";

import { db } from "@/firebase";
import { useChatStyles } from "@/styles/components/ChatStyles";
import type { MessageProps } from "@/types/chat/MessageProps";
import type { User } from "@/types/UserProps";
import { Decrypt } from "@/utils/chat/aes";

import type { ApiChatData } from "./ChatLayout";

const Message = ({
    message,
    profile,
    sender,
    chatId,
}: {
    message: MessageProps;
    profile: User;
    sender: ApiChatData["data"][0] | undefined;
    chatId: string;
}) => {
    const date = new Date(message?.date?.seconds * 1000);

    const { full_name, id } = profile ?? {};

    const formatedDate = formatDistanceToNow(new Date(date), {
        addSuffix: true,
    });
    const { classes } = useChatStyles();

    const ref: any = useRef<HTMLDivElement>();

    const handleReadMessage = useCallback(async () => {
        if (id && chatId) {
            await updateDoc(doc(db, "userChats", id), {
                [chatId + ".read"]: true,
            });
        }
    }, [chatId, id]);

    useEffect(() => {
        ref.current &&
            ref.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "end",
            });
        handleReadMessage();
    }, [handleReadMessage, message]);

    return (
        <Box className={classes.message} ref={ref}>
            <Flex
                justify={id !== message?.senderId ? "flex-start" : "inherit"}
                direction={id !== message?.senderId ? "inherit" : "row-reverse"}
                align={"center"}
                className="message__user"
            >
                <Image
                    src={
                        (id !== message?.senderId
                            ? sender?.profile_image
                            : profile?.profile_image) ??
                        "/images/placeholder/loadingLightPlaceHolder.jpg"
                    }
                    width={40}
                    height={40}
                    alt={`image`}
                    placeholder="blur"
                    blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                    style={{
                        objectFit: "contain",
                        borderRadius: "50%",
                    }}
                    className="img"
                />
                <h4>
                    {id !== message?.senderId ? sender?.full_name : full_name}
                </h4>
                {message?.date && <p>{formatedDate}</p>}
            </Flex>
            <Flex
                justify={id !== message?.senderId ? "flex-start" : "flex-end"}
            >
                <span
                    className={
                        id !== message?.senderId
                            ? "sender__content"
                            : "message__content"
                    }
                >
                    {message?.text ? Decrypt(message?.text.toString()) : ""}
                </span>
            </Flex>
        </Box>
    );
};

export default Message;
