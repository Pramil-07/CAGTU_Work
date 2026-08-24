import React from "react";
import {useDark} from "@/utils/helpers";
import {useMantineTheme} from "@mantine/core";

const SkeletonReviews: React.FC = () => {
    const dark = useDark()
    const theme = useMantineTheme();

    return (
        <div  style={{
            background:   dark? theme.colors.dark[6] : ""
        }} className="flex flex-col mt-8 rounded-3xl shadow-sm border border-lightgray p-6">
                {/* Review Card Skeleton */}
                <div className="flex gap-4 items-start">
                    <div style={{
                     background:   dark? "gray" : "lightgray"
                    }}
                         className="w-12 h-12 rounded-full animate-pulse" />
                    <div className="flex-1">
                        <div className="flex gap-3 items-center">
                            <div  style={{
                                background:   dark? "gray" : "lightgray"
                            }}  className="h-5 w-24 rounded animate-pulse" />
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div style={{
                                        background:   dark? "gray" : "lightgray"
                                    }}
                                         key={i} className="h-4 w-4 rounded-full animate-pulse" />
                                ))}
                            </div>
                            <div style={{
                                background:   dark? "gray" : "lightgray"
                            }}  className="h-4 w-6 rounded animate-pulse" />
                        </div>
                        <div style={{
                            background:   dark? "gray" : "lightgray"
                        }}  className="mt-2 h-4 w-1/2 rounded animate-pulse" />
                        <div style={{
                            background:   dark? "gray" : "lightgray"
                        }}  className="mt-4 h-8 w-3/4 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        // </div>
    );
};

export default SkeletonReviews;
