import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

export interface IGetAgenda {
  isSelected: boolean;
  agendaId: string;
  agenda: string;
  description: string;
  postedBy: number;
  postedOn?: number;
}

function getAgenda(
  meetTypeId: number | undefined,
  axiosConfig: AxiosRequestConfig
) {
  return useQuery<IGetAgenda[]>(
    ["getAgenda", meetTypeId],
    async () =>
      await axios
        .get(`api/Minute/GetAgenda`, axiosConfig)
        .then((res) => res.data),
    {
      initialData: [],
      enabled: meetTypeId !== 0,
    }
  );
}

export default getAgenda;
