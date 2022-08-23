import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useCount(axiosConfig: AxiosRequestConfig) {
    return useQuery(
        ["userCount"],
        async () => await axios.get(
            "api/User/CountUser",
            axiosConfig
        ).then((res) => res.data),
        { initialData: { "TotalCount": 0 } }

    )
}

export default useCount;