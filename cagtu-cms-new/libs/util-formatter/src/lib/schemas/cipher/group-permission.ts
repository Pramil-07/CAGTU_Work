export interface GroupSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: GroupResult[];
}

export interface GroupResult {
    id: number | null;
    name: string;
    permissions: string[];
}

export interface ResourceSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: ResourceResult[];
}

export interface ResourceResult {
    id: number | null;
    name: string;
    sub_permission: string;
    created_at: string;
}
