export interface UserActivityApiResponse {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: Activity[];
    length?: number;
}

export interface Activity {
    id: number;
    content_type: string;
    action_time: string;
    object_id: string;
    object_repr: string;
    action: string;
    change_message: string;
    user: string;
}
