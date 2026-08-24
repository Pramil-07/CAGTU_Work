import { useQuery } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

import type { Bookmark, BookMarkApiResponse } from "@/types/bookmarks";

export type BookmarkType = "user" | "entityservice";

export const useBookmarks = (type: BookmarkType) => {
    return useQuery<Bookmark[]>(
        ["bookmarks", type],
        () =>
            axiosClient
                .get<BookMarkApiResponse>(urls.bookmark)
                .then((response) =>
                    response.data.result.filter((item) => item.type === type)
                ),
        { initialData: [] }
    );
};
export const useIsBookmarked = (type: BookmarkType, object_id?: string) => {
    const { data: bookmarks } = useBookmarks(type);
    return bookmarks.some((item) => item.object_id === object_id);
};
