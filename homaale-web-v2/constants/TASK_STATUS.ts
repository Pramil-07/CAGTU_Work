export enum TASK_STATUS {
    Initiated = "initiated",
    Pending = "pending",
    Open = "open",
    On_Progress = "on_progress",
    Completed = "completed",
    Closed = "closed",
    Cancelled = "cancelled",
}

export const TASK_STATUS_ARRAY = [
    {
        id: TASK_STATUS.Initiated,
        label: TASK_STATUS.Initiated,
        value: TASK_STATUS.Initiated,
    },
    {
        id: TASK_STATUS.Open,
        label: TASK_STATUS.Open,
        value: TASK_STATUS.Open,
    },
    {
        id: TASK_STATUS.Pending,
        label: TASK_STATUS.Pending,
        value: TASK_STATUS.Pending,
    },
    {
        id: TASK_STATUS.On_Progress,
        label: TASK_STATUS.On_Progress,
        value: TASK_STATUS.On_Progress,
    },
    {
        id: TASK_STATUS.Completed,
        label: TASK_STATUS.Completed,
        value: TASK_STATUS.Completed,
    },
    {
        id: TASK_STATUS.Closed,
        label: TASK_STATUS.Closed,
        value: TASK_STATUS.Closed,
    },
    {
        id: TASK_STATUS.Cancelled,
        label: TASK_STATUS.Cancelled,
        value: TASK_STATUS.Cancelled,
    },
];
