import { JSXElementConstructor, Key, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from "react";
import router, { useRouter } from "next/router";
import Layout from "@/components/Layout/Layout";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {axiosClient} from "@/utils/axiosClient";
import axios from "axios";

const ConfirmationPage = () => {
    const router = useRouter();
    const [confirmId, setConfirmId] = useState<string | string[] | undefined>(undefined);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (router.isReady) {
            const { id } = router.query;
            if (!id) {
                setError("Token ID is missing");
                setIsLoading(false);
                return;
            }
            setConfirmId(Array.isArray(id) ? id[0] : id);
            setIsLoading(false);
        }
    }, [router.isReady, router.query]);
// console.log("token id",confirmId)

    useEffect(() => {
        if (!confirmId) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await axiosClient.get(`merchant/staff/confirm/${confirmId}`);
                setMessage(response.data.message || "Invalid Request, Something went wrong");
                setIsLoading(false);
                // console.log("product detail",response.data.message)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [confirmId]);

    if (isLoading) {
        return (
            <Layout currentTitle={"Confirmation Page"}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "80vh",
                    }}
                >
                    <HomaaleLoader />
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentTitle={"Confirmation Page"}>
            <div className="w-full">
                <div className="py-[120px] relative">
                    <div className="max-w-[1040px] mx-auto px-5 w-full box-border relative z-10">
                        <div
                            className="p-[30px_60px] bg-orange-50 rounded-xl border-b-2 border-[#cfd7df40] shadow-[0_30px_60px_-12px_rgba(50,50,93,0.25),0_18px_36px_-18px_rgba(0,0,0,0.3)]">
                            <div className="text-center">
                                <div className="w-[50%] mx-auto max-sm:w-[90%]">
                                    {message ? (
                                        <p className="text-gray-600 text-lg">{message}</p>
                                    ) : (
                                        <p className="text-gray-600 text-lg">Invalid or already used invitation token.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Centered Home Button */}
                    <div className="flex justify-center items-center mt-24 ">
                        <button
                            className="bg-orange-600 text-white border-none z-40 rounded px-4 py-2 text-base font-medium cursor-pointer flex items-center justify-center hover:bg-orange-700 transition-colors"
                            onClick={() => (window.location.href = "https://www.homaale.com/")}
                        >
                            <i className="fas fa-home mr-2"></i> Return to Homepage
                        </button>
                    </div>

                    {/* Background rectangles */}
                    <div className="absolute inset-0 pointer-events-none skew-y-[-12deg]">
                        <div
                            className="absolute inset-0 grid grid-rows-[repeat(auto-fill,48px)] grid-cols-[1fr_repeat(4,1fr)_repeat(12,minmax(0,calc(1040px/12)))_repeat(4,1fr)_1fr]">
                            <div className="bg-orange-600 col-start-[18] col-span-6 row-start-[5] h-full"/>
                            <div className="bg-[#fce3b1] col-start-[1] col-span-4 row-start-[4] h-[120%]"/>
                            <div className="bg-orange-400 col-start-5 col-span-3 row-start-[4] h-[120%]"/>
                            <div className="bg-orange-400 col-start-17 col-span-4 row-start-[4] h-[120%]"/>
                            <div className="bg-orange-600 col-start-[29] col-span-10 row-start-[4] h-full"/>
                            <div className="bg-orange-400 col-start-[20] col-span-4 row-start-[3] h-full"/>

                            <div className="bg-orange-300 col-start-1 col-span-7 row-start-[3] h-[100%] translate-y-[20%]"/>
                            <div className="bg-orange-500 col-start-3 z-40 col-span-9 row-start-[5] h-[100%] translate-y-[20%]"/>
                            <div className="bg-orange-500 col-start-[19] z-40 col-span-6 row-start-[4] h-[100%] translate-y-[-20%]"/>
                            {/*<div className="bg-orange-400 col-start-5 col-span-3 row-start-[5] h-[123%] translate-y-[-20%]"/>*/}
                    </div>
                </div>

            </div>

            {/* Load FontAwesome */}
            <script src="https://kit.fontawesome.com/a076d05399.js" crossOrigin="anonymous"></script>
            </div>
        </Layout>
    );
};

export default ConfirmationPage;
