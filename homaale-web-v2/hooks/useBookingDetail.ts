import {useQuery} from "@tanstack/react-query";
import {TaskBookDetailProps} from "@/types/booking/TaskBookDetailProps";
import {axiosClient} from "@/utils/axiosClient";
import urls from "@/constants/urls";

export const useBookingDetail = (taskId?: string) => {
    console.log("id useBookingDetail", taskId);
    return useQuery<TaskBookDetailProps>(
        ["bookingDetail", taskId],
        async () => {
            const {data} = await axiosClient.get<TaskBookDetailProps>(`${urls.booking.new_task_detail}${taskId}/`);
            return data;
        },
        {enabled: !!taskId}
    )

}
