import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";


function useUsers(pageSize: number, pageNumber: number, axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["posts", pageSize, pageNumber],
        async () => await axios.get(
            `api/User/GetAllUser`,
            axiosConfig
        ).then((res) => res.data)
        , { initialData: [] }
    )
}

export default useUsers;