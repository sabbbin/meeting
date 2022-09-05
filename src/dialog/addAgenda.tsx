import {
  Button,
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
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { IUser } from "../Tables/userTable";
import * as yup from "yup";
import useMeetingType from "../hooks/useMeetingType";
import { IAgenda } from "../Tables/agendaTable";
import useUserMeetingType from "../hooks/useUserMeetingType";
import { ContentPasteSearchOutlined } from "@mui/icons-material";

interface AddAgendaProps extends DialogProps {
  onDiscardDialog: () => void;
  onSuccessDialog: () => void;
  toEditAddAgenda?: IAgenda | null;
  refetch: () => void;
}

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

const validationSchema = yup.object({
  agenda: yup.string().required("Please provide a Meeting name."),
  description: yup.string().required("Please provide an Alias."),
  meetTypeId: yup.number(),
});

export default function AddAgendaDialog({
  refetch,
  onSuccessDialog,
  toEditAddAgenda: toEdit,

  open,
}: AddAgendaProps) {
  let accessToken = localStorage.getItem("access_token");

  const headers = {
    Authorization: "Bearer " + accessToken,
  };

  type CreateAgenda = {
    agenda: string;
    meetTypeId: number;
    description: string;
  };

  useEffect(() => {
    if (toEdit) {
      formik.setValues({
        agenda: toEdit.agenda,
        description: toEdit.description,
        meetTypeId: toEdit.meetTypeId,
        postedBy: toEdit.postedBy,
      });
    }
  }, [toEdit]);

  const CreateMeetingTypeMutation = useMutation<unknown, unknown, CreateAgenda>(
    async (data) =>
      await axios
        .post("api/MeetingAgenda", data, {
          headers: headers,
        })
        .then((res) => res.data),
    {
      onSuccess() {
        refetch();
        onSuccessDialog();
      },
    }
  );

  const UpdateMeetingTypeMutation = useMutation<unknown, unknown, IAgenda>(
    async (data) =>
      await axios
        .put("api/MeetingAgenda", data, {
          headers: headers,
        })
        .then((res) => res.data),
    {
      onSuccess() {
        refetch();
        onSuccessDialog();
      },
    }
  );

  let userId = localStorage.getItem("userId");

  const { data: userMeetingtypeData } = useUserMeetingType(userId, {
    params: {
      userId: userId,
    },
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  let postedBy = Number(localStorage.getItem("userId"))!;
  const formik = useFormik({
    initialValues: {
      agenda: "",
      description: "",
      meetTypeId: userMeetingtypeData[0]?.MeetTypeId!,
      postedBy: postedBy,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (toEdit) {
        let tempdata = { ...toEdit, ...values };
        UpdateMeetingTypeMutation.mutate(tempdata);
      } else {
        CreateMeetingTypeMutation.mutate(values);
      }
    },
  });

  return (
    <Dialog
      PaperComponent={FormDialogPaper as never}
      PaperProps={{
        onSubmit: formik.handleSubmit as never,
      }}
      open={open}
    >
      <DialogTitle>{!!toEdit ? "Update" : "Add"} Agenda</DialogTitle>
      <DialogContent>
        <TextField
          label="Agenda"
          autoFocus
          margin="dense"
          id="agenda"
          name="agenda"
          value={formik.values.agenda}
          onChange={formik.handleChange}
          error={formik.touched.agenda && Boolean(formik.errors.agenda)}
          helperText={formik.touched.agenda && formik.errors.agenda}
          type="typeName"
          fullWidth
          multiline
          variant="standard"
        />
        <TextField
          label="description"
          margin="dense"
          id="description"
          name="description"
          multiline
          value={formik.values.description}
          onChange={formik.handleChange}
          error={
            formik.touched.description && Boolean(formik.errors.description)
          }
          helperText={formik.touched.description && formik.errors.description}
          type="alias"
          fullWidth
          variant="standard"
        />
        <TextField
          select
          fullWidth
          name="meetTypeId"
          id="meetTypeId"
          margin="dense"
          label="Meet Type"
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onSuccessDialog}>Cancel</Button>
        <Button type="submit">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
