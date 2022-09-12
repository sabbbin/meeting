import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import { IAgenda } from "../Tables/agendaTable";
import { IMeeting } from "../Tables/meeting";

function useMeeting(
    pageSize: number,
    pageNumber: number,
    userId: string | null,
    axiosConfig: AxiosRequestConfig
) {
    return useQuery<IMeeting[]>(
        ["meeting", pageSize, pageNumber, userId],
        async () =>
            await axios.get("api/Meeting", axiosConfig).then((res) => res.data),
        { initialData: [] }
    );
}

export default useMeeting;
