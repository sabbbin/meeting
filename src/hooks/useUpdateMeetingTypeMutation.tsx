import { useMutation } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import { IAgenda } from "../Tables/agendaTable";

export const useUpdateMeetingTypeMutation = (
  axiosConfig: AxiosRequestConfig,
  refetch: () => void,
  onSuccessDialog: () => void
) =>
  useMutation<unknown, unknown, IAgenda>(
    async (data) =>
      await axios
        .put("api/MeetingAgenda", data, axiosConfig)
        .then((res) => res.data),
    {
      onSuccess() {
        refetch();
        onSuccessDialog();
      },
    }
  );
