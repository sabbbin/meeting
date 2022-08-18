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
    userName: string,
    fullName: string,
    email: string,
    role: string,
    status: string,
    createdBy: string,
    createdOn: string
};


interface Values {
    userName: string,
    email: string,
    fullName: string,
    password: string,
    confirmPassword: string,
}

const validationSchema = yup.object({
    userName: yup
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

// const defaultData: IUser[] = [
//     {
//         username: 'Jadhav',
//         fullName: 'jyaa dyab bro',
//         email: 'dangalsushant@gmail.com',
//         status: 'Active',
//         createdBy: 'raj',
//         createdOn: 'april 4 2022',
//         role: 'admin',
//     },
//     {
//         username: 'yadav',
//         fullName: 'wyadov  bro',
//         email: 'yadav@gmail.com',
//         status: 'Active',
//         createdBy: 'yaj',
//         createdOn: 'april 3 2022',
//         role: 'admin',
//     },
//     {
//         username: 'madhav',
//         email: 'madhav@gmail.com',
//         fullName: 'maya dov  bro',
//         status: 'Active',
//         createdBy: 'myaj',
//         createdOn: 'april 2 2022',
//         role: 'admin',
//     },
//     {
//         username: 'padhav',
//         email: 'padhav@gmail.com',
//         fullName: 'paya dov bro',
//         status: 'Active',
//         createdBy: 'pyaj',
//         createdOn: 'april 1 2022',
//         role: 'admin',
//     }

// ]

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
            columnHelper.accessor('userName', {
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


    const { data } = useUsers({
        headers: {
            Authorization: `Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTUxMiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9naXZlbm5hbWUiOiJOaXIgS3IuIFJhaSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoibmlya3JhaSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6Im5pci5yYWlAY2hhbm5ha3lhc29mdC5jb20iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiZXhwIjoxNjYwODE3NDQ4LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MjgzIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzI4MyJ9.78ethsXk_Ehz7CwzGaCxIZEEyTfjsPKHjwohPQ6custRX0beT-jw2-hpaXI7rvIBGkCeAezWQpTklqcYMMc-WA`
        }
    });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),

    });

    const formik = useFormik({
        initialValues: {
            userName: '',
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
                        value={formik.values.userName}
                        onChange={formik.handleChange}
                        error={formik.touched.userName && Boolean(formik.errors.userName)}
                        helperText={formik.touched.userName && formik.errors.userName}
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
                                        fontWeight: '600'
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
                    <TableBody>
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