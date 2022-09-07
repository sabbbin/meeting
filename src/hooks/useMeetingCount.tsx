import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useMeetingTypeCount(userId: string | null, axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["meetingCount", userId],
        async () => await axios.get(
            "api/Meeting/Count",
            axiosConfig
        ).then((res) => res.data),
        { initialData: { "TotalCount": 0 } }

    )
}

export default useMeetingTypeCount;