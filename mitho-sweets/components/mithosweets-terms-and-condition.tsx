"use client"
import { Box } from "@mantine/core";
import React, { FC} from "react";
import { useEffect, useState } from "react";
import apiClient from "@/axiosConfig";
import parse from "html-react-parser";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import {Terms} from "@/components/mithosweets-privacy-policy";



const TermsConditions: FC = () => {
    const [content, setContent] = useState<Terms[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await apiClient.get("/locale/terms-and-policy/?type=Terms");
                console.log("response of terms",response.data.data);
                setContent(response.data.data);
            } catch (err) {
                setError("Failed to load terms and conditions.");
            }
        };
        fetchContent();
    }, []); // Empty dependency array to fetch only on initial mount
    return (
        <div className=" item-center justify-center bg-white rounded-lg">
            <div className="w-full bg-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-5">
                    <BreadCrumbs
                        currentTitle="Terms and Condition"
                        items={[{name: "Home", href: "/"}]}
                    />
                    <h2 className="text-xl font-medium mb-2 mt-2 text-red-500">Terms and Conditions</h2>
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
export default TermsConditions;
