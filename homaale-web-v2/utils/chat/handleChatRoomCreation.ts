import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";

import { toast } from "@/components/common/Toast";
import { db } from "@/firebase";

export type ChatRommCreationProps = {
    userID: string;
    taskerID: string;
};

/**
 * To create chat and update chatRoom
 * @param param0
 */

export const handleChatRoomCreation = async ({
    userID,
    taskerID,
}: ChatRommCreationProps) => {
    if (userID) {
        const combinedId =
            userID > taskerID
                ? userID + "_" + taskerID
                : taskerID + "_" + userID;

        try {
            const res = await getDoc(doc(db, "chats", combinedId));

            if (!res.exists()) {
                await setDoc(doc(db, "chats", combinedId), {
                    messages: [],
                });

                try {
                    await updateDoc(doc(db, "userChats", userID), {
                        [combinedId + ".userInfo"]: {
                            uid: taskerID,
                        },
                        [combinedId + ".date"]: serverTimestamp(),
                        [combinedId + ".read"]: true,
                    });
                } catch (error) {
                    console.log(
                        "🚀 ~ file: handleChatRoomCreation.ts:54 ~ error:",
                        error
                    );
                    toast.error("Chat Room creation failed");
                }

                await updateDoc(doc(db, "userChats", taskerID), {
                    [combinedId + ".userInfo"]: {
                        uid: userID,
                    },
                    [combinedId + ".date"]: serverTimestamp(),
                    [combinedId + ".read"]: true,
                });
            }
        } catch (error) {
            console.log(
                "🚀 ~ file: handleChatRoomCreation.ts:72 ~ error:",
                error
            );
            toast.error("Chat Room creation failed");
        }
    }
};
