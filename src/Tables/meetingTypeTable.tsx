import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fab,
    IconButton,
    Menu,
    MenuItem,
    MenuList,
    Paper,
    PaperTypeMap,
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
import { memo, MouseEvent, useMemo, useState } from "react";
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
import UserFormDialog from "../dialog/userFormDialog";
import AddMemberDialog from "../dialog/addMemberDialog";
import ChangeStatusDialog, {
    IChangeStatusDialog,
} from "../dialog/changeStatusDialog";
import ChangePasswordDialog from "../dialog/changePasswordDialog copy";
import useUserCount from "../hooks/useUserCount";

import useMeetingType from "../hooks/useMeetingType";
import AddMeetingTypeDialog from "../dialog/addMeetingType";
import useMeetingTypeCount from "../hooks/useMeetingTypeCount";

export interface IMeetingType {
    MeetTypeId?: number;
    TypeName: string;
    Alias: string;
    OrderIdx: number;
    IsEnable: boolean;
}

const columnHelper = createColumnHelper<IMeetingType>();



export default function MeetingTypeTable() {

    const { pagination, handlePageNumberChange, handlePageSizeChange } =
        usePagination({
            pageNumber: 0,
            pageSize: 10
        });
    const [isforMenu, setisforMenu] = useState<IMeetingType | null>()
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleClickColumn = (event: MouseEvent<HTMLButtonElement>, MeetType: IMeetingType) => {
        setAnchorEl(event.currentTarget);
        setisforMenu(MeetType);
    };
    const openMenu = Boolean(anchorEl);

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };


    const columns = useMemo(() =>
        [
            columnHelper.accessor('TypeName', {
                header: "Meeting type",
                cell: info => info.getValue(),
                footer: info => info.column.id,
            }),
            columnHelper.accessor('Alias', {
                header: "Alias",
                cell: info => info.getValue(),
                footer: info => info.column.id,
            }),
            columnHelper.accessor('OrderIdx', {
                header: "Order Index",
                cell: info => info.getValue(),
                footer: info => info.column.id,
            }),
            columnHelper.accessor('IsEnable', {
                header: "Is Enable",
                cell: info => info.getValue() ? 'Enable' : 'Disable',
                footer: info => info.column.id,
            }),
            columnHelper.accessor(row => row, {
                header: 'Actions',
                cell: (info) => <IconButton
                    onClick={(e) => handleClickColumn(e, info.getValue())}>
                    <MoreVertIcon />
                </IconButton>,
            }),
        ],
        ([]))



    let accessToken = localStorage.getItem('access_token');

    let userIdLocal = localStorage.getItem('userId');

    const { data: meetTypeData, refetch } = useMeetingType(pagination.pageSize, pagination.pageNumber + 1, {
        params: {
            pageSize: pagination.pageSize,
            pageNo: pagination.pageNumber + 1,
        },
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })

    const { data: updateStatus, mutate } = useMutation(
        (data: any) =>
            axios.put(`/api/MeetingType/`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + accessToken,
                    },
                }).then((res) => res.data),
        {
            onSuccess: () => {
                refetch();
            },
        },
    )

    const deleteId = isforMenu?.MeetTypeId;

    const { data: deleteMeetingType, mutate: deleteMutatae } = useMutation(
        (data: any) =>
            axios.delete(`/api/MeetingType/${deleteId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + accessToken,
                    },
                }).then((res) => res.data),
        {
            onSuccess: () => {
                refetch();
            },
        },
    )

    const { data: meetingTypeCount } = useMeetingTypeCount(userIdLocal, {
        params: {
            userId: userIdLocal
        },
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })

    const handleDelete = (value: any) => {
        const dataAfterDelete = {
            meetTypeId: deleteId,
            isEnable: value,
            typeName: isforMenu?.TypeName,
            alias: isforMenu?.Alias,
            orderIdx: isforMenu?.OrderIdx,
        };
        deleteMutatae(dataAfterDelete);
    }



    const handleStatusChange = (value: any) => {
        const id = isforMenu?.MeetTypeId
        const updateData = {
            meetTypeId: id,
            isEnable: value,
            typeName: isforMenu?.TypeName,
            alias: isforMenu?.Alias,
            orderIdx: isforMenu?.OrderIdx,
        };
        mutate(updateData);
    }

    const table = useReactTable({
        data: meetTypeData,
        columns,
        getCoreRowModel: getCoreRowModel(),

    });

    return (
        <>
            <Toolbar />
            <Button sx={{ m: 1 }} variant="contained" onClick={() => {
                setIsDialogOpen(true);
                handleCloseMenu();
            }}>
                Add Type
            </Button>
            <AddMeetingTypeDialog
                refetch={refetch}
                open={isDialogOpen}
                toEditAddMeetingType={isforMenu!}
                onAddMeetingTypeDiscardDialog={() => {
                    setisforMenu(null);
                    setIsDialogOpen(false)
                }}
                onAddMeetingTypeSuccessDialog={() => {
                    setisforMenu(null);
                    setIsDialogOpen(false)
                }}
            />
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
                    count={meetingTypeCount.TotalCount}
                    page={pagination.pageNumber}
                    onPageChange={(e, page) => handlePageNumberChange(page)}
                    rowsPerPage={pagination.pageSize}
                    onRowsPerPageChange={(e) => handlePageSizeChange(+e.currentTarget.value)}
                />
                <Menu open={openMenu} anchorEl={anchorEl} onClose={handleCloseMenu} >
                    <MenuItem onClick={() => {
                        setIsDialogOpen(true);
                        handleCloseMenu();
                    }}>Edit</MenuItem >
                    {isforMenu?.IsEnable == true ? (<MenuItem onClick={() => {
                        handleStatusChange(false)
                        handleCloseMenu()
                    }}>Disable</MenuItem>) : (<MenuItem onClick={() => {
                        handleStatusChange(true)
                        handleCloseMenu()
                    }} >Enable</MenuItem>)}
                    <MenuItem onClick={() => {
                        handleDelete(true)
                        handleCloseMenu();
                    }}>Delete</MenuItem>
                </Menu>
            </TableContainer>
        </>
    )
}