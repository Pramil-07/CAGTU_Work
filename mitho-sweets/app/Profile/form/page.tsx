// /Profile/form/page.js
import React, { Suspense } from "react";
import ProfileForm from "@/components/Profile/ProfileForm";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";


export default function Page() {
    return (
        <Suspense fallback={
            <div style={{display: "flex", height: "100vh", alignItems: "center", justifyContent: "center"}}>
            <MithoSweetsLoader/>
        </div>
        }>
            <ProfileForm/>
        </Suspense>
    );
}