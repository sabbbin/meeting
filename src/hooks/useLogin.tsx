import { useMutation } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useLogin(axiosConfig: AxiosRequestConfig) {
    return useMutation(
        ["posts"],
        async () => await axios.post(
            "http://110.34.24.117:90/api/User/Login",
            axiosConfig
        ).then((res) => res.data)

    )
}

export default useLogin;