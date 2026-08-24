"use client";

import React, { useEffect, useState } from "react";
import { axiosClient } from "@/utils/axiosClient";
import { PAGE_INDEX } from "@/staticData/keywordsForSearch";
import { useBrandData } from "@/brand/BrandContext";
import { useHoroscopeSearch } from "@/hooks/useHoroscopeSearch";
import Link from "next/link";

const STOPWORDS = ["a", "an", "the", "of", "in", "on", "at", "for", "to", "and", "or", "is", "are", "by"];

interface SearchUrlResultsProps {
    query: string;
}

export default function SearchUrlResults({ query }: SearchUrlResultsProps) {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { brandData } = useBrandData();
    const resolvedPages = useHoroscopeSearch();

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        const searchAll = async () => {
            setLoading(true);

            // 1. Keyword matching from PAGE_INDEX
            const terms = query
                .toLowerCase()
                .split(/\s+/)
                .filter((t) => t.length > 0 && !STOPWORDS.includes(t));

            const pageResults = resolvedPages.map((page) => {
                let score = 0;
                terms.forEach((term) => {
                    page.keywords.forEach((keyword) => {
                        if (keyword.toLowerCase().includes(term)) score += 1;
                    });
                });
                return { ...page, score, isRoute: false };
            }).filter((p) => p.score > 0);

            // 2. Explore route suggestion
           /* const exploreResult = {
                path: `/explore?search=${encodeURIComponent(query)}`,
                title: "Explore All Results",
                description: `See all tasks, services, products, and hotels for "${query}"`,
                score: 10,
                isRoute: true,
            };*/

            // 3. API results (services, products, taskers)
            const apiResults: any[] = [];
            try {
                const urls = [
                    `/task/entity/service/?is_requested=true&search=${encodeURIComponent(query)}`,
                    `/task/entity/service/?is_requested=false&search=${encodeURIComponent(query)}`,
                    `/product/search/?search=${encodeURIComponent(query)}`,
                    `/tasker/?search=${encodeURIComponent(query)}`,
                ];

                for (const url of urls) {
                    const res = await axiosClient.get(url);
                    const list = res.data.results || res.data.result || [];

                        list.forEach((item: any) => {
                            apiResults.push({
                                path: url.includes("product") ? `/products/${item.id}` : url.includes("tasker") ? `/tasker/${item.user?.id}` : url.includes("/task/entity/service/?is_requested=true")
                                    ? `/tasks/${item.id}`: url.includes("/task/entity/service/?is_requested=false") ? `/services/${item.id}` : "/explore",
                                title: item.title || item.name || item.full_name,
                                description: item.description || item.bio || "View details",
                                score: 5,
                                isRoute: false,
                            });
                        });
                }
            } catch (err) {
                console.error("Failed to fetch API results", err);
            }

            // Combine & sort
            const all = [...pageResults, ...apiResults];
            all.sort((a, b) => (b.score || 0) - (a.score || 0));

            setResults(all.slice(0, 12));
            setLoading(false);
        };

        searchAll();
    }, [query]);

    if (!query.trim() ) return null;

    return (
        <div className="mt-6 border-t pt-2">
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            ) : results.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">
                    No search results found for {query}.
                </p>
            ) : (
                <div className="">
                    {results.map((result) => (
                        <Link
                            href={result.path}
                            key={result.path + result.title}
                            className="block group hover:bg-gray-50 p-4 -mx-4 rounded-lg transition"
                        >
                            <p className="text-sm text-green-700 font-medium mb-1">
                                {brandData.metaData.ogUrl.replace(/\/$/, "")}
                                {result.path}
                            </p>
                            <h3 className="text-xl font-medium text-blue-600 group-hover:underline">
                                {result.title}
                            </h3>
                            <p
                                className="text-gray-700 text-sm mt-1 line-clamp-2"
                                dangerouslySetInnerHTML={{__html: result.description}}
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
