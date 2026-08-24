export type EventPostPayload = {
    duration: string;
    entity_service: string;
    title: string;
    description: string;
    is_flexible: boolean;
    start: string;
    end: string;
    guest_limit: number | null;
    is_active: boolean;
};

export interface ExtendedEventPostPayload extends EventPostPayload {
    is_unlimited_guest?: boolean;
    hours?: number | null;
    minutes?: string;
}
