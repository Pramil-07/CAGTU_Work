export interface BlogSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: BlogResult[];
}
export interface BlogDraftSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: BlogDraftResult[];
}

export interface BlogResult {
    id: number;
    title: string;
    author: string;
    blog_type: string;
    category: string;
    comment: boolean;
    content: string;
    image: string;
    is_active: boolean;
    is_deleted: boolean;
    likes: number;
    views: number;
    published_status: string;
    slug: string;
    status: string;
    tags: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}
export interface BlogDraftResult {
    id: number;
    title: string;
    author: {
        first_name: string;
        last_name: string;
        profile_image: string;
    };
    blog_type: string;
    category: string;
    comment: boolean;
    content: string;
    image: string;
    slug: string;
    status: string;
    tags: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}
