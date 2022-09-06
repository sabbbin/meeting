import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useUsers(
  pageSize: number,
  pageNumber: number,
  filterField: string,
  axiosConfig: AxiosRequestConfig
) {
  return useQuery(
    ["users", pageSize, pageNumber, filterField],
    async () =>
      await axios
        .get(`api/User/GetAllUser`, axiosConfig)
        .then((res) => res.data),
    { initialData: [] }
  );
}

export default useUsers;
