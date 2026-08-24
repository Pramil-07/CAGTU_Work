import type { TaskerProps } from "./TaskerProps";

export type ExploreTaskersProps = {
    top_tasker: TaskerProps["result"];
    top_rated: TaskerProps["result"];
    you_may_like: TaskerProps["result"];
    nearby: TaskerProps["result"];
};
