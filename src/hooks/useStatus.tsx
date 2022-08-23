import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

interface UserStatus {
    StatusId: number,
    StatusName: string,
    Description: string,
    OrderIdx: number
}

function useStatus(axiosConfig: AxiosRequestConfig) {
    return useQuery<UserStatus[]>(
        ["userStatus"],
        async () => await axios.get(
            "api/User/GetUserStatus",
            axiosConfig
        ).then((res) => res.data), {
        initialData: []
    }

    )
}

export default useStatus;