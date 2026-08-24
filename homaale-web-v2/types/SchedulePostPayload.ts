export type SchedulePostPayload = {
    event: string;
    repeat_type: string;
    start_date: string | Date | null;
    end_date: string | Date | null;
    is_active: boolean;
    slots: any[];
};
