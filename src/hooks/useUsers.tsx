import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useUsers(axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["posts"],
        async () => await axios.get(
            "http://110.34.24.117:90/api/User/GetAllUser/10/1",
            axiosConfig
        ).then((res) => res.data)
        , { initialData: [] }
    )
}

export default useUsers;