import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useRoleById(RoleId: number, axiosConfig: AxiosRequestConfig) {
    return useQuery<[]>(
        ["userRoleById", RoleId],
        async () => await axios.get(
            `api/User/GetAllRole/${RoleId}`,
            axiosConfig
        ).then((res) => res.data), {
        initialData: []
    }

    )
}

export default useRoleById;