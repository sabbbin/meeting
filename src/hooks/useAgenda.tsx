import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import { IAgenda } from "../Tables/agendaTable";

function useAgenda(
  pageSize: number,
  pageNumber: number,
  userId: string | null,
  axiosConfig: AxiosRequestConfig
) {
  return useQuery<IAgenda[]>(
    ["Agenda", pageSize, pageNumber, userId],
    async () =>
      await axios.get("api/MeetingAgenda", axiosConfig).then((res) => res.data),
    { initialData: [] }
  );
}

export default useAgenda;
