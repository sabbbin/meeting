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
  Divider,
  Grid,
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
  Toolbar,
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
import { useMeetingConclusinStore } from "../hooks/zustard";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

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
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  boxShadow: theme.shadows[0],
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function MeetingConclusion() {
  // console.log("meeting", meeting);
  const navigate = useNavigate();

  const meeting = useMeetingConclusinStore((state) => state.meeting!);

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

  return (
    <>
      <Toolbar />
      <Paper elevation={0}>
        <Grid container justifyContent="space-between">
          <Grid item xs={8}>
            <Paper
              sx={{
                height: "90vh",
                padding: 1,
                overflow: "hidden",
                overflowY: "scroll",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 38,
                    textAlign: "center",
                    marginBottom: 2,
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
                  render={({
                    values,
                    handleSubmit,
                    handleReset,
                    setFieldValue,
                  }) => (
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
                                        {dayjs(value.postedOn).format(
                                          "DD/MM/YYYY"
                                        )}
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
                          size="small"
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
                          size="small"
                          variant="contained"
                          onClick={() => {
                            handleReset();
                            navigate("/meeting");
                          }}
                        >
                          Cancle
                        </Button>
                      </Box>
                    </Form>
                  )}
                />
              </Box>
              <Box
                sx={{
                  marginBottom: 5,
                }}
              ></Box>
            </Paper>
          </Grid>

          <Grid item xs={4}>
            <Paper
              sx={{
                marginLeft: 2,
                padding: 1,
                height: "90vh",
              }}
            >
              <Stack spacing={1}>
                <Item>
                  <Typography>
                    Meeting Types :{" "}
                    {formikICallByMeetingForm.values.meetingTypes}
                  </Typography>
                </Item>

                <Item>
                  <TextField
                    label="Location"
                    margin="dense"
                    size="small"
                    autoFocus
                    fullWidth
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
                </Item>

                <Item>
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
                          fullWidth
                          size="small"
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
                </Item>
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <TableContainer
                  sx={{
                    height: 250,
                    marginTop: 5,
                    marginBottom: 5,
                    justifyContent: "center",
                    display: "flex",
                    boxShadow: 3,
                    borderRadius: 4,
                    overflow: "hidden",
                    padding: "1px"!,
                  }}
                >
                  <Table stickyHeader aria-label="sticky table" size="small">
                    <TableHead>
                      <StyledAttendanceRow>
                        <StyledAttendanceCell
                          sx={{
                            width: "42%",
                          }}
                        >
                          Presence(
                          <DoneIcon
                            sx={{
                              fontSize: 10,
                            }}
                          />
                          )
                        </StyledAttendanceCell>
                        <StyledAttendanceCell>Attendences</StyledAttendanceCell>
                      </StyledAttendanceRow>
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

              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  height: 300,
                  overflow: "hidden",
                  overflowY: "scroll",
                  textAlign: "right",

                  // justifyContent="flex-end" # DO NOT USE THIS WITH 'scroll'
                }}
              >
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
                              component={Paper}
                              variant="contained"
                              fullWidth
                              sx={{
                                position: "sticky",
                                top: 0,
                                zIndex: 100,
                              }}
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
                                    sx={{
                                      my: 1,
                                      width: "100%",
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
                                    sx={{
                                      my: 1,
                                      width: "100%",
                                    }}
                                  />

                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="error"
                                    onClick={() => arrayHelpers.remove(index)}
                                  >
                                    Remove
                                  </Button>
                                  <Divider
                                    sx={{
                                      my: 1,
                                    }}
                                  />
                                </>
                              ))}
                            {values.invities.length > 0 && (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                  handleSubmit();
                                }}
                                sx={{
                                  float: "right",
                                  color: "red",
                                  backgroundColor: "yellowgreen",
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
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
