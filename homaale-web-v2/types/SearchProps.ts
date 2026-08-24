import type { EntityServiceLisitngProps } from "./EntityServiceLisitngProps";
import type { TaskerProps } from "./TaskerProps";

export type SearchProps = {
    task: EntityServiceLisitngProps["result"];
    service: EntityServiceLisitngProps["result"];
    tasker: TaskerProps["result"];
};
