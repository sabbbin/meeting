import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle, Fab, IconButton, Menu, MenuItem, MenuList, Paper, PaperTypeMap, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Toolbar } from "@mui/material";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { memo, MouseEvent, useMemo, useState } from "react";
import useUsers from "../hooks/useUsers";

import { Add, Info } from "@mui/icons-material";
import { Field, Form, Formik, FormikHelpers, useFormik } from "formik";
import * as yup from 'yup';
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useMutation } from "@tanstack/react-query";
import usePagination from "../hooks/usePagination";
import useRole from "../hooks/useRole";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import useCount from "../hooks/useCount";
import useRoleById from "../hooks/useRoleById";
import useStatus from "../hooks/useStatus";
import updateUser from "../hooks/updateUser";


const FormDialogPaper = (props: OverridableComponent<PaperTypeMap<{}, "div">>) => <Paper {...props as any} as="form" />

interface Values {
    username: string,
    email: string,
    fullName: string,
    password: string,
    confirmPassword: string,
    roleId: number,
    statusId: number,
    createdBy: string | null,
}
interface UserDialogProps extends DialogProps {
    onDiscardDialog: () => void;
    onSuccessDialog: () => void;
}


const validationSchema = yup.object({
    username: yup
        .string()
        .required('Username is required')
        .typeError('Username name must be a string'),
    email: yup
        .string()
        .email('Enter a valid email')
        .required('Email is required')
        .typeError('Enter a valid email'),
    fullName: yup
        .string()
        .required('Please enter your Full Name')
        .typeError('Fullname name must be a string'),
    password: yup
        .string()
        .min(8, 'Password should be of minimum 8 characters length')
        .required('Password is required')
        .typeError('Password name must be a string'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Password and confirm password should match')
        .min(8, 'Password should be of minimum 8 characters length')
        .required('Password is required')
        .typeError('Password and confirm password should match'),
    role: yup.number(),
});


const UserFormDialog = ({ onDiscardDialog, onSuccessDialog, open }: UserDialogProps) => {


    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };
    let accessToken = localStorage.getItem('access_token')

    const { pagination, handlePageNumberChange, handlePageSizeChange } =
        usePagination({
            pageNumber: 0,
            pageSize: 10
        });

    const { data: userData, refetch } = useUsers(pagination.pageSize, pagination.pageNumber + 1, {
        params: {
            size: pagination.pageSize,
            page: pagination.pageNumber + 1,
        },
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    });

    const { data: roleData, refetch: refetchRoleData } = useRole({
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })

    const headers = {
        Authorization: 'Bearer ' + accessToken
    }

    const RegisterMutation = useMutation<unknown, unknown, Values>(
        async (data) => await axios.post(
            "api/User/Register",
            data,
            {
                headers: headers
            }
        ).then((res) => res.data), {
        onSuccess() {
            refetch()
            refetchRoleData()
            onSuccessDialog()

        },
    })

    const formik = useFormik<Values>({
        initialValues: {
            username: '',
            email: '',
            fullName: '',
            password: '',
            confirmPassword: '',
            roleId: 1,
            createdBy: localStorage.getItem('userId'),
            statusId: 1,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            RegisterMutation.mutate(values);
        }
    })

    const handleClose = () => {
        onDiscardDialog()

    };

    return (
        <Dialog PaperComponent={FormDialogPaper as never} PaperProps={{
            onSubmit: formik.handleSubmit as never
        }} open={open} onClose={handleClose}>
            <DialogTitle>Add user to Channakya-Meetings</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    helperText={formik.touched.username && formik.errors.username}
                    label="Username"
                    type="name"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    margin="dense"
                    id="name"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    margin="dense"
                    id="name"
                    name="fullName"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                    helperText={formik.touched.fullName && formik.errors.fullName}
                    label="Full Name"
                    type="name"
                    fullWidth
                    variant="standard"
                />
                <TextField
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
                    autoFocus
                    margin="dense"
                    id="Password"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    label="Confirm Password"
                    type="Password"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    select
                    fullWidth
                    name="roleId"
                    id="roleId"
                    margin="dense"
                    label="Role"
                    variant="standard"
                    SelectProps={{
                        value: formik.values.roleId,
                        onChange: formik.handleChange
                    }}>
                    {roleData.map((role: any, index: number) => (
                        <MenuItem key={index} value={role.RoleId}>{role.RoleName}</MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={onDiscardDialog}>Cancel</Button>
                <Button type="submit">Submit</Button>
            </DialogActions>
        </Dialog>
    )
}

export default UserFormDialog;