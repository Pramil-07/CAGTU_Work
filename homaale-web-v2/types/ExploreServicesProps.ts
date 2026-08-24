import type { EntityServiceLisitngProps } from "./EntityServiceLisitngProps";

export type ExploreServicesProps = {
    mostly_booked: EntityServiceLisitngProps["result"];
    trending_services: EntityServiceLisitngProps["result"];
    you_may_like: EntityServiceLisitngProps["result"];
    top_rated: EntityServiceLisitngProps["result"];
    nearby: EntityServiceLisitngProps["result"];
};
