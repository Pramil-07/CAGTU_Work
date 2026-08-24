export type ServiceOptionTypes = Array<{
    id: string;
    title: string;
    is_active: boolean;
    is_verified: boolean;
    commission: string;
    category: {
        id: number;
        name: string;
        level: number;
        slug: string;
    };
}>;
