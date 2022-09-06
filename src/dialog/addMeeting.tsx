import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Paper,
  PaperTypeMap,
  TextField,
} from "@mui/material";
import { IMeeting } from "../Tables/meeting";
import * as yup from "yup";
import { useEffect, useState } from "react";
import { useFormControlUnstyledContext } from "@mui/base";
import { useFormik } from "formik";
import { MeetingRoomRounded } from "@mui/icons-material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import dayjs from "dayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

interface AddMeeting extends DialogProps {
  onAddMeetingDiscardDialog: () => void;
  onAddMeetingSuccessDialog: () => void;
  toEditAddMeeting: IMeeting;
}

const validationSchema = yup.object({
  meetId: yup.number().required("Required"),
  meetDatetime: yup.string().required("select date"),
  meetTypeId: yup.number().required("requred"),
  location: yup.string().required("required"),
  calledBy: yup.string().required("requried"),
  postedBy: yup.number().required("required"),
  postedOn: yup.string().required("select the data"),
  statusId: yup.number().required("required"),
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
  const formik = useFormik<FormDate>({
    initialValues: {
      meetId: 0,
      meetDatetime: dayjs().format("YYYY-MM-DD"),
      meetTypeId: 0,
      location: "",
      calledBy: "",
      postedBy: 0,
      postedOn: dayjs().format("YYYY-MM-DD"),
      statusId: 0,
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
        postedBy: toEdit?.postedBy,
        postedOn: dayjs(toEdit?.postedOn).format("YYYY-MM-DD"),
        statusId: toEdit?.statusId,
      });
    }
  }, [toEdit]);

  const handleClose = () => {
    onAddMeetingDiscardDialog();
  };

  return (
    <Dialog
      PaperComponent={FormDialogPaper as never}
      PaperProps={{
        onSubmit: formik.handleSubmit as never,
      }}
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>{!!toEdit ? "Update" : "Add"} Meeting</DialogTitle>
      <DialogContent>
        <TextField
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
        />
        <TextField
          label="meetDatetime"
          autoFocus
          margin="dense"
          name="meetDatetime"
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
        <TextField
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
        />
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
        <TextField
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
        />
        <TextField
          label="Posted On"
          autoFocus
          margin="dense"
          name="postedOn"
          type="date"
          value={formik.values.postedOn}
          onChange={formik.handleChange}
          error={formik.touched.postedOn && Boolean(formik.errors.postedOn)}
          helperText={formik.touched.postedOn && formik.errors.postedOn}
          fullWidth
          variant="standard"
        />
        <TextField
          label="Status Id"
          autoFocus
          margin="dense"
          name="statusId"
          value={formik.values.statusId}
          onChange={formik.handleChange}
          error={formik.touched.statusId && Boolean(formik.errors.statusId)}
          helperText={formik.touched.statusId && formik.errors.statusId}
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        {toEdit ? (
          <Button type="submit" variant="contained">
            Update
          </Button>
        ) : (
          <Button type="submit" variant="contained">
            Register
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
