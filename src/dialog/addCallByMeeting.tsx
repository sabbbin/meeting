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
import StyledTableCell, {
  StyledAttendanceCell,
} from "../components/StyledTableCell";
import { StyledAttendanceRow } from "../components/StyledTableRow";

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
  // console.log("meeting", meeting);

  const [showAgenda, setShowAgenda] = useState(-1);
  const [callMinutesHistoryFlag, setCallMinutesHistoryFlag] = useState(false);

  useEffect(() => {
    getUserMeetingType.refetch();
    callGetMinutes();
    // console.log("meeting", getUserMeetingType.data);

    // console.log("meeting id", meeting.meetId);
    // console.log("meeting getdata", getDataMinutes);
  }, []);

  const [minuteStatus, setMinuteSatus] = useState<boolean>(false);

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
    async () => {
      console.log("meeting", meeting.meetId);
      return await axios
        .get("api/Minute/GetMinute", {
          params: {
            meetid: meeting.meetId!,
          },
          headers: {
            Authorization: "bearer " + accessToken,
          },
        })
        .then((res) => res.data);
    },
    {
      initialData: [],
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  const { data: getMinuteAndHistory, refetch: callGetMinuteHistory } = useQuery(
    ["getMinutesAndHistory"],
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
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  // console.log("meeting", meeting);

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
                justifyContent: "center",
                display: "flex",

                padding: "1px"!,
              }}
            >
              <Table
                stickyHeader
                aria-label="sticky table"
                sx={{
                  width: "50%",
                }}
              >
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
                    <StyledAttendanceRow key={id}>
                      <StyledAttendanceCell>
                        <Checkbox
                          checked={!member.isAbsences}
                          onChange={() => {
                            console.log("before member", member.isAbsences);

                            setAttendMember((pre) => {
                              attendMember[id].isAbsences =
                                !attendMember[id].isAbsences;
                              return [...pre];
                            });
                          }}
                        />
                      </StyledAttendanceCell>
                      <StyledAttendanceCell>
                        {member.FullName}
                      </StyledAttendanceCell>
                    </StyledAttendanceRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box>
            <Formik
              enableReinitialize
              initialValues={{ invities: [] }}
              onSubmit={(values) => {
                console.log("values", values);
              }}
              render={({
                values,
                handleReset,
                setFieldValue,
                handleSubmit,
              }) => (
                <Form>
                  <FieldArray
                    name="invities"
                    render={(arrayHelpers) => (
                      <div>
                        <Button
                          variant="contained"
                          onClick={() => {
                            let id = values.invities.length;
                            arrayHelpers.insert(id, {
                              name: "",
                              comments: "",
                            });
                          }}
                        >
                          Add Invities
                        </Button>
                        {values.invities &&
                          values.invities.length > 0 &&
                          values.invities.map((invitie, index) => (
                            <>
                              <Box
                                marginTop={1.5}
                                marginBottom={1.5}
                                key={index}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                marginLeft={index * 1}
                              >
                                <Field
                                  component={TextField}
                                  label="Name"
                                  name={`invities.${index}.name`}
                                  size="small"
                                  onChange={(
                                    v: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    setFieldValue(
                                      `invities.${index}.name`,
                                      v.target.value
                                    );
                                  }}
                                />

                                <Field
                                  component={TextField}
                                  multiline
                                  maxRows={3}
                                  size="small"
                                  fullwidth
                                  label="Comments"
                                  name={`invities.${index}.comments`}
                                  onChange={(
                                    v: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    setFieldValue(
                                      `invities.${index}.comments`,
                                      v.target.value
                                    );
                                  }}
                                />

                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => arrayHelpers.remove(index)}
                                >
                                  Remove
                                </Button>
                              </Box>
                            </>
                          ))}
                        {values.invities.length > 0 && (
                          <Button
                            variant="contained"
                            onClick={() => {
                              handleSubmit();
                            }}
                            sx={{
                              float: "right",
                              color: "primary",
                            }}
                          >
                            Submit
                          </Button>
                        )}
                      </div>
                    )}
                  ></FieldArray>
                </Form>
              )}
            />
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
              console.log("values", values);
            }}
            render={({ values, handleSubmit, handleReset, setFieldValue }) => (
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
                              paddingBottom: 3,
                              marginBottom: 2,
                              border: "2px solid black",
                              borderRadius: 3,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <IconButton
                                onClick={async () => {
                                  if (showAgenda !== value.agendaId) {
                                    await setShowAgenda(value.agendaId);
                                    callGetMinuteHistory();
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
                                      fontSize: 50,
                                      marginRight: 1,
                                    }}
                                  />
                                ) : (
                                  <KeyboardArrowUpIcon
                                    sx={{
                                      fontSize: 50,
                                      color: "red",
                                    }}
                                  />
                                )}
                              </IconButton>

                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                }}
                              >
                                <b>Title :</b> {value.agenda}
                              </Typography>
                            </Box>

                            <Collapse
                              in={showAgenda == value.agendaId}
                              timeout="auto"
                              unmountOnExit
                              sx={{
                                marginBottom: 2,
                                marginLeft: 5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  marginLeft: 3,
                                  marginBottom: 2,
                                  marginTop: 2,
                                  fontStyle: "italic",
                                }}
                              >
                                <b>Description:</b> {value.description}
                              </Typography>
                              {getMinuteAndHistory.length > 0 &&
                                getMinuteAndHistory.map((val: any) => (
                                  <Box
                                    sx={{
                                      padding: 2,
                                    }}
                                  >
                                    <Box></Box>
                                    <Typography>
                                      Date:{" "}
                                      {dayjs(val.meetDatetime).format(
                                        "DD/MM/YYYY"
                                      )}
                                    </Typography>
                                    <Typography>
                                      Discussion : {val.discussion}
                                    </Typography>
                                    <Typography>
                                      Conclusion : {val.conclusion}
                                    </Typography>
                                  </Box>
                                ))}
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
                                  Created Date:{" "}
                                  {dayjs(value.postedOn).format("DD/MM/YYYY")}
                                </Typography>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Switch
                                    checked={!minuteStatus}
                                    onChange={() =>
                                      setMinuteSatus(!minuteStatus)
                                    }
                                  />
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
                                value={value.discussion}
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
                                value={value.conclusion}
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
                            </Collapse>
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
                    onClick={() => {
                      handleSubmit();
                      handleReset();
                    }}
                    sx={{ marginRight: 2 }}
                  >
                    submit
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      onDialogClose();
                      handleReset();
                    }}
                  >
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
