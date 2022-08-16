import { Fab, IconButton, Menu, MenuItem, MenuList, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar } from "@mui/material";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { MouseEvent, useMemo, useState } from "react";
import useUsers from "../hooks/useUsers";
import usePagination from "@mui/material/usePagination/usePagination";
import { Add } from "@mui/icons-material";

export interface IUser {
    username: string,
    fullName: string,
    email: string,
    status: string,
    createdBy: string,
    createdOn: string

};

const columnHelper = createColumnHelper<IUser>()

const defaultData: IUser[] = [
    {
        username: 'hemraj',
        fullName: 'Hyam ryaj bro',
        email: 'dangalsushant@gmail.com',
        status: 'Active',
        createdBy: 'raj',
        createdOn: 'april 4 2022',
    },
    {
        username: 'yadav',
        fullName: 'wyadov  bro',
        email: 'yadav@gmail.com',
        status: 'Active',
        createdBy: 'yaj',
        createdOn: 'april 3 2022'
    },
    {
        username: 'madhav',
        email: 'madhav@gmail.com',
        fullName: 'maya dov  bro',
        status: 'Active',
        createdBy: 'myaj',
        createdOn: 'april 2 2022'
    },
    {
        username: 'padhav',
        email: 'padhav@gmail.com',
        fullName: 'paya dov bro',
        status: 'Active',
        createdBy: 'pyaj',
        createdOn: 'april 1 2022'
    }
]


export default function UserTable() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
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
            columnHelper.accessor(row => row.status, {
                header: "Status",
                cell: info => info.getValue(),
                footer: info => info.column.id,
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
                    onClick={handleClick}>
                    <MoreVertIcon />
                </IconButton>,
            }),
        ],
        ([]))


    const { data } = useUsers();

    const table = useReactTable({
        data: defaultData,
        columns,
        getCoreRowModel: getCoreRowModel(),

    });

    return (
        <>
            <Toolbar />
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
                <Fab
                    size='small'
                    color='primary'
                    aria-label='add'
                    style={{ position: 'fixed', bottom: '32px', right: '32px' }}
                    onClick={() => {
                        setIsDialogOpen(true);

                    }}>
                    <Add />
                </Fab>
                <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
                    <MenuItem>Edit</MenuItem>
                    <MenuItem>Delete</MenuItem>
                </Menu>
            </TableContainer>
        </>
    )
}