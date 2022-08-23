import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, IconButton, Menu, MenuItem, MenuList, Paper, PaperTypeMap, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Toolbar } from "@mui/material";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { memo, MouseEvent, useMemo, useState } from "react";
import useUsers from "../hooks/useUsers";

import { Add } from "@mui/icons-material";
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

export interface IUser {
    username: string,
    fullName: string,
    email: string,
    roleId: number,
    role: string,
    statusId: number,
    status: string,
    createdById: number,
    createdBy: string,
    createdOn: string
};

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

interface Role {
    RoleId: number,
    RoleName: string,
    Alias: string,
    OrderIdx: number,
    IsEnable: boolean,
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

const columnHelper = createColumnHelper<IUser>()


const FormDialogPaper = (props: OverridableComponent<PaperTypeMap<{}, "div">>) => <Paper {...props as any} as="form" />


export default function UserTable(axiosConfig: AxiosRequestConfig) {

    const { pagination, handlePageNumberChange, handlePageSizeChange } =
        usePagination({
            pageNumber: 0,
            pageSize: 10
        });
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const handleClickColumn = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const columns = useMemo(() =>
        [
            columnHelper.accessor('username', {
                header: "Username",
                cell: info => info.getValue(),
                footer: info => info.column.id,
            }),
            columnHelper.accessor('fullName', {
                header: "Full Name",
                cell: info => info.getValue(),
                footer: info => info.column.id,
            }),

            columnHelper.accessor(row => row.email, {
                header: "Email",
                cell: info => info.getValue(),
                footer: info => info.column.id,
            }),
            columnHelper.accessor('role', {
                header: "Role",
                cell: info => info.getValue(),
                footer: info => info.column.id,
            }),
            columnHelper.accessor(row => row.status, {
                header: "Status",
                cell: info => info.getValue(),

            }),
            columnHelper.accessor(row => row.createdBy, {
                header: "Created By",
                cell: info => info.getValue(),
                footer: info => info.column.id,

            }),
            columnHelper.accessor(row => row.createdOn, {
                header: "Created On",
                cell: info => dayjs(info.getValue()).format('DD/MM/YYYY'),
                footer: info => info.column.id,
            }),
            columnHelper.display({
                header: 'Actions',
                cell: () => <IconButton
                    onClick={handleClickColumn}>
                    <MoreVertIcon />
                </IconButton>,
            }),
        ],
        ([]))

    let accessToken = localStorage.getItem('access_token')

    const { data: userData, refetch } = useUsers(pagination.pageSize, pagination.pageNumber + 1, {
        params: {
            size: pagination.pageSize,
            page: pagination.pageNumber + 1,
        },
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    });

    const { data: countData } = useCount({
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })

    // const { data: updateUserData } = updateUser({
    //     headers: {
    //         Authorization: 'Bearer ' + accessToken,
    //     },
    // })

    const { data: roleData, refetch: refetchRoleData } = useRole({
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    });

    const { data: userStatusData, refetch: refetchStatus } = useStatus({
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    });

    // const { data: roleByIdData } = useRoleById(4, {
    //     headers: {
    //         Authorization: 'Bearer ' + accessToken,
    //     },
    // });


    const table = useReactTable({
        data: userData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

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
        },
    })


    return (
        <>
            <Toolbar />
            <Button sx={{ m: 1 }} variant="contained" onClick={handleClickOpen}>
                Add User
            </Button>
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
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add user</Button>
                </DialogActions>
            </Dialog>
            <TableContainer sx={{ minWidth: 1000, margin: '1' }} component={Paper} >
                <Table size="small">
                    <TableHead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableCell width="140px" sx={{
                                        fontWeight: '600',
                                    }} key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody sx={{}}>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    width="140px"
                    component="div"
                    count={countData.TotalCount}
                    page={pagination.pageNumber}
                    onPageChange={(e, page) => handlePageNumberChange(page)}
                    rowsPerPage={pagination.pageSize}
                    onRowsPerPageChange={(e) => handlePageSizeChange(+e.currentTarget.value)}
                />
                <Menu open={openMenu} anchorEl={anchorEl} onClose={handleCloseMenu}>
                    <MenuItem>Edit</MenuItem>
                    <MenuItem>Delete</MenuItem>
                    <MenuItem>Change Status</MenuItem>
                </Menu>
            </TableContainer>
        </>)
}