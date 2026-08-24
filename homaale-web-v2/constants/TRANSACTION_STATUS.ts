export enum TRANSACTION_STATUS {
    Initiated = "initiated",
    pending = "pending",
    dispute = "on dispute",
    Completed = "completed",
    reverted = "reverted",
    settled = "settled",
    Penalty = "penalty",
}

export const TRANSACTION_STATUS_ARRAY = [
    {
        id: TRANSACTION_STATUS.Initiated,
        label: TRANSACTION_STATUS.Initiated,
        value: TRANSACTION_STATUS.Initiated,
    },
    {
        id: TRANSACTION_STATUS.pending,
        label: TRANSACTION_STATUS.pending,
        value: TRANSACTION_STATUS.pending,
    },
    {
        id: TRANSACTION_STATUS.dispute,
        label: TRANSACTION_STATUS.dispute,
        value: TRANSACTION_STATUS.dispute,
    },
    {
        id: TRANSACTION_STATUS.Completed,
        label: TRANSACTION_STATUS.Completed,
        value: TRANSACTION_STATUS.Completed,
    },
    {
        id: TRANSACTION_STATUS.reverted,
        label: TRANSACTION_STATUS.reverted,
        value: TRANSACTION_STATUS.reverted,
    },
    {
        id: TRANSACTION_STATUS.settled,
        label: TRANSACTION_STATUS.settled,
        value: TRANSACTION_STATUS.settled,
    },
    {
        id: TRANSACTION_STATUS.Penalty,
        label: TRANSACTION_STATUS.Penalty,
        value: TRANSACTION_STATUS.Penalty,
    },
];
