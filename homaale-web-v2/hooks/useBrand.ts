export function useBrand() {
    if (typeof window === "undefined") return process.env.NEXT_PUBLIC_BRAND || "homaale";
    return window.location.hostname.includes("localhost:3006") ? "cagtu" : process.env.NEXT_PUBLIC_BRAND || "homaale";
}
