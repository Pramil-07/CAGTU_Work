import { doc, getDoc, setDoc } from "firebase/firestore";

import { toast } from "@/components/common/Toast";
import { db } from "@/firebase";

export type UserCreationProps = {
    userID: string;
    taskerID: string;
};

/**
 * To create user and chatRoom in firestore
 * @param param0
 */

export const handleUserCreation = async ({
    userID,
    taskerID,
}: UserCreationProps) => {
    try {
        const user = await getDoc(doc(db, "users", userID));
        if (!user.exists()) {
            await setDoc(doc(db, "users", userID), {
                uuid: userID,
                is_active: true,
                created_on: new Date(),
            });
        }
    } catch (error) {
        console.log("🚀 ~ file: handleUserCreate.ts:43 ~ error:", error);
        toast.error("User creation failed");
    }
    try {
        const tasker = await getDoc(doc(db, "users", taskerID));
        if (!tasker.exists())
            await setDoc(doc(db, "users", taskerID), {
                uuid: taskerID,
                is_active: true,
                created_on: new Date(),
            });
    } catch (error) {
        toast.error("Tasker creation failed");
        console.log("🚀 ~ file: handleUserCreate.ts:28 ~ error:", error);
    }
    try {
        const userChat = await getDoc(doc(db, "userChats", userID));
        if (!userChat.exists()) await setDoc(doc(db, "userChats", userID), {});
    } catch (error) {
        console.log("🚀 ~ file: handleUserCreate.ts:65 ~ error:", error);
        toast.error("User Chat creation failed");
    }
    try {
        const taskerChat = await getDoc(
            doc(db, "userChats", taskerID ? taskerID : "")
        );
        if (!taskerChat.exists())
            await setDoc(doc(db, "userChats", taskerID), {});
    } catch (error) {
        toast.error("Tasker Chat creation failed");
        console.log("🚀 ~ file: handleUserCreate.ts:38 ~ error:", error);
    }
};
