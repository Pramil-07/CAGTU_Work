import { Suspense } from "react";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import ResetPassword from "@/components/reset-passwoed/ResetPassword";


export default function Page() {
    return (
        <Suspense fallback={<div><MithoSweetsLoader/></div>}>
            <ResetPassword/>
        </Suspense>
    );
}