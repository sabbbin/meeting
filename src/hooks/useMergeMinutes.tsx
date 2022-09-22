import { useMutation } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import { IPostMinutes } from "../dialog/addMeeting";

export const useMergeMinute = (
  axiosConfig: AxiosRequestConfig,
  onDialogSuccess: () => void,
  refetch: () => void
) =>
  useMutation<unknown, unknown, IPostMinutes>(
    async (data) =>
      await axios.post("api/Minute", data, axiosConfig).then((res) => res.data),
    {
      onSuccess() {
        onDialogSuccess();
        refetch();
      },
    }
  );
