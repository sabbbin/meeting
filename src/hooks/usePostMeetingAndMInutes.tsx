import { useMutation } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import { IPostMeetingAndMinute } from "../dialog/addMeeting";
import { IPostMeeting } from "../Tables/meeting";
import { useMergeMinute } from "./useMergeMinutes";

export const usePostMeetingAndMInutes = (
  axiosConfig: AxiosRequestConfig,
  onSuccessDialog: () => void,
  refetch: () => void
) =>
  useMutation<number, unknown, IPostMeeting>(async (data) => {
    return await axios
      .post("api/Meeting", data, axiosConfig)
      .then((res) => res.data);
  });
