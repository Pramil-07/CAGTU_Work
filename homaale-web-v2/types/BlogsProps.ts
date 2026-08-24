export interface BlogProps {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: Array<{
        id: number;
        likes: number;
        views: number;
        created_at: string;
        author: string;
        blog_type: string;
        tags: Array<{
            id: number;
            name: string;
        }>;
        is_deleted: boolean;
        updated_at: string;
        deleted_at: any;
        status: string;
        title: string;
        slug: string;
        image: string;
        comment: boolean;
        is_active: boolean;
        category: string;
        published_status: string;
        preview_content: string;
    }>;
}
export interface BlogDetailData {
    status: string;
    is_liked: boolean;
    data: {
        id: number;
        created_at: string;
        likes: number;
        views: number;
        comments: Array<any>;
        author: string;
        tags: Array<any>;
        is_deleted: boolean;
        updated_at: string;
        deleted_at: any;
        status: string;
        title: string;
        slug: string;
        image: string;
        content: string;
        comment: boolean;
        is_active: boolean;
        category: string;
        published_status: string;
        blog_type: string;
        related_blogs: Array<{
            id: number;
            likes: number;
            views: number;
            created_at: string;
            author: string;
            blog_type: string;
            tags: Array<{
                id: number;
                name: string;
            }>;
            is_deleted: boolean;
            updated_at: string;
            deleted_at: any;
            status: string;
            title: string;
            slug: string;
            image: string;
            comment: boolean;
            is_active: boolean;
            category: string;
            published_status: string;
            preview_content: string;
        }>;
    };
}
