"use client";

import { Notifications } from "@mantine/notifications";
import React from "react";

export default function NotificationsProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Notifications position="top-right" />
            {children}
        </>
    );
}
