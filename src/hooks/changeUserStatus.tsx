import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

interface IChnageStatus {
    userId: number,
    statusId: number
}

function changeUserStatus(axiosConfig: AxiosRequestConfig) {
    return useQuery<IChnageStatus[]>(
        ["changeUserStatus"],
        async () => await axios.get(
            "api/User/ChangeStatus",
            axiosConfig
        ).then((res) => res.data),
        { initialData: [] }

    )
}

export default changeUserStatus;