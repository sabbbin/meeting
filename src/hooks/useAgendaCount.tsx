import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

function useAgendaCount(
  userId: string | null,
  axiosConfig: AxiosRequestConfig
) {
  return useQuery(
    ["agendaCount", userId],
    async () =>
      await axios
        .get("api/MeetingAgenda/Count", axiosConfig)
        .then((res) => res.data),
    { initialData: { TotalCount: 0 } }
  );
}

export default useAgendaCount;
