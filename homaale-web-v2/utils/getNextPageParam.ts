export const getNextPageParam = <T extends { next: string }>(lastpage: T) => {
    try {
        const url = new URL(lastpage.next);
        const nextPage = url.searchParams.get("page");
        return nextPage ? parseInt(nextPage) : undefined;
    } catch {
        return undefined;
    }
};
