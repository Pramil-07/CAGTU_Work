export interface TimeSlot {
    id: number;
    start_time: string; // Time in HH:mm:ss format
    status?: "available" | "booked" | "unavailable"; // Possible statuses
    seat_count: number;
    open_at: string; // ISO 8601 date-time string
    close_at: string | null; // ISO 8601 date-time string or null
    end_time: string; // Time in HH:mm:ss format
    is_active: boolean;
    staff?: number | null;
    staff_name?: string;
}

export interface ServiceTimeSlot {
    id?: number;
    entity_service: string; // UUID
    entity_service_title: string;
    time_slots: TimeSlot[];
}

export interface AvailableSlotProps {
    id: string; // UUID
    service_time_slots: ServiceTimeSlot[];
    merchant: string; // UUID
    is_active: boolean;
    date: string; // ISO 8601 date

}
