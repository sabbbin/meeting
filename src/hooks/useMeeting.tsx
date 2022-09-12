import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";
import axios, { AxiosRequestConfig } from "axios";
import { IAgenda } from "../Tables/agendaTable";
import { IMeeting } from "../Tables/meeting";

function useMeeting(
  pageSize: number,
  pageNumber: number,
  userId: string | null,
  sortCol: SortingState,
  axiosConfig: AxiosRequestConfig
) {
  return useQuery<IMeeting[]>(
    ["meeting", pageSize, pageNumber, userId, sortCol],
    async () =>
      await axios.get("api/Meeting", axiosConfig).then((res) => res.data),
    { initialData: [] }
  );
}

export default useMeeting;
