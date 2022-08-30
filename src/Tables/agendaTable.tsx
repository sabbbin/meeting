import { Button, IconButton, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Toolbar } from "@mui/material";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { MouseEvent, ReactNode, useState } from "react";
import usePagination from "../hooks/usePagination";
import useAgenda from "../hooks/useAgenda";
import dayjs from "dayjs";
import useAgendaCount from "../hooks/useAgendaCount";

export interface IAgenda {
    agendaId?: string,
    agenda: string,
    typeName: number,
    meetTypeId?: number,
    description: string,
    statusId?: number,
    statusName: string,
    postedBy?: number,
    postedOn: string,
    fullName: string,
};

const columnHelper = createColumnHelper<IAgenda>()



export default function AgendaTable() {


    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    console.log(anchorEl);
    const [isforAgenda, setisforAgenda] = useState<IAgenda | null>()
    const openMenu = Boolean(anchorEl);

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleClickColumn = (event: MouseEvent<HTMLButtonElement>, agenda: IAgenda) => {
        setAnchorEl(event.currentTarget);
        setisforAgenda(agenda);

    };


    const { pagination, handlePageNumberChange, handlePageSizeChange } =
        usePagination({
            pageNumber: 0,
            pageSize: 10
        });

    const columns = [
        columnHelper.accessor('typeName', {
            header: "Type",
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('agenda', {
            header: "Agenda",
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor(row => row.description, {
            header: "Description",
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('statusName', {
            header: "Status",
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('fullName', {
            header: "Posted By",
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor(row => row.postedOn, {
            header: "Posted On",
            cell: info => dayjs(info.getValue()).format('YYYY-MM-DD'),
            footer: info => info.column.id,
        }),

        columnHelper.accessor(row => row, {
            header: 'Actions',
            cell: (info) => <IconButton
                onClick={(e) => handleClickColumn(e, info.getValue())}>
                <MoreVertIcon />
            </IconButton>,
        }),
    ]

    let accessToken = localStorage.getItem('access_token');

    let userId = localStorage.getItem('userId');

    const { data: meetingAgendaData, refetch } = useAgenda(pagination.pageSize, pagination.pageNumber + 1, userId, {
        params: {
            pageSize: pagination.pageSize,
            pageNo: pagination.pageNumber + 1,
            userId: userId
        },
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })

    const { data: meetingCount } = useAgendaCount(userId, {
        params: {
            userId: userId
        },
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })

    const table = useReactTable({
        data: meetingAgendaData,
        columns,
        getCoreRowModel: getCoreRowModel(),

    });

    return (
        <>
            <Toolbar />
            <Button sx={{ m: 1 }} variant="contained">Add Agenda</Button>
            <TableContainer sx={{ minWidth: 1000 }} component={Paper} >
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
                    <TableBody sx={{ textOverflow: "ellipsis" }}>
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
                    count={meetingCount.TotalCount}
                    page={pagination.pageNumber}
                    onPageChange={(e, page) => handlePageNumberChange(page)}
                    rowsPerPage={pagination.pageSize}
                    onRowsPerPageChange={(e) => handlePageSizeChange(+e.currentTarget.value)}
                />
                <Menu open={openMenu} anchorEl={anchorEl} onClose={handleCloseMenu}>
                    <MenuItem>Edit</MenuItem>
                    <MenuItem>Delete</MenuItem>
                </Menu>
            </TableContainer>
        </>
    )
}