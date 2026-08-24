import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";
import { getNextPageParam } from "utils/getNextPageParam";
import urls from "@/constants/urls";
import { store } from "@/store";
import type { BookMarkApiResponse } from "@/types/bookmarks";

export const useGetEntity = (
  is_bookmark: boolean,
  is_requested: boolean,
  query: string,
  ownerFilter: string
) => {
  return useInfiniteQuery(
    [
      "entity",
      is_requested,
      query,
      ownerFilter,
      store.getState().locationReducer.data.latitude,
      store.getState().locationReducer.data.longitude,
      store.getState().locationReducer.radius,
    ],
    async ({ pageParam = 1 }) => {
      // Get location data from Redux store
      const { latitude, longitude} = store.getState().locationReducer.data;
      const{radius}=store.getState().locationReducer

      if (is_bookmark) {
        const { data } = await axiosClient.get<BookMarkApiResponse>(
          `${urls.bookmark}?is_requested=${is_requested}&page_size=9${query}&page=${pageParam}`
        );
        console.log('Bookmark API request:', `${urls.bookmark}?is_requested=${is_requested}&page_size=9${query}&page=${pageParam}`);
        console.log('Bookmark response:', data);
        return data;
      } else {
        // Construct the entity API URL with additional parameters
        const res = await axiosClient.get(
          `${urls.entity.list}?is_requested=${is_requested}${ownerFilter}&page_size=9${query}&near_by=true&latitude=${latitude || ''}&longitude=${longitude || ''}&radius=${radius || ''}&page=${pageParam}`
        );
        console.log('Entity API request:', `${urls.entity.list}?is_requested=${is_requested}${ownerFilter}&page_size=9${query}&near_by=true&latitude=${latitude || ''}&longitude=${longitude || ''}&radius=${radius || ''}&page=${pageParam}`);
        console.log('Entity response:', res.data);
        return res.data;
      }
    },
    {
      getNextPageParam,
    }
  );
};
