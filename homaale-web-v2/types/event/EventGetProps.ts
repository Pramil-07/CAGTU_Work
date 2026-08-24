export type EventGetProps = {
    active_dates: Array<string>;
    id: string;
    title: string;
    start: string;
    end: string;
    is_flexible: boolean;
    is_active: boolean;
    schedules: Array<{
        title: string;
        total_slots: number;
        id: string;
        event: string;
        repeat_type: number;
        start_date: string;
        end_date: string;
        guest_limit: number;
        is_active: boolean;
        slots: Array<{
            id: string;
            start: string;
            end: string;
        }>;
    }>;
    duration: string;
    guest_limit: number;
    all_shifts: Array<{
        date: string;
        slots: Array<{
            start: string;
            end: string;
        }>;
    }>;
};
