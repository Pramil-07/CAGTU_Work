import type {EntityServiceLisitngProps} from "./EntityServiceLisitngProps";

export interface BookMarkApiResponse {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: Result[];
}

export type Bookmark = BookMarkApiResponse["result"][0];

export interface Result {
    id: number;
    user: string;
    type: string;
    data: EntityServiceLisitngProps["result"][0];
    created_at: string;
    updated_at: string;
    object_id: string;
    content_type: number;
    extra_data: Array<{
        latitude: number;
        longitude: number;
    }>
}
