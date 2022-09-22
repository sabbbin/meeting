import { useLocalStorage } from "@mantine/hooks";
import { CheckBox, TableRows } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  PaperTypeMap,
  Typography,
} from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { applyInitialState } from "@mui/x-data-grid/hooks/features/columns/gridColumnsUtils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import {
  IGetUserTypeByMeeting,
  IInvities,
  IMeetingAttendance,
  IMeetingBasicInfo,
  IMeetingConclude,
  IMeetingConcludePreview,
} from "../pages/meetingConclusion";

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

interface IPreviewMeetingConclusion {
  meetingConclude: IMeetingConcludePreview[];
  meetingBasicInfo: IMeetingBasicInfo;
  attendMeeting: IGetUserTypeByMeeting[];
  invities: IInvities[];
  open: boolean;
  onDialogClose: () => void;
}

export default function MeetingPreviewConclude({
  meetingConclude,
  meetingBasicInfo,
  attendMeeting,
  invities,
  open,
  onDialogClose,
}: IPreviewMeetingConclusion) {
  let tempAttend = attendMeeting.filter((attM) => attM.isPresent == true);
  console.log("tempaTtend", tempAttend);
  const navigate = useNavigate();
  let accessToken = localStorage.getItem("access_token");

  const mutateAttendancePost = useMutation<
    IMeetingAttendance,
    unknown,
    unknown
  >((data) => {
    return axios.post("/api/Meeting/Attendance", data, {
      headers: {
        Authorization: "bearer " + accessToken,
      },
    });
  });
  const mutateMeetingConcludePost = useMutation<
    IMeetingConclude,
    unknown,
    unknown
  >((data) => {
    return axios.put("/api/Meeting/Conclude", data, {
      params: {
        meetId: meetingBasicInfo.meetId,
        meetDatetime: dayjs(meetingBasicInfo.meetDatetime).format(),
        location: meetingBasicInfo.location,
      },
      headers: {
        Authorization: "bearer " + accessToken,
      },
    });
  });

  const mutateMeetingInvities = useMutation<IInvities, unknown, unknown>(
    (data) => {
      return axios.post("/api/Meeting/Invitee", data, {
        headers: {
          Authorization: "bearer " + accessToken,
        },
      });
    }
  );
  const mutateMeetingPut = useMutation<IMeetingBasicInfo, unknown, unknown>(
    (data) => {
      return axios.put("/api/Meeting", data, {
        headers: {
          Authorization: "bearer " + accessToken,
        },
      });
    }
  );

  const handleFinalSubmit = () => {
    let sendReadyMeetingConclude: IMeetingConclude = meetingConclude.reduce(
      (initial: any, meetingC) => {
        let { agenda, ...rest } = meetingC;
        return [...initial, rest];
      },
      []
    );
    if (sendReadyMeetingConclude)
      mutateMeetingConcludePost.mutateAsync(sendReadyMeetingConclude);
    let sendReadyMeetingAttendanc: IMeetingAttendance = attendMeeting.reduce(
      (initial: any, attendM) => {
        let temp = {
          meetId: attendM.meetId,
          attendeeId: attendM.UserId,
          isPresent: attendM.isPresent,
        };
        return [...initial, temp];
      },
      []
    );
    // let { meetingTypes, ...rest } = meetingBasicInfo;

    if (sendReadyMeetingAttendanc)
      mutateAttendancePost.mutateAsync(sendReadyMeetingAttendanc);

    // if (rest) mutateMeetingPut.mutateAsync(rest);
    if (invities.length > 0) mutateMeetingInvities.mutateAsync(invities);
    navigate("/meeting");
  };
  return (
    <Dialog
      PaperComponent={FormDialogPaper as never}
      open={open}
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "1000px", // Set your width here
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontSize: 40,
          textTransform: "capitalize",
          fontWeight: "Bold",
          marginBottom: 2,
        }}
      >
        Meeting PreView
      </DialogTitle>
      <DialogContent
        sx={{
          padding: 5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography>
            {" "}
            <b> Location: </b> {meetingBasicInfo.location}
          </Typography>

          <Typography>
            <b> Meeting Types : </b> {meetingBasicInfo.meetingTypes}
          </Typography>

          <Typography>
            <b> Meeting Date: </b>
            {dayjs(meetingBasicInfo.meetDatetime).format(
              "YYYY-MM-DD    HH:MM:ss A"
            )}
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: "lightsteelblue",
            padding: 2,
            width: "100%",
            borderRadius: 3,
            marginBottom: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 1,
            }}
          >
            Meeting Attendance
          </Typography>
          {tempAttend.length > 0 ? (
            tempAttend.map((attendM: IGetUserTypeByMeeting, id) => (
              <Typography>
                {id + 1}.{attendM.FullName}
              </Typography>
            ))
          ) : (
            <Typography
              sx={{
                color: "red",
              }}
            >
              No member
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            backgroundColor: "lightsteelblue",
            padding: 2,
            width: "100%",
            borderRadius: 3,
            marginBottom: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 1,
            }}
          >
            Invities
          </Typography>
          {invities.length > 0 ? (
            invities.map((invitie: IInvities, id) => (
              <Typography>
                {id + 1}.{invitie.invitie}
              </Typography>
            ))
          ) : (
            <Typography
              sx={{
                color: "red",
              }}
            >
              No Invities
            </Typography>
          )}
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 40,
              textAlign: "center",
            }}
          >
            Agenda
          </Typography>
          {meetingConclude.map((meeting: IMeetingConcludePreview, id) => (
            <Box
              sx={{
                my: 2,
                background: "lightGray",
                borderRadius: 4,
                padding: 2,
              }}
            >
              <Typography variant="h6">
                <b>Title. </b> {meeting.agenda}
              </Typography>
              <Typography>
                <b>Conclusion: </b>
                {meeting.conclusion}
              </Typography>
              <Typography>
                <b>Discussion:</b> {meeting.discussion}
              </Typography>
              <Typography>
                <b>Presented By:</b>
                {meeting.presentedBy}
              </Typography>
              <Typography>
                <b>Status:</b>
                {meeting.closeAgenda!.toString()}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "end",
          }}
        >
          <Button variant="contained" type="submit" onClick={handleFinalSubmit}>
            Confirm
          </Button>
          <Button
            variant="contained"
            sx={{
              ml: 2,
            }}
            onClick={() => onDialogClose()}
          >
            Back
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
