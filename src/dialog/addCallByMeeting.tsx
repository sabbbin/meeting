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
  IconButton,
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
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

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

  date: string;
  status: string;
  discussion: string;
  description: string;
  conclusion: string;
  postedBy: string;
  postedOn: string;
  presenter: string;
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
  discussion: string;
  conclusion: string;
  postedBy: string;
  postedOn: string;
  presenter: string;
}

export default function AddCallByMeeting({
  onDialogClose,
  meeting,
}: IAddCallByMeeting) {
  console.log("meeting", meeting);
  useEffect(() => {
    getUserMeetingType.refetch();
    console.log("meeting", getUserMeetingType.data);

    console.log("meeting id", meeting.meetId);
    console.log("meeting getdata", getDataMinutes);
  }, []);

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
  const [callMinutesHistoryFlag, setCallMinutesHistoryFlag] = useState(false);

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
    ["getMinutes"],
    async () =>
      await axios
        .get("api/Minute/GetMinute", {
          params: {
            meetid: meeting.meetId,
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

  const { data: getMinuteAndHistory } = useQuery(
    ["getMinutesAndHistory", callMinutesHistoryFlag],
    () =>
      axios
        .get("api/Minute/GetMinuteAndHistory", {
          params: {
            meetid: meeting.meetId,
            agendaid: showAgenda,
          },
        })
        .then((res) => res.data),
    {
      initialData: [],
    }
  );

  console.log("meeting", meeting);

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

            <Typography>
              Meeting Types : {formikICallByMeetingForm.values.meetingTypes}
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Select Date and time"
                value={formikICallByMeetingForm.values.meetingDate}
                inputFormat="YYYY-MM-DD    HH:MM:ss A"
                onChange={(newValue) => {
                  formikICallByMeetingForm.setFieldValue(
                    "meetingDate",
                    newValue
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    error={
                      formikICallByMeetingForm.touched.meetingDate &&
                      Boolean(formikICallByMeetingForm.errors.meetingDate)
                    }
                    helperText={
                      formikICallByMeetingForm.touched.meetingDate &&
                      formikICallByMeetingForm.errors.meetingDate
                    }
                    {...params}
                  />
                )}
              />
            </LocalizationProvider>
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

                padding: "1px"!,
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
                  {attendMember.map((member, id) => (
                    <TableRow key={id} hover>
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

          <Formik
            enableReinitialize
            initialValues={{ forms: getDataMinutes }}
            onSubmit={(values) => {
              console.log("getData", values);
            }}
            render={({ values, setFieldValue }) => (
              <Form>
                <FieldArray
                  name="getDataMinutes"
                  render={() =>
                    values.forms.map((value, index) => {
                      return (
                        <div>
                          <Field
                            key={index}
                            component={Box}
                            name={`getDateMinutes.${index}`}
                            sx={{
                              padding: 5,
                              paddingBottom: 10,
                              marginBottom: 2,
                              border: "2px solid black",
                              borderRadius: 3,
                            }}
                          >
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <IconButton
                                  onClick={() => {
                                    if (showAgenda !== value.agendaId) {
                                      setShowAgenda(value.agendaId);
                                      setCallMinutesHistoryFlag(
                                        !callMinutesHistoryFlag
                                      );
                                    } else {
                                      setShowAgenda(-1);
                                    }
                                  }}
                                >
                                  {showAgenda != value.agendaId ? (
                                    <KeyboardArrowDownIcon
                                      sx={{
                                        fontSize: 45,
                                      }}
                                    />
                                  ) : (
                                    <KeyboardArrowUpIcon
                                      sx={{
                                        fontSize: 45,
                                        color: "red",
                                      }}
                                    />
                                  )}
                                </IconButton>

                                <Typography variant="subtitle1">
                                  Title :{value.agenda}
                                </Typography>
                              </Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  display: "block",
                                  marginLeft: 3,
                                  marginBottom: 2,
                                  marginTop: 2,
                                }}
                              >
                                Description: {value.description}
                              </Typography>

                              <Collapse
                                in={showAgenda == value.agendaId}
                                timeout="auto"
                                unmountOnExit
                                sx={{
                                  marginBottom: 2,
                                  marginLeft: 5,
                                }}
                              >
                                {getMinuteAndHistory.length > 0 &&
                                  getMinuteAndHistory.map((val: any) => (
                                    <Box
                                      sx={{
                                        padding: 2,
                                      }}
                                    >
                                      <Typography>
                                        Date: {val.meetDatetime}
                                      </Typography>
                                      <Typography>
                                        Discussion : {val.discussion}
                                      </Typography>
                                      <Typography>
                                        Conclusion : {val.conclusion}
                                      </Typography>
                                    </Box>
                                  ))}
                              </Collapse>
                            </Box>
                            <Box
                              sx={{
                                justifyContent: "space-between",
                                display: "flex",
                                marginBottom: 5,
                              }}
                            >
                              <Typography>
                                Posted By: {value.postedBy}
                              </Typography>
                              <Typography>
                                Created Date: {value.postedOn}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Typography>Close</Typography>
                                <Switch checked />
                                <Typography>Open</Typography>
                              </Stack>
                            </Box>
                            <Field
                              component={TextField}
                              label="Discussion"
                              name={`forms.${index}.discussion`}
                              size="small"
                              sx={{
                                marginBottom: 3,
                              }}
                              multiline
                              fullWidth
                              maxRows={4}
                              defaultValue={value.discussion}
                              onChange={(
                                v: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                setFieldValue(
                                  `forms.${index}.discussion`,
                                  v.target.value
                                );
                              }}
                            />
                            <Field
                              component={TextField}
                              label="Conclusion"
                              defaultValue={value.conclusion}
                              name={`forms.${index}.conclusion`}
                              fullWidth
                              multiline
                              size="small"
                              sx={{
                                marginBottom: 3,
                              }}
                              maxRows={4}
                              onChange={(
                                v: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                setFieldValue(
                                  `forms.${index}.conclusion`,
                                  v.target.value
                                );
                              }}
                            />
                            <Field
                              component={TextField}
                              label="PresentedBy"
                              name={`forms.${index}.presentedBy`}
                              size="small"
                              sx={{
                                float: "right",
                                marginBottom: 1,
                              }}
                              defaultValue={value.presenter}
                              onChange={(
                                v: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                setFieldValue(
                                  `forms.${index}.presentedBy`,
                                  v.target.value
                                );
                              }}
                            />
                          </Field>
                        </div>
                      );
                    })
                  }
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{ marginRight: 2 }}
                  >
                    submit
                  </Button>
                  <Button variant="contained" onClick={() => onDialogClose()}>
                    Cancle
                  </Button>
                </Box>
              </Form>
            )}
          />
        </CardContent>
        <Box
          sx={{
            marginBottom: 5,
          }}
        ></Box>
      </DialogContent>
    </Dialog>
  );
}
