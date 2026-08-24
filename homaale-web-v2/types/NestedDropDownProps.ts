export type NestedDropDownProps = Array<{
        id: number;
        name: string;
        level: number;
        slug: string;
        icon?: string;
        task_count: number;
        child: Array<{
            id: number;
            name: string;
            level: number;
            slug: string;
            icon?: string;
            task_count: number;
            child: Array<any>;
            service_count: number;
        }>;
        service_count: number;
    }>;



