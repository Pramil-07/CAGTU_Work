export interface RoleSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: RoleResult[];
}

export interface RoleResult {
    id: number | null;
    name: string;
}
