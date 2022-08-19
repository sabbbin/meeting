import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, IconButton, Menu, MenuItem, MenuList, Paper, PaperTypeMap, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Toolbar } from "@mui/material";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { memo, MouseEvent, useMemo, useState } from "react";
import useUsers from "../hooks/useUsers";
import usePagination from "@mui/material/usePagination/usePagination";
import { Add } from "@mui/icons-material";
import { Field, Form, Formik, FormikHelpers, useFormik } from "formik";
import * as yup from 'yup';
import { OverridableComponent } from "@mui/material/OverridableComponent";

export interface IUser {
    username: string,
    fullName: string,
    email: string,
    role: string,
    status: string,
    createdBy: string,
    createdOn: string
};


interface Values {
    username: string,
    email: string,
    fullName: string,
    password: string,
    confirmPassword: string,
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
        .required('Please enter your Full')
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
});



const columnHelper = createColumnHelper<IUser>()


const FormDialogPaper = (props: OverridableComponent<PaperTypeMap<{}, "div">>) => <Paper {...props as any} as="form" />


export default function UserTable() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
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
                cell: info => info.getValue(),
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



    const { data } = useUsers({
        headers: {
            Authorization: 'Bearer ' + accessToken
        },

    });
    console.log(data)

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),

    });

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            fullName: '',
            password: '',
            confirmPassword: ''
        },
        validationSchema: validationSchema,
        onSubmit:
            (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
                setTimeout(() => {
                    alert(JSON.stringify(values, null, 2));
                    setSubmitting(false);
                }, 500);
            }
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
                        name="userName"
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
                        autoFocus
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
                        autoFocus
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add user</Button>
                </DialogActions>
            </Dialog>
            <TableContainer sx={{ minWidth: 1000, margin: '1' }} component={Paper} >
                <Table>
                    <TableHead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableCell sx={{
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
                <Menu open={openMenu} anchorEl={anchorEl} onClose={handleCloseMenu}>
                    <MenuItem>Edit</MenuItem>
                    <MenuItem>Delete</MenuItem>
                    <MenuItem>Change Status</MenuItem>
                </Menu>
            </TableContainer>
        </>)
}