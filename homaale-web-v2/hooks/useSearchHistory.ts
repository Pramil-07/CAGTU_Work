// hooks/useSearchHistory.ts
import { useEffect, useState, useRef } from "react";

const STORAGE_KEY = "searchHistory";
const MAX_ITEMS = 10;

export const useSearchHistory = () => {
    const [history, setHistory] = useState<string[]>([]);
    const isInitialMount = useRef(true);

    // Load + keep in sync
    useEffect(() => {
        const loadHistory = () => {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        setHistory(parsed);
                    }
                }
            } catch (e) {
                console.warn("Failed to parse search history", e);
            }
        };

        // Load immediately
        loadHistory();

        // Poll every 500ms (lightweight, works across tabs/chunks)
        const interval = setInterval(loadHistory, 500);

        // Also listen to storage events (cross-tab)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadHistory();
            }
        };
        window.addEventListener("storage", handleStorage);

        return () => {
            clearInterval(interval);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const addToHistory = (query: string) => {
        const q = query.trim();
        if (!q) return;

        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
        const filtered = existing.filter((h: string) => h !== q);
        const next = [q, ...filtered].slice(0, MAX_ITEMS);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setHistory(next); // Update immediately
        } catch (e) {
            console.warn("localStorage write failed", e);
        }
    };

    const clearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setHistory([]);
    };

    return { history, addToHistory, clearHistory };
};
