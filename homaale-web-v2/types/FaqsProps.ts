export interface FAQValueProps {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: {
        id: number;
        topic: {
            id: number;
            topic: string;
        };
        created_at: string;
        updated_at: string;
        deleted_at: any;
        status: string;
        title: string;
        content: string;
    }[];
}

export interface FAQTopicValueProps {
    total_pages: number;
    count: number;
    current: number;
    next: null;
    previous: null;
    page_size: number;
    result: Result[];
}
export interface Result {
    id: number;
    faq_count: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: null;
    status: string;
    topic: string;
}
