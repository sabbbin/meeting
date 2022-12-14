import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";


function useMeetingType(pageSize: number, pageNumber: number, axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["meetType", pageSize, pageNumber],
        async () => await axios.get(
            `api/MeetingType`,
            axiosConfig
        ).then((res) => res.data)
        , { initialData: [] }
    )
}

export default useMeetingType;