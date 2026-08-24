export type SupportPayload = {
    reason: string | null;
    type: number | string;
    description: string;
};

export interface ReportPayload extends SupportPayload {
    model?: string;
    object_id?: string;
}
