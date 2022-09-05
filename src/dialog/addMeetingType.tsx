import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Menu,
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
import { IMeetingType } from "../Tables/meetingTypeTable";
import useMeetingType from "../hooks/useMeetingType";
import useUserMeetingType from "../hooks/useUserMeetingType";

interface AddMeetingTypeProps extends DialogProps {
  onAddMeetingTypeDiscardDialog: () => void;
  onAddMeetingTypeSuccessDialog: () => void;
  toEditAddMeetingType: IMeetingType;
  refetch: () => void;
}

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

const validationSchema = yup.object({
  typeName: yup.string().required("Please provide a Meeting name."),
  alias: yup.string().required("Please provide an Alias."),
  orderIdx: yup.number(),
  isEnable: yup.boolean(),
  meetTypeId: yup.number().required("Please provide a Meeting Type."),
});

type FormData = yup.TypeOf<typeof validationSchema>;

export default function AddMeetingTypeDialog({
  refetch,
  onAddMeetingTypeSuccessDialog,
  onAddMeetingTypeDiscardDialog,
  toEditAddMeetingType: toEdit,
  open,
}: AddMeetingTypeProps) {
  let accessToken = localStorage.getItem("access_token");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const headers = {
    Authorization: "Bearer " + accessToken,
  };

  const CreateMeetingTypeMutation = useMutation<unknown, unknown, FormData>(
    async (data) =>
      await axios
        .post("api/MeetingType", data, {
          headers: headers,
        })
        .then((res) => res.data),
    {
      onSuccess() {
        refetch();
        onAddMeetingTypeSuccessDialog();
      },
    }
  );

  const UpdateMeetingTypeMutation = useMutation<unknown, unknown, FormData>(
    async (data) =>
      await axios
        .put("api/MeetingType", data, {
          headers: headers,
        })
        .then((res) => res.data),
    {
      onSuccess() {
        refetch();
        onAddMeetingTypeSuccessDialog();
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

  const formik = useFormik<FormData>({
    initialValues: {
      typeName: "",
      alias: "",
      isEnable: true,
      orderIdx: 0,
      meetTypeId: 1,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (toEdit) {
        console.log("adsfal", values);
        UpdateMeetingTypeMutation.mutate(values);
      } else CreateMeetingTypeMutation.mutate(values);
    },
  });

  useEffect(() => {
    if (toEdit)
      formik.setValues({
        typeName: toEdit?.TypeName,
        alias: toEdit?.Alias,
        orderIdx: toEdit?.OrderIdx,
        isEnable: toEdit?.IsEnable,
        meetTypeId: toEdit.MeetTypeId,
      });
  }, [toEdit]);

  const handleClose = () => {
    onAddMeetingTypeDiscardDialog();
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
      <DialogTitle>{!!toEdit ? "Update" : "Add"} Meeting Type</DialogTitle>
      <DialogContent>
        <TextField
          label="Meeting Type"
          autoFocus
          margin="dense"
          id="alias"
          name="typeName"
          value={formik.values.typeName}
          onChange={formik.handleChange}
          error={formik.touched.typeName && Boolean(formik.errors.typeName)}
          helperText={formik.touched.typeName && formik.errors.typeName}
          type="typeName"
          fullWidth
          variant="standard"
        />
        <TextField
          label="Alias"
          autoFocus
          margin="dense"
          id="alias"
          name="alias"
          value={formik.values.alias}
          onChange={formik.handleChange}
          error={formik.touched.alias && Boolean(formik.errors.alias)}
          helperText={formik.touched.alias && formik.errors.alias}
          type="alias"
          fullWidth
          variant="standard"
        />
        <TextField
          label="Order Index"
          autoFocus
          margin="dense"
          id="orderIdx"
          name="orderIdx"
          value={formik.values.orderIdx}
          onChange={formik.handleChange}
          error={formik.touched.orderIdx && Boolean(formik.errors.orderIdx)}
          helperText={formik.touched.orderIdx && formik.errors.orderIdx}
          type="orderIdx"
          fullWidth
<<<<<<< HEAD
          variant="standard" />
=======
          variant="standard"
        />
        {/* <TextField
                    select
                    fullWidth
                    name="meetType"
                    id="meetType"
                    margin="dense"
                    label="Meet Type"
                    variant="standard"
                    SelectProps={{
                        value: formik.values.meetType,
                        onChange: formik.handleChange
                    }}>
                    {userMeetingtypeData.map((meetType: any, index: number) => (
                        <MenuItem key={index} value={meetType.MeetTypeId}>{meetType.TypeName}</MenuItem>
                    ))}
                </TextField> */}
>>>>>>> 19f82fc2999405773180c95eb617e7804f230d78
      </DialogContent>
      <DialogActions>
        <Button onClick={onAddMeetingTypeDiscardDialog}>Cancel</Button>
        <Button type="submit">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
