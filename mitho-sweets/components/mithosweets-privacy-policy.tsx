"use client"
import React, { useEffect, useState } from "react";
import { Box } from "@mantine/core";
import parse from "html-react-parser";
import apiClient from "@/axiosConfig";
import BreadCrumbs from "@/components/common/BreadCrumbs";

export interface Terms {
    id: number;
    created_at: string;      // ISO date string
    updated_at: string;      // ISO date string
    status: string;
    type: string;
    Content: string;         // HTML content
    Effective_Date: string;  // ISO date string
    slug: string;
}

export interface PolicyResponse {
    Status: string;
    data: Terms[];
}
const Page = () => {
    const [content, setContent] = useState<Terms[]>([]);

    useEffect(() => {
        const fetchPrivacyPolicy = async () => {
            try {
                const response = await apiClient.get(
                    "/locale/terms-and-policy/?type=Privacy",
                );
                console.log("data of privacy",response.data.data)
                setContent(response.data.data);
            } catch (error) {
                console.error("Error fetching privacy policy:", error);
                setContent([]); // Handle the error case if needed
            }
        };

        fetchPrivacyPolicy();
    }, []); // Empty dependency array means this effect runs only once when the component mounts

    return (
        <div className=" item-center justify-center bg-white rounded-lg">
            <div className="w-full bg-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-5">
                    <BreadCrumbs
                        currentTitle="Privacy policy"
                        items={[{name: "Home", href: "/"}]}
                    />
                    <h2 className="text-xl font-medium mb-2 mt-2 text-red-500">Privacy Policy</h2>
                    <hr className="border-gray-400"/>
                    {content.length > 0 ? (
                        <Box mt={8} className="space-y-6 min-h-[24rem]">
                            {content.map((item) => (
                                <div key={item.id}>
                                    <div className="prose">{parse(item.Content)}</div>
                                </div>
                            ))}
                        </Box>
                    ) : (
                        <p className="mt-5 min-h-[24rem]">No content available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Page;
