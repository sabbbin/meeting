import { useMutation } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import { FormData, IPostMeetingAndMinute } from "../dialog/addMeeting";
import { IPostMeeting } from "../Tables/meeting";
import { useMergeMinute } from "./useMergeMinutes";

export const useUpdateMeetingAndMinutes = (axiosConfig: AxiosRequestConfig) =>
  useMutation<number, unknown, FormData>(async (data) => {
    return await axios
      .put("api/Meeting", data, axiosConfig)
      .then((res) => res.data);
  });
