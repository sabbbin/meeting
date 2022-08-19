import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useUsers(axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["posts"],
        async () => await axios.get(
            "api/User/GetAllUser/3/1",
            axiosConfig
        ).then((res) => res.data)
        , { initialData: [] }
    )
}

export default useUsers;