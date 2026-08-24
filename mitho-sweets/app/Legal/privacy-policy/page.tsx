"use client"
import React, { Suspense } from "react";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import ProfilePage from "@/components/Profile/Profile";
import Blog from "@/components/Blog";
import MithosweetsPrivacyPolicy from "@/components/mithosweets-privacy-policy";


export default function Page() {
    return (
        <Suspense fallback={
            <div style={{display: "flex", height: "100vh", alignItems: "center", justifyContent: "center"}}>
                <MithoSweetsLoader/>
            </div>
        }>
            <MithosweetsPrivacyPolicy/>
        </Suspense>
    );
}