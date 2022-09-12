import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";


function getAgenda(meetTypeId: number | undefined, axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["getAgenda", meetTypeId],
        async () => await axios.get(
            `api/Minute/GetAgenda`,
            axiosConfig
        ).then((res) => res.data)
        , { initialData: [] }
    )
}

export default getAgenda;