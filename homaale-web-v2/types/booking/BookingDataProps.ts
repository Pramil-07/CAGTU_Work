import type { EntityServiceDetailProps } from "../EntityServiceDetailProps";

export type BookingDataProps = Pick<
    EntityServiceDetailProps,
    | "budget_from"
    | "budget_to"
    | "payable_from"
    | "payable_to"
    | "is_range"
    | "is_requested"
    | "is_negotiable"
    | "is_online"
    | "budget_type"
    | "currency"
    | "city"
    | "service"
    | "title"
    | "location"
    | "is_negotiable"
    | "event"
    | "description"
    | "highlights"
    | "created_by"
    | "images"
    | "videos"
    | "id"
> & { entity_service?: string };
