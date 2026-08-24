import React, { Suspense } from "react";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import Shop from "../../components/Shop";

export default function Page() {
  return (
      <Suspense fallback={
          <div style={{display: "flex", height: "100vh", alignItems: "center", justifyContent: "center"}}>
              <MithoSweetsLoader/>
          </div>
      }>
          <Shop/>
      </Suspense>
  );
}