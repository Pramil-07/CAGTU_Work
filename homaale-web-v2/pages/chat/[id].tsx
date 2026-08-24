import { useRouter } from "next/router";
import React from "react";

import ChatBody from "@/components/chat/ChatBody";
import ChatLayout from "@/components/chat/ChatLayout";
import Layout from "@/components/Layout/Layout";
import { useUser } from "@/hooks/useUser";

const ChatIndividual = () => {
    const router = useRouter();
    const chatId = router.query.id as string;
    const destructChatId = chatId?.split("_");

    const { data: userData } = useUser();

    const { id } = userData ?? {};

    let senderId!: string;
    if (id && destructChatId) {
        if (destructChatId[0] === id) {
            senderId = destructChatId[1];
        } else senderId = destructChatId[0];
    }
    return (
        <Layout
            heading="Chat"
            title="Chat | Homaale"
            currentTitle="portal"
            breadCrumbsItems={[{ name: "chat", href: "/chat" }]}
        >
            <ChatLayout>
                {userData && id && (
                    <ChatBody
                        senderId={senderId}
                        userId={id}
                        profile={userData}
                    />
                )}
            </ChatLayout>
        </Layout>
    );
};

export default ChatIndividual;
