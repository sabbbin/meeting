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
import changeUserStatus from "../hooks/changeUserStatus";
import useStatus from "../hooks/useStatus";
import { IUser } from "../Tables/userTable";
import * as yup from "yup";

export interface IChangePasswordDialog {
  userId: number;
  password: string;
  confirmPassword: string;
  oldPassword?: string;
}

interface ChangePasswordProps extends DialogProps {
  onChangePasswordDiscardDialog: () => void;
  onChangePasswordSuccessDialog: () => void;
  toEditChangePasswprd: number;
  shouldEnterOldPassword?: boolean
}

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

const validationSchema = yup.object({
  password: yup
    .string()
    .min(8, "Password should be of minimum 8 characters length")
    .required()
    .typeError("Password name must be a string"),
  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("password"), null],
      "Password and confirm password should match"
    )
    .min(8, "Password should be of minimum 8 characters length")
    .required()
    .typeError("Password and confirm password should match"),
});

const validationSchemaUser = validationSchema.shape({
  oldPassword: yup.string()
    // .min(8, "Password should be of minimum 8 characters length")
    .required()
    .typeError("Password name must be a string"),
})

export default function ChangePasswordDialog({
  onChangePasswordDiscardDialog,
  onChangePasswordSuccessDialog,
  toEditChangePasswprd: toEdit,
  open,
  shouldEnterOldPassword
}: ChangePasswordProps) {
  let accessToken = localStorage.getItem("access_token");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const headers = {
    Authorization: "Bearer " + accessToken,
  };

  const ChangePasswordAdmin = useMutation<
    unknown,
    unknown,
    IChangePasswordDialog
  >(
    async (data) =>
      await axios
        .put("api/User/ResetPasswordByAdmin", data, {
          headers: headers,
        })
        .then((res) => res.data),
    {
      onSuccess() {
        onChangePasswordSuccessDialog();
      },
    }
  );

  const ResetPasswordByUser = useMutation<unknown, unknown, IChangePasswordDialog>(
    async (data) =>
      await axios.put("api/User/ResetPasswordByUser", data, {
        headers: headers,
      }).then((res) => res.data),
    {
      onSuccess() {
        onChangePasswordSuccessDialog();
      },
    }
  )

  const formik = useFormik<IChangePasswordDialog>({
    initialValues: {
      userId: toEdit,
      password: "",
      confirmPassword: "",
      oldPassword: "",
    },
    validationSchema: shouldEnterOldPassword ? validationSchemaUser : validationSchema,
    onSubmit: (values) => {
      if (shouldEnterOldPassword) {
        ResetPasswordByUser.mutate(values)
      }
      else {
        ChangePasswordAdmin.mutate(values);
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
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        {shouldEnterOldPassword && <TextField
          autoFocus
          margin="dense"
          id="oldPassword"
          name="oldPassword"
          value={formik.values.oldPassword}
          onChange={formik.handleChange}
          error={formik.touched.oldPassword && Boolean(formik.errors.oldPassword)}
          helperText={formik.touched.oldPassword && formik.errors.oldPassword}
          label="oldPassword"
          type="oldPassword"
          fullWidth
          variant="standard"
        />}
        <TextField
          autoFocus
          margin="dense"
          id="Password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          label="Password"
          type="Password"
          fullWidth
          variant="standard"
        />
        <TextField
          margin="dense"
          id="Password"
          name="confirmPassword"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          error={
            formik.touched.confirmPassword &&
            Boolean(formik.errors.confirmPassword)
          }
          helperText={
            formik.touched.confirmPassword && formik.errors.confirmPassword
          }
          label="Confirm Password"
          type="Password"
          fullWidth
          variant="standard"
        />

      </DialogContent>
      <DialogActions>
        <Button onClick={onChangePasswordDiscardDialog}>Cancel</Button>
        <Button type="submit">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
