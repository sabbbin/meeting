import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";
import axios, { AxiosRequestConfig } from "axios";

function useMeetingType(
  pageSize: number,
  pageNumber: number,
  sortCol: any,
  axiosConfig: AxiosRequestConfig
) {
  return useQuery(
    ["meetType", pageSize, pageNumber, sortCol],
    async () =>
      await axios.get(`api/MeetingType`, axiosConfig).then((res) => res.data),
    { initialData: [] }
  );
}

export default useMeetingType;
