"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"

interface ComponentSearchProps {
    className?: string
}

export function ComponentSearch({ className }: ComponentSearchProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSearch = (query: string) => {
        if (query.trim()) {
            router.push(`/ai?q=${encodeURIComponent(query)}`)
            setSearchQuery("")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch(searchQuery)
        } else if (e.key === "Escape") {
            setSearchQuery("")
        }
    }

    const handleClear = () => {
        setSearchQuery("")
        inputRef.current?.focus()
    }
    return (
        <div className={className} style={{ position: "relative", maxWidth: 400 }}>
            <div className="relative flex items-center gap-2">
                <Search size={16} className="text-gray-400 absolute left-3" />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search pages..."
                    className="w-full pl-10 pr-10 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 text-gray-400 hover:text-gray-600"
                        aria-label="Clear"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}
