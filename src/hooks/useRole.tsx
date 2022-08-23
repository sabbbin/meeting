import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useRole(axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["posts"],
        async () => await axios.get(
            "api/User/User/GetAllRole",
            axiosConfig
        ).then((res) => res.data)

    )
}

export default useRole;