import React, { Suspense } from "react";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import LoginPage from "@/components/login/Login";



export default function Page() {
  return (
      <Suspense fallback={
        <div style={{display: "flex", height: "100vh", alignItems: "center", justifyContent: "center"}}>
          <MithoSweetsLoader/>
        </div>
      }>
        <LoginPage/>

      </Suspense>
  );
}