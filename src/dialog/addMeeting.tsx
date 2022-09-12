import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  MenuItem,
  Paper,
  PaperTypeMap,
  TextField,
} from "@mui/material";
import { IMeeting } from "../Tables/meeting";
import * as yup from "yup";
import { useEffect, useState } from "react";
import { useFormControlUnstyledContext } from "@mui/base";
import { useFormik } from "formik";
import { Info, MeetingRoomRounded } from "@mui/icons-material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import dayjs from "dayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import useUserMeetingType from "../hooks/useUserMeetingType";
import getAgenda from "./getAgenda";
import { width } from "@mui/system";

interface AddMeeting extends DialogProps {
  onAddMeetingDiscardDialog: () => void;
  onAddMeetingSuccessDialog: () => void;
  toEditAddMeeting: IMeeting;
}

const validationSchema = yup.object({
  meetId: yup.number().required("Required"),
  meetDatetime: yup.string().required("select date"),
  meetTypeId: yup.number().required("id req"),
  location: yup.string().required("location req"),
  calledBy: yup.string().required("valled bty req"),

});

type FormDate = yup.TypeOf<typeof validationSchema>;

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

export default function AddMeetingDialog({
  onAddMeetingSuccessDialog,
  onAddMeetingDiscardDialog,
  toEditAddMeeting: toEdit,
  open,
}: AddMeeting) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  let access_token = localStorage.getItem("access_token");

  const handleCloseMenu = () => {

    // onAddMeetingSuccessDialog;
    setAnchorEl(null);
  };

  const formik = useFormik<FormDate>({
    initialValues: {
      meetId: 0,
      meetDatetime: dayjs().format("YYYY-MM-DD"),
      meetTypeId: 0,
      location: "",
      calledBy: "",

    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (toEdit) {
        updateMeetingData.mutate(values)
      }
      createMeetingData.mutate(values)
    },
  });
  useEffect(() => {
    if (toEdit) {
      formik.setValues({
        meetId: toEdit?.meetId,
        meetDatetime: dayjs(toEdit?.meetDatetime).format("YYYY-MM-DD"),
        meetTypeId: toEdit?.meetTypeId,
        location: toEdit?.location,
        calledBy: toEdit?.calledBy,

      });
    }
  }, [toEdit]);


  let { data: updateMeetingData } = useMutation(() =>
    axios
      .patch("api/Meeting", {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      })
      .then((res) => res.data)
  );
  let { data: createMeetingData } = useMutation((data) =>
    axios
      .post("api/Meeting", data, {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      })
      .then((res) => res.data)
  );

  let userId = localStorage.getItem("userId");

  let meetTypeId = formik.values.meetTypeId;

  const { data: userMeetingtypeData } = useUserMeetingType(userId, {
    params: {
      userId: userId,
    },
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });
  console.log(userMeetingtypeData)

  const { data: agenda } = getAgenda(meetTypeId, {
    params: {
      meetTypeId: meetTypeId,
    },
    headers: {
      Authorization: "Bearer " + access_token,
    },
  })


  const handleClose = () => {
    onAddMeetingDiscardDialog();
  };

  return (
    <Card>
      <Box
      // PaperComponent={FormDialogPaper as never}
      // PaperProps={{
      //   onSubmit: formik.handleSubmit as never,
      //   elevation: 1
      // }}

      // open={open}
      // onClose={handleClose}
      >
        <DialogTitle>{!!toEdit ? "Update" : "Add"} Meeting</DialogTitle>
        <CardContent>
          {/* <TextField
          label="Meeting Id"
          autoFocus
          margin="dense"
          id="meetId"
          name="meetId"
          type="text"
          value={formik.values.meetId}
          onChange={formik.handleChange}
          error={formik.touched.meetId && Boolean(formik.errors.meetId)}
          helperText={formik.touched.meetId && formik.errors.meetId}
          fullWidth
          variant="standard"
        /> */}

          <TextField
            label="meetDatetime"
            autoFocus
            margin="dense"
            name="Date"
            type="date"
            value={formik.values.meetDatetime}
            onChange={formik.handleChange}
            error={
              formik.touched.meetDatetime && Boolean(formik.errors.meetDatetime)
            }
            helperText={formik.touched.meetDatetime && formik.errors.meetDatetime}
            fullWidth
            variant="standard"
          />
          {/* <TextField
          label="MeetTypeId"
          autoFocus
          margin="dense"
          name="MeetTypeId"
          value={formik.values.meetTypeId}
          onChange={formik.handleChange}
          error={formik.touched.meetTypeId && Boolean(formik.errors.meetTypeId)}
          helperText={formik.touched.meetTypeId && formik.errors.meetTypeId}
          fullWidth
          variant="standard"
        /> */}
          <TextField
            label="Location"
            autoFocus
            margin="dense"
            name="Location"
            value={formik.values.location}
            onChange={formik.handleChange}
            error={formik.touched.location && Boolean(formik.errors.location)}
            helperText={formik.touched.location && formik.errors.location}
            fullWidth
            variant="standard"
          />
          <TextField
            label="CalledBy"
            autoFocus
            margin="dense"
            name="CalledBy"
            value={formik.values.calledBy}
            onChange={formik.handleChange}
            error={formik.touched.calledBy && Boolean(formik.errors.calledBy)}
            helperText={formik.touched.calledBy && formik.errors.calledBy}
            fullWidth
            variant="standard"
          />
          {/* <TextField
          label="PostedBy"
          autoFocus
          margin="dense"
          name="PostedBy"
          value={formik.values.postedBy}
          onChange={formik.handleChange}
          error={formik.touched.postedBy && Boolean(formik.errors.postedBy)}
          helperText={formik.touched.postedBy && formik.errors.postedBy}
          fullWidth
          variant="standard"
        /> */}
          <TextField
            select
            fullWidth
            name="meetTypeId"
            id="meetTypeId"
            margin="dense"
            label="Meeting"
            variant="standard"
            value={formik.values.meetTypeId}
            SelectProps={{
              value: formik.values.meetTypeId,
              onChange: formik.handleChange,
            }}
          >
            {userMeetingtypeData.map((meetType: any, index: number) => (
              <MenuItem key={index} value={meetType.MeetTypeId}>
                {meetType.TypeName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            name="agendaId"
            id="agendaId"
            margin="dense"
            label="Agenda"
            variant="standard"

          >
            {agenda.map((agenda: any, index: number) => (
              <MenuItem key={index} value={agenda.agendaId}>
                {agenda.agenda}
              </MenuItem>
            ))}
          </TextField>
          {/* {formik.values.meetTypeId ? (
            <Autocomplete
              options={agenda ?? []}
              renderOption={((agenda: any, index: number) => (
                <MenuItem key={index} value={agenda.agendaId}>
                  {agenda.agenda}
                </MenuItem>
              ))}
              renderInput={(params) => <TextField
                {...params}
                label='Agendas'
                multiline
                fullWidth
                name="agendaId"
                id="agendaId"
                margin="dense"
                variant="standard" />}
            />
          ) : (null)} */}
        </CardContent>
        <CardActions>
          {toEdit ? (
            <Button type="submit" variant="contained">
              Update
            </Button>
          ) : (
            <Button type="submit" variant="contained">
              Register
            </Button>
          )}
          <Button onClick={handleClose}>Cancel</Button>
        </CardActions>
      </Box>
    </Card>
  );
}
