import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";
import axios, { AxiosRequestConfig } from "axios";
import { IAgenda } from "../Tables/agendaTable";

function useAgenda(
  pageSize: number,
  pageNumber: number,
  userId: string | null,
  sortCol: SortingState,
  axiosConfig: AxiosRequestConfig
) {
  return useQuery<IAgenda[]>(
    ["Agenda", pageSize, pageNumber, userId, sortCol, axiosConfig],
    () => axios.get("api/MeetingAgenda", axiosConfig).then((res) => res.data),
    { initialData: [] }
  );
}

export default useAgenda;
