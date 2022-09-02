import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useMeetingTypeCount(userId: string | null, axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["meetingTypeCount", userId],
        async () => await axios.get(
            "api/MeetingType/CountMeetingType",
            axiosConfig
        ).then((res) => res.data),
        { initialData: { "TotalCount": 0 } }

    )
}

export default useMeetingTypeCount;