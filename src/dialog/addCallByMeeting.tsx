import { CheckBox, TableRows } from "@mui/icons-material";
import {
  Box,
  Button,
  capitalize,
  CardContent,
  Checkbox,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  PaperTypeMap,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import dayjs from "dayjs";
import { Field, FieldArray, Form, Formik, useFormik } from "formik";
import React, { useEffect, useState } from "react";
import Switch from "@mui/material/Switch";
import DoneIcon from "@mui/icons-material/Done";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { IMeeting } from "../Tables/meeting";

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

interface ICallByMeetingForm {
  meetingDate: string;
  location: string;
  meetingTypes: string;
  attendence: [];
}
interface AgendaForm {
  agenda: string;
  postedBy: string;
  date: string;
  status: string;
  discussion: string;
  descion: string;
}

interface IAddCallByMeeting {
  onDialogClose: () => void;
  meeting: IMeeting;
}

interface IGetMinutes {
  minuteId: number;
  meetId: number;
  agenda: string;
  agendaId: number;
  description: string;
  presenter: string;
  discussion: string;
  conclusion: string;
}
export default function AddCallByMeeting({
  onDialogClose,
  meeting,
}: IAddCallByMeeting) {
  const formikICallByMeetingForm = useFormik<ICallByMeetingForm>({
    initialValues: {
      meetingDate: dayjs(meeting.meetDatetime)
        .format("YYYY-MM-DD    h:m:ss A")
        .toString(),
      location: meeting.location!,
      meetingTypes: meeting.typeName!,
      attendence: [],
    },
    onSubmit: (values) => {
      console.log("values", values);
    },
  });

  const [showAgenda, setShowAgenda] = useState(-1);
  interface IMeetingUser {
    IsSelected: number;
    UserId: number;
    UserName: string;
    FullName: string;
    isAbsences?: boolean;
  }

  const [attendMember, setAttendMember] = useState<IMeetingUser[]>([]);
  let accessToken = localStorage.getItem("access_token");
  const getUserMeetingType = useQuery<IMeetingUser[]>(
    ["getUserMeetingTypes"],
    () =>
      axios
        .get(`api/MeetingType/GetUserByType/${meeting.meetTypeId}`, {
          headers: {
            Authorization: "bearer " + accessToken,
          },
        })
        .then((res) => res.data),
    {
      onSuccess: (values) => {
        let selectedUser = values.filter((val) => {
          if (val.IsSelected == 1) {
            val["isAbsences"] = false;
            return val;
          }
        });
        setAttendMember(selectedUser);
      },
    }
  );

  const { data: getDataMinutes, refetch: callGetMinutes } = useQuery<
    IGetMinutes[]
  >(
    ["getMinutes", showAgenda],
    () =>
      axios
        .get("api/Minute/GetMinute", {
          params: {
            meetid: meeting.meetTypeId,
          },
          headers: {
            Authorization: "bearer " + accessToken,
          },
        })
        .then((res) => res.data),
    {
      initialData: [],
    }
  );
  useEffect(() => {
    callGetMinutes();
    getUserMeetingType.refetch();
    console.log("meeting", getUserMeetingType.data);

    console.log("meeting", meeting);
    console.log("meeting id", meeting.meetId);
    console.log("meeting", getDataMinutes);
  }, []);
  const formikIAgendaForm = useFormik<AgendaForm>({
    initialValues: {
      agenda: "adf",
      postedBy: "ram kumar",
      date: "2020-03-12",
      status: "active",
      discussion: "this is nice metting",
      descion: "this is final decision",
    },
    onSubmit: () => {},
  });

  const submitConclusion = (e: any) => {
    e.preventDefault();
    console.log("attendence", attendMember);
  };

  return (
    <Dialog
      PaperComponent={FormDialogPaper as never}
      open={true}
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
        }}
      >
        Meeting Conclusion
      </DialogTitle>
      <DialogContent>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextField
              label="Location"
              margin="dense"
              size="small"
              autoFocus
              name="location"
              value={formikICallByMeetingForm.values.location}
              onChange={formikICallByMeetingForm.handleChange}
              error={
                formikICallByMeetingForm.touched.location &&
                Boolean(formikICallByMeetingForm.errors.location)
              }
              helperText={
                formikICallByMeetingForm.touched.location &&
                formikICallByMeetingForm.errors.location
              }
            />

            <TextField
              label="meetingTypes"
              margin="dense"
              size="small"
              value={formikICallByMeetingForm.values.meetingTypes}
            />
            <TextField
              label="DateTime"
              autoFocus
              margin="dense"
              size="small"
              name="meetingDate"
              value={formikICallByMeetingForm.values.meetingDate}
              onChange={formikICallByMeetingForm.handleChange}
              error={
                formikICallByMeetingForm.touched.meetingDate &&
                Boolean(formikICallByMeetingForm.errors.meetingDate)
              }
              variant="standard"
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <TableContainer
              sx={{
                maxHeight: 300,
                marginTop: 5,
                marginBottom: 5,
                width: "45%",
              }}
            >
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Presence(
                      <DoneIcon
                        sx={{
                          fontSize: 12,
                        }}
                      />
                      )
                    </TableCell>
                    <TableCell>Attendences</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendMember.map((member) => (
                    <TableRow>
                      <TableCell>
                        <Checkbox
                          checked={!member.isAbsences}
                          onClick={() => {
                            member.isAbsences = !member.isAbsences;
                            console.log("member", member);
                            setAttendMember((prev) => {
                              return [...prev, member];
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell>{member.FullName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TableContainer
              sx={{
                maxHeight: 300,
                width: "45%",
                marginTop: 5,
                marginBottom: 5,
              }}
            >
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Presence(
                      <DoneIcon
                        sx={{
                          fontSize: 12,
                        }}
                      />
                      )
                    </TableCell>
                    <TableCell>Externals</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[1, 2, 3, 4, 6, 6, 4, 3, 3, 4, 43].map((a) => (
                    <TableRow>
                      <TableCell>
                        <CheckBox></CheckBox>
                      </TableCell>
                      <TableCell>{a}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Typography
            sx={{
              fontSize: 40,
              textAlign: "center",
            }}
          >
            Agenda
          </Typography>

          {getDataMinutes.map((a) => (
            <Box
              sx={{
                padding: 2,
                marginBottom: 2,
              }}
            >
              <Box
                sx={{
                  justifyContent: "space-between",
                  display: "flex",
                  marginBottom: 3,
                }}
              >
                <TextField
                  label="posted by"
                  value={formikIAgendaForm.values.postedBy}
                  size="small"
                />
                <TextField
                  label="Date"
                  value={formikIAgendaForm.values.date}
                  size="small"
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>Close</Typography>
                  <Switch />
                  <Typography>Open</Typography>
                </Stack>
              </Box>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                  }}
                >
                  {showAgenda == -1 ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )}

                  <TextField
                    label="agenda"
                    value={formikIAgendaForm.values.agenda}
                    fullWidth
                    sx={{
                      marginBottom: 2,
                      marginLeft: 2,
                    }}
                    size="small"
                  />
                </Box>

                <Collapse
                  in={true}
                  timeout="auto"
                  unmountOnExit
                  sx={{
                    marginBottom: 2,
                    marginLeft: 5,
                  }}
                >
                  <TextField
                    label="Discussion"
                    value={formikIAgendaForm.values.discussion}
                    name="discussion"
                    size="small"
                    sx={{
                      marginBottom: 3,
                    }}
                    multiline
                    fullWidth
                    maxRows={4}
                    onChange={formikIAgendaForm.handleChange}
                  />
                  <TextField
                    label="Decision"
                    name="descion"
                    fullWidth
                    multiline
                    size="small"
                    value={formikIAgendaForm.values.descion}
                    sx={{
                      marginBottom: 3,
                    }}
                    maxRows={4}
                    onChange={formikIAgendaForm.handleChange}
                  />
                </Collapse>
              </Box>
              <TextField
                label="Discussion"
                value={formikIAgendaForm.values.discussion}
                name="discussion"
                size="small"
                sx={{
                  marginBottom: 3,
                }}
                multiline
                fullWidth
                maxRows={4}
                onChange={formikIAgendaForm.handleChange}
              />
              <TextField
                label="Decision"
                name="descion"
                fullWidth
                multiline
                size="small"
                value={formikIAgendaForm.values.descion}
                sx={{
                  marginBottom: 3,
                }}
                maxRows={4}
                onChange={formikIAgendaForm.handleChange}
              />
              <TextField
                label="PresentedBy"
                size="small"
                sx={{
                  float: "right",
                }}
              />
            </Box>
          ))}
        </CardContent>
        <Box
          sx={{
            marginBottom: 5,
          }}
        >
          <Button
            sx={{
              float: "right",
              marginLeft: 2,
            }}
            variant="contained"
            onClick={onDialogClose}
          >
            Cancel
          </Button>

          <Button
            sx={{
              float: "right",
            }}
            variant="contained"
            onClick={submitConclusion}
          >
            Submit
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
