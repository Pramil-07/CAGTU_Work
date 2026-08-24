import React, { Suspense } from "react";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import ProfilePage from "@/components/Profile/Profile";


export default function Page() {
    return (
        <Suspense fallback={
            <div style={{display: "flex", height: "100vh", alignItems: "center", justifyContent: "center"}}>
                <MithoSweetsLoader/>
            </div>
        }>
            <ProfilePage/>
        </Suspense>
    );
}