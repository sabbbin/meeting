import { useMutation } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import { IPostMeetingAndMinute } from "../dialog/addMeeting";
import { useMergeMinute } from "./useMergeMinutes";

export const useUpdateMeetingAndMinutes = (
  axiosConfig: AxiosRequestConfig,
  onSuccessDialog: () => void,
  refetch: () => void
) =>
  useMutation<number, unknown, IPostMeetingAndMinute>(
    async (data) => {
      return await axios
        .put("api/Meeting", data.meeting, axiosConfig)
        .then((res) => res.data);
    },
    {
      onSuccess(resMeetId, variables) {
        if (resMeetId) {
          variables.minutes.meetId = resMeetId;
        }
        const mergeMinute = useMergeMinute(
          axiosConfig,
          onSuccessDialog,
          refetch
        );
        mergeMinute.mutate(variables.minutes);
      },
    }
  );
