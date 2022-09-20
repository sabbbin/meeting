import {
    Alert,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogProps,
    DialogTitle,
    Fab,
    IconButton,
    Menu,
    MenuItem,
    MenuList,
    Paper,
    PaperTypeMap,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Toolbar,
} from "@mui/material";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import {
    Fragment,
    memo,
    MouseEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import useUsers from "../hooks/useUsers";

import { Add, Info } from "@mui/icons-material";
import { Field, Form, Formik, FormikHelpers, useFormik } from "formik";
import * as yup from "yup";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useMutation } from "@tanstack/react-query";
import usePagination from "../hooks/usePagination";
import useRole from "../hooks/useRole";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import useRoleById from "../hooks/useRoleById";
import useStatus from "../hooks/useStatus";
import updateUser from "../hooks/updateUser";
import { IUser } from "../Tables/userTable";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { number } from "yup/lib/locale";

const FormDialogPaper = (
    props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

interface IPostpond {
    meetId: number,
    newMeetingDatetime: string,
    comment?: string,
    postedBy: number
}
interface UserDialogProps extends DialogProps {
    onDiscardDialog: () => void;
    onSuccessDialog: () => void;
    refetch: () => void;
}

const validationSchema = yup.object({
    meetId: yup.number(),
    newMeetingDatetime: yup.string().required('Please enter date and time'),
    comment: yup.string().optional(),
    postedBy: yup.number(),

});


const PostpondMeeting = ({
    onDiscardDialog,
    onSuccessDialog,
    open,
    refetch,
}: UserDialogProps) => {


    let accessToken = localStorage.getItem("access_token");

    let userId = localStorage.getItem("userId")

    const headers = {
        Authorization: "Bearer " + accessToken,
    };

    const PostpondMeeting = useMutation<unknown, unknown, IPostpond>(
        async (data) =>
            await axios
                .put("api/Meeting/Postpond", data, {
                    headers: headers,
                })
                .then((res) => res.data),
        {
            onSuccess() {
                onSuccessDialog()
                refetch()
            },
        }
    );


    const formik = useFormik<IPostpond>({
        initialValues: {
            meetId: 0,
            newMeetingDatetime: dayjs().format(),
            comment: '',
            postedBy: Number(userId),
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            PostpondMeeting.mutate(values);
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
            <DialogTitle>Postpond Meeting</DialogTitle>
            <DialogContent >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        label='Date/time'
                        value={formik.values.newMeetingDatetime}
                        inputFormat="YYYY-MM-DD  HH:MM:ss A"
                        onChange={(newValue) => {
                            formik.setFieldValue("newMeetingDatetime", newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                fullWidth
                                error={
                                    formik.touched.newMeetingDatetime &&
                                    Boolean(formik.errors.newMeetingDatetime)
                                }
                                helperText={
                                    formik.touched.newMeetingDatetime && formik.errors.newMeetingDatetime
                                }
                                {...params}
                            />
                        )}
                    />
                </LocalizationProvider>
                <TextField
                    margin="dense"
                    id="comment"
                    name="comment"
                    value={formik.values.comment}
                    onChange={formik.handleChange}
                    error={formik.touched.comment && Boolean(formik.errors.comment)}
                    helperText={formik.touched.comment && formik.errors.comment}
                    label="Comment"
                    type="name"
                    multiline
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onDiscardDialog}>Cancel</Button>
                <Button type="submit">Submit</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PostpondMeeting;
