export interface CreateBlogFormValueProps {
    id?: string;
    title: string;
    content: string;
    blog_type: string;
    category: string[];
    tags: string[];
    comment: boolean;
    image: any[];
    imagePreviewUrl?: any[];
    published_status?: string;
}
