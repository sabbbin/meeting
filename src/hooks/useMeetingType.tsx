import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";


function useMeetingType(axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["meetType"],
        async () => await axios.get(
            `api/MeetingType`,
            axiosConfig
        ).then((res) => res.data)
        , { initialData: [] }
    )
}

export default useMeetingType;