import { AttachEmail, CheckBox, TableRows, YouTube } from "@mui/icons-material";
import * as yup from "yup";
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
import {
  ErrorMessage,
  Field,
  FieldArray,
  Form,
  Formik,
  FormikErrors,
  useFormik,
} from "formik";
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
import MeetingPreviewConclude from "../dialog/meetingPreviewConclude";

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

export interface IMeetingBasicInfo {
  meetId?: number;
  meetDatetime: string;
  meetTypeId?: number;
  location: string;
  calledBy?: string;
  meetingTypes: string;
}

export interface IMeetingAttendance {
  meetId: number;
  attendeeId: number;
  isPresent: boolean;
}
export interface IGetUserTypeByMeeting {
  IsSelected: number;
  UserId: number;
  UserName: string;
  FullName: string;
  isPresent?: boolean;
  meetId?: number;
}
export interface IInvities {
  meetId: number;
  invities: string;
  description: string;
}

export interface IMeetingConclude {
  minuteId: string;
  presentedBy: string;
  discussion: string;
  conclusion: string;
  closeAgenda: boolean;
}

export interface IInvities {
  meetId: number;
  invitie: string;
  description: string;
}
export interface IMeetingConcludePreview extends Partial<IMeetingConclude> {
  agenda: string;
}

interface IGetMinutes {
  minuteId: number;
  meetId: number;
  agenda: string;
  agendaId: number;
  description: string;
  discussion?: string;
  conclusion?: string;
  postedBy: string;
  postedOn: string;
  presentedBy?: string;
  closeAgenda: boolean;
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
  const [meetingPreviewConcludeDialog, setMeetingPreviewConcludeDialog] =
    useState(false);

  const meeting = useMeetingConclusinStore((state) => state.meeting!);

  const [showAgenda, setShowAgenda] = useState(-1);

  useEffect(() => {
    getUserMeetingType.refetch();
    callGetMinutes();
    // console.log("meeting", getUserMeetingType.data);

    // console.log("meeting id", meeting.meetId);
    // console.log("meeting getdata", getDataMinutes);
  }, []);

  const [invities, setInvities] = useState<IInvities[]>([]);

  const formikMeetingBasicInfo = useFormik<IMeetingBasicInfo>({
    initialValues: {
      meetDatetime: meeting.meetDatetime!.toString(),

      location: meeting.location!,
      meetingTypes: meeting.typeName!,
      calledBy: meeting.calledBy!,
      meetId: meeting.meetId!,
      meetTypeId: meeting.meetTypeId!,
    },
    validationSchema() {
      return yup.object().shape({
        location: yup.string().required("required"),
        meetDatetime: yup
          .string()
          .required()
          .test({
            test: (dt) => {
              return dayjs(dt).isSame(meeting.meetDatetime) || dayjs(dt).isAfter(meeting.meetDatetime)
            },

            message: "Meeting Date cannot be less than current date",
          }),
      });
    },
    onSubmit: (values) => {
      console.log("values", values);
    },
  });

  const [attendMember, setAttendMember] = useState<IGetUserTypeByMeeting[]>([]);
  let accessToken = localStorage.getItem("access_token");
  useEffect(() => {
    getUserMeetingType.refetch();
  }, []);
  const getUserMeetingType = useQuery<IGetUserTypeByMeeting[]>(
    ["getUserMeetingTypes"],
    () =>
      axios
        .get(`/api/MeetingType/GetUserByType/${meeting.meetTypeId}`, {
          headers: {
            Authorization: "bearer " + accessToken,
          },
        })
        .then((res) => res.data),
    {
      onSuccess: (values) => {
        let selectedUser = values.filter((val) => {
          if (val.IsSelected == 1) {
            val["isPresent"] = true;
            val["meetId"] = meeting.meetId;
            return val;
          }
        });
        setAttendMember(selectedUser);
      },
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );
  const [meetingConclude, setMeetingConclude] =
    useState<IMeetingConcludePreview[]>();
  const { data: getDataMinutes, refetch: callGetMinutes } = useQuery<
    IGetMinutes[]
  >(
    ["getMinutes", meeting.meetId],
    async () => {
      console.log("meeting", meeting.meetId);
      return await axios
        .get("/api/Minute/GetMinute", {
          params: {
            meetId: meeting.meetId!,
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
        .get("/api/Minute/GetHistory", {
          params: {
            meetid: meeting.meetId,
            agendaid: showAgenda,
          },
          headers: {
            Authorization: "bearer " + accessToken,
          },
        })
        .then((res) => res.data),
    {
      initialData: [],
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );
  console.log(formikMeetingBasicInfo.errors);
  return (
    <>
      <Toolbar />
      <Paper elevation={0}>
        {meetingPreviewConcludeDialog && (
          <MeetingPreviewConclude
            meetingConclude={meetingConclude!}
            meetingBasicInfo={formikMeetingBasicInfo.values}
            attendMeeting={attendMember}
            invities={invities}
            open={meetingPreviewConcludeDialog}
            onDialogClose={() => setMeetingPreviewConcludeDialog(false)}
          />
        )}
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
                  Minutes
                </Typography>

                <Formik
                  enableReinitialize
                  initialValues={{ forms: getDataMinutes }}
                  validationSchema={yup.object().shape({
                    forms: yup.array().of(
                      yup
                        .object()
                        .shape({
                          discussion: yup.string().required("Required"),
                          conclusion: yup.string().required("Required"),
                          presentedBy: yup.string().required("Required"),
                        })
                        .required()
                    ),
                  })}
                  onSubmit={async (values) => {
                    let filterFormValue = values.forms.reduce(
                      (initial: any, val) => {
                        return [
                          ...initial,
                          {
                            closeAgenda: val.closeAgenda,
                            agenda: val.agenda,
                            minuteId: val.minuteId,
                            presentedBy: val.presentedBy,
                            discussion: val.discussion,
                            conclusion: val.conclusion,
                          },
                        ];
                      },
                      []
                    );
                    console.log("before", values.forms);
                    console.log("values agenda", filterFormValue);
                    console.log("attendenc", attendMember);
                    console.log("invities", invities);
                    console.log("form", formikMeetingBasicInfo.values);

                    await setMeetingConclude(filterFormValue);
                    setMeetingPreviewConcludeDialog(true);
                  }}
                  render={({
                    values,
                    handleSubmit,
                    handleReset,
                    setFieldValue,
                    errors,
                    touched,
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
                                    border: errors.forms
                                      ? "2px solid red"
                                      : "2px solid black",

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
                                      <b>Agenda :</b> {value.agenda}
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
                                            <b> Date: </b>
                                            {dayjs(val.meetDatetime).format(
                                              "DD/MM/YYYY"
                                            )}
                                          </Typography>
                                          <Typography>
                                            <b>Discussion : </b>
                                            {val.discussion}
                                          </Typography>
                                          <Typography>
                                            <b>Conclusion :</b> {val.conclusion}
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
                                        <b> Posted By: </b> {value.postedBy}
                                      </Typography>
                                      <Typography>
                                        <b> Created Date:</b>
                                        {dayjs(value.postedOn).format(
                                          "DD/MM/YYYY"
                                        )}
                                      </Typography>

                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                      >
                                        <Field
                                          component={Switch}
                                          checked={value.closeAgenda}
                                          name={`forms.${index}.closeAgenda`}
                                          onChange={(
                                            v: React.ChangeEvent<HTMLInputElement>
                                          ) => {
                                            setFieldValue(
                                              `forms.${index}.closeAgenda`,
                                              v.target.checked
                                            );
                                          }}
                                        />
                                        <Typography>Close</Typography>
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
                                      error={
                                        errors.forms &&
                                        (
                                          errors.forms[
                                          index
                                          ] as FormikErrors<IGetMinutes>
                                        )?.discussion
                                      }
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
                                      error={
                                        errors.forms &&
                                        (
                                          errors.forms[
                                          index
                                          ] as FormikErrors<IGetMinutes>
                                        )?.conclusion
                                      }
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
                                      error={
                                        errors.forms &&
                                        (
                                          errors.forms[
                                          index
                                          ] as FormikErrors<IGetMinutes>
                                        )?.presentedBy
                                      }
                                      name={`forms.${index}.presentedBy`}
                                      size="small"
                                      sx={{
                                        float: "right",
                                        marginBottom: 1,
                                      }}
                                      value={value.presentedBy}
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
                    Meeting Types : {formikMeetingBasicInfo.values.meetingTypes}
                  </Typography>
                </Item>

                <Item>
                  <TextField
                    label="Location"
                    margin="dense"
                    size="small"
                    autoFocus
                    fullWidth
                    required
                    name="location"
                    value={formikMeetingBasicInfo.values.location}
                    onChange={formikMeetingBasicInfo.handleChange}
                    error={formikMeetingBasicInfo.values.location == ""}
                    helperText={
                      formikMeetingBasicInfo.values.location == "" &&
                      "select location"
                    }
                  // error={
                  //   formikMeetingBasicInfo.touched.location &&
                  //   Boolean(formikMeetingBasicInfo.errors.location)
                  // }
                  // helperText={
                  //   formikMeetingBasicInfo.touched.location &&
                  //   formikMeetingBasicInfo.errors.location
                  // }
                  />
                </Item>

                <Item>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Meeting Date and Time"
                      value={dayjs(
                        formikMeetingBasicInfo.values.meetDatetime
                      ).format("MMM D, YYYY h:mm A")}
                      inputFormat="MMM D, YYYY h:mm A"
                      onChange={(newValue) => {
                        formikMeetingBasicInfo.setFieldValue(
                          "meetDatetime",
                          newValue?.toString()
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          fullWidth
                          size="small"
                          helperText={
                            formikMeetingBasicInfo.errors.meetDatetime
                          }
                          {...params}
                          error={!!formikMeetingBasicInfo.errors.meetDatetime}
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
                    overflowY: "scroll",
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
                              checked={member.isPresent}
                              onChange={() => {
                                setAttendMember((pre) => {
                                  attendMember[id].isPresent =
                                    !attendMember[id].isPresent;
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
                  initialValues={{ invities: [] as unknown as IInvities[] }}
                  onSubmit={(values) => {
                    setInvities([...values.invities]);
                  }}
                  // validationSchema={yup.object().shape({
                  //   forms: yup.array().of(
                  //     yup
                  //       .object()
                  //       .shape({
                  //         discussion: yup.string().required("Required"),
                  //         conclusion: yup.string().required("Required"),
                  //         presentedBy: yup.string().required("Required"),
                  //       })
                  //       .required()
                  //   ),
                  // })}
                  validationSchema={yup.object().shape({
                    invities: yup.array().of(
                      yup.object().shape({
                        invitie: yup.string().required("required"),
                        description: yup.string().required("required"),
                      })
                    ),
                  })}
                  render={({
                    values,
                    errors,
                    setFieldValue,
                    touched,
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
                                  meetId: meeting.meetId,
                                  invitie: "",
                                  description: "",
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
                                    label="Invitie"
                                    name={`invities.${index}.invitie`}
                                    size="small"
                                    error={
                                      errors.invities &&
                                      (
                                        errors.invities[
                                        index
                                        ] as FormikErrors<IInvities>
                                      )?.invitie
                                    }
                                    onChange={(
                                      v: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      setFieldValue(
                                        `invities.${index}.invitie`,
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
                                    error={
                                      errors.invities &&
                                      (
                                        errors.invities[
                                        index
                                        ] as FormikErrors<IInvities>
                                      )?.description
                                    }
                                    label="Description"
                                    name={`invities.${index}.description`}
                                    onChange={(
                                      v: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      setFieldValue(
                                        `invities.${index}.description`,
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
