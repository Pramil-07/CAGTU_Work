import { AspectRatio, Box, Text, Title } from "@mantine/core";
import Image from "next/image";
import React from "react";

import ChatLayout from "@/components/chat/ChatLayout";
import Layout from "@/components/Layout/Layout";

const Chat = () => {
    return (
        <Layout heading="Chat" currentTitle={"chat"}>
            <ChatLayout>
                <Box
                    sx={(theme) => ({
                        position: "sticky",
                        top: 64,
                        textAlign: "center",
                        [theme.fn.smallerThan("md")]: {
                            display: "none",
                        },
                    })}
                >
                    <AspectRatio ratio={16 / 9} mah={600}>
                        <Image
                            src={"/svgs/message.svg"}
                            fill
                            alt={`message-image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                            }}
                            className="img"
                        />
                    </AspectRatio>
                    <Title order={3} weight={500} size={28}>
                        Welcome to Homaale Chat
                    </Title>
                    <Text component="p" color={"gray.6"} size={16}>
                        Click on a user to start a conversation{" "}
                    </Text>
                </Box>
            </ChatLayout>
        </Layout>
    );
};

export default Chat;
