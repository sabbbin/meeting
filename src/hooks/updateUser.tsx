import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

interface IUpdateUser {
    userId: number,
    fullName: string,
    userName: string,
    email: string,
    roleId: number,
    statusId: number
}

function updateUser(axiosConfig: AxiosRequestConfig) {
    return useQuery<IUpdateUser[]>(
        ["updateUser"],
        async () => await axios.get(
            "api/User/UpdateUser",
            axiosConfig
        ).then((res) => res.data),
        { initialData: [] }

    )
}

export default updateUser;