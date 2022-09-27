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
import axios, { AxiosRequestConfig } from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { IUser } from "../Tables/userTable";
import * as yup from "yup";
import useMeetingType from "../hooks/useMeetingType";
import { IAgenda } from "../Tables/agendaTable";
import useUserMeetingType from "../hooks/useUserMeetingType";
import { ContentPasteSearchOutlined } from "@mui/icons-material";
import { useCreateMeetingTypeMutation } from "../hooks/useCreateMeetingTypeMutation";
import { useUpdateMeetingTypeMutation } from "../hooks/useUpdateMeetingTypeMutation";

interface AddAgendaProps extends DialogProps {
  onDiscardDialog: () => void;
  onSuccessDialog: () => void;
  toEditAddAgenda?: IAgenda | null;
  refetch: () => void;
}

export interface CreateAgenda {
  agenda: string;
  meetTypeId: number;
  description: string;
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
  onDiscardDialog,
  open,
}: AddAgendaProps) {
  let accessToken = localStorage.getItem("access_token");

  let userId = localStorage.getItem("userId");

  let axiosConfig: AxiosRequestConfig = {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
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

  const createMeetingTypeMutation = useCreateMeetingTypeMutation(
    axiosConfig,
    refetch,
    onSuccessDialog
  );

  const updateMeetingTypeMutation = useUpdateMeetingTypeMutation(
    {
      ...axiosConfig,
      params: { agendaId: toEdit?.agendaId, userId: userId },
    },
    refetch,
    onSuccessDialog
  );
  //useMutation<unknown, unknown, IAgenda>(
  //   async (data) =>
  //     await axios
  //       .put("api/MeetingAgenda", data, {
  //         params: { agendaId: toEdit?.agendaId },
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Bearer " + accessToken,
  //         },
  //       })
  //       .then((res) => res.data),
  //   {
  //     onSuccess() {
  //       refetch();
  //       onSuccessDialog();
  //     },
  //   }
  // );


  const { data: userMeetingtypeData } = useUserMeetingType(userId, {
    ...axiosConfig,
    params: {
      userId: userId,

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
        updateMeetingTypeMutation.mutate(tempdata);
      } else {
        createMeetingTypeMutation.mutate(values);
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
          // value={formik.values.meetTypeId}
          SelectProps={{
            value: formik.values.meetTypeId ?? userMeetingtypeData[0]?.meetTypeId ?? 1,
            onChange: formik.handleChange,
          }}
        >
          {userMeetingtypeData.map((meetType: any, index: number) => (
            <MenuItem key={index} value={meetType.meetTypeId}>
              {meetType.typeName}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDiscardDialog}>Cancel</Button>
        <Button type="submit">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
