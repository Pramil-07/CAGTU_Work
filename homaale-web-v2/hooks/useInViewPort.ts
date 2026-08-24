import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";

export const useInViewPort = <TElement extends HTMLElement>(
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
) => {
    const ref = useRef<TElement | null>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                setIsIntersecting(entry.isIntersecting);
                if (entry.isIntersecting) {
                    callback(entry);
                }
            }
        }, options);
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [callback, options, ref]);

    return { isIntersecting, ref };
};
