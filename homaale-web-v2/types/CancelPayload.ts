export type CancelPayload = {
    cancellation_reason: string;
    cancellation_description: string;
    is_terms_condition?: boolean;
};
