// components/SearchSidebar.tsx
"use client";

import { useRouter } from "next/navigation";
import { useSearchHistory } from "@/hooks/useSearchHistory";

interface SearchSidebarProps {
    currentQuery?: string;
}

export default function SearchSidebar({ currentQuery = "" }: SearchSidebarProps) {
    const { history, clearHistory } = useSearchHistory();
    const router = useRouter();

    return (
        <div className="w-64 p-4 border-r border-gray-200 bg-gray-50 min-h-screen sticky top-0">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Search History</h3>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="text-xs text-red-600 hover:text-red-800">
                        Clear
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <p className="text-gray-400 text-sm">No recent searches</p>
            ) : (
                <ul className="space-y-2">
                    {history.map((q, i) => (
                        <li
                            key={i}
                            onClick={() => router.push(`/ai?q=${encodeURIComponent(q)}`)}
                            className={`cursor-pointer transition-colors ${
                                q === currentQuery
                                    ? "text-gray-800 font-medium underline"
                                    : "text-gray-600 hover:underline"
                            }`}
                        >
                            {q}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
