import { useMutation } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import { CreateAgenda } from "../dialog/addAgenda";

export const useCreateMeetingTypeMutation = (
  axiosConfig: AxiosRequestConfig,
  refetch: () => void,
  onSuccessDialog: () => void
) =>
  useMutation<unknown, unknown, CreateAgenda>(
    async (data) =>
      await axios
        .post("api/Agenda", data, axiosConfig)
        .then((res) => res.data),
    {
      onSuccess() {
        refetch();
        onSuccessDialog();
      },
    }
  );
