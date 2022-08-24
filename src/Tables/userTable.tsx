import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, IconButton, Menu, MenuItem, MenuList, Paper, PaperTypeMap, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Toolbar } from "@mui/material";
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
import UserFormDialog from "../dialog/userFormDialog";

export interface IUser {
    username: string,
    fullName: string,
    email: string,
    roleId: number,
    role: string,
    statusId: number,
    status: string | null,
    createdById: number,
    createdBy: string,
    createdOn: string
};

// interface Values {
//     username: string,
//     email: string,
//     fullName: string,
//     password: string,
//     confirmPassword: string,
//     roleId: number,
//     statusId: number,
//     createdBy: string | null,
// }

interface Role {
    RoleId: number,
    RoleName: string,
    Alias: string,
    OrderIdx: number,
    IsEnable: boolean,
}



// const validationSchema = yup.object({
//     username: yup
//         .string()
//         .required('Username is required')
//         .typeError('Username name must be a string'),
//     email: yup
//         .string()
//         .email('Enter a valid email')
//         .required('Email is required')
//         .typeError('Enter a valid email'),
//     fullName: yup
//         .string()
//         .required('Please enter your Full Name')
//         .typeError('Fullname name must be a string'),
//     password: yup
//         .string()
//         .min(8, 'Password should be of minimum 8 characters length')
//         .required('Password is required')
//         .typeError('Password name must be a string'),
//     confirmPassword: yup
//         .string()
//         .oneOf([yup.ref('password'), null], 'Password and confirm password should match')
//         .min(8, 'Password should be of minimum 8 characters length')
//         .required('Password is required')
//         .typeError('Password and confirm password should match'),
//     role: yup.number(),
// });

const columnHelper = createColumnHelper<IUser>()


// const FormDialogPaper = (props: OverridableComponent<PaperTypeMap<{}, "div">>) => <Paper {...props as any} as="form" />


export default function UserTable(axiosConfig: AxiosRequestConfig) {

    const { pagination, handlePageNumberChange, handlePageSizeChange } =
        usePagination({
            pageNumber: 0,
            pageSize: 10
        });
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



    const getStatusID = (statusId: number) => {
        switch (statusId) {
            case 1:
                return 'success';
            case 2:
                return 'warning';
            case 3:
                return 'secondary';
            case 4:
                return 'error';

        }
    }

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
            columnHelper.accessor(row => row, {
                header: "Status",
                cell: info => <Chip size="small" label={info.getValue().status} color={getStatusID(info.getValue().statusId)} />,
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

    // const formik = useFormik<Values>({
    //     initialValues: {
    //         username: '',
    //         email: '',
    //         fullName: '',
    //         password: '',
    //         confirmPassword: '',
    //         roleId: 1,
    //         createdBy: localStorage.getItem('userId'),
    //         statusId: 1,
    //     },
    //     validationSchema: validationSchema,
    //     onSubmit: (values) => {
    //         RegisterMutation.mutate(values);
    //     }
    // })

    // const headers = {
    //     Authorization: 'Bearer ' + accessToken
    // }

    // const RegisterMutation = useMutation<unknown, unknown, Values>(
    //     async (data) => await axios.post(
    //         "api/User/Register",
    //         data,
    //         {
    //             headers: headers
    //         }
    //     ).then((res) => res.data), {
    //     onSuccess() {
    //         refetch()
    //         refetchRoleData()
    //     },
    // })


    return (
        <>
            <Toolbar />
            <Button sx={{ m: 1 }} variant="contained" onClick={() => {
                setIsDialogOpen(true);
                handleClose();
            }}>
                Add User
            </Button>
            <UserFormDialog

                open={isDialogOpen}
                onSuccessDialog={() => {

                    setIsDialogOpen(false);
                }}
                onDiscardDialog={() => {

                    setIsDialogOpen(false);
                }} />
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
                    <TableBody >
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
                    <MenuItem onClick={handleClickOpen}>Edit</MenuItem>
                    <MenuItem>Delete</MenuItem>
                    <MenuItem>Change Status</MenuItem>
                </Menu>
            </TableContainer>
        </>)
}