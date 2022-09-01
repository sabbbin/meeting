import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";


function useUserMeetingType(userId: string | null, axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["userMeetType", userId],
        async () => await axios.get(
            `api/MeetingType/${userId}`,
            axiosConfig
        ).then((res) => res.data)
        , { initialData: [] }
    )
}

export default useUserMeetingType;