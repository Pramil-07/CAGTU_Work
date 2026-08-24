import { Suspense } from "react";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import VerifyEmail from "@/components/verifyEmail/VerifyEmail";



export default function Page() {
    return (
        <Suspense fallback={<div><MithoSweetsLoader/></div>}>
          <VerifyEmail/>
        </Suspense>
    );
}