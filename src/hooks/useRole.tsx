import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useRole(axiosConfig: AxiosRequestConfig) {
    return useQuery<[]>(
        ["userRole"],
        async () => await axios.get(
            "api/User/GetAllRole",
            axiosConfig
        ).then((res) => res.data), {
        initialData: []
    }

    )
}

export default useRole;