import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, IconButton, Menu, MenuItem, MenuList, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Toolbar } from "@mui/material";
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
    role: string,
    status: string,
    createdBy: string,
    createdOn: string
};

const columnHelper = createColumnHelper<IUser>()

const defaultData: IUser[] = [
    {
        username: 'Jadhav',
        fullName: 'jyaa dyab bro',
        email: 'dangalsushant@gmail.com',
        status: 'Active',
        createdBy: 'raj',
        createdOn: 'april 4 2022',
        role: 'admin',
    },
    {
        username: 'yadav',
        fullName: 'wyadov  bro',
        email: 'yadav@gmail.com',
        status: 'Active',
        createdBy: 'yaj',
        createdOn: 'april 3 2022',
        role: 'admin',
    },
    {
        username: 'madhav',
        email: 'madhav@gmail.com',
        fullName: 'maya dov  bro',
        status: 'Active',
        createdBy: 'myaj',
        createdOn: 'april 2 2022',
        role: 'admin',
    },
    {
        username: 'padhav',
        email: 'padhav@gmail.com',
        fullName: 'paya dov bro',
        status: 'Active',
        createdBy: 'pyaj',
        createdOn: 'april 1 2022',
        role: 'admin',
    }
]


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
                    onClick={handleClickColumn}>
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
            <Button variant="contained" onClick={handleClickOpen}>
                Add User
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add user to Channakya-Meetings</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Username"
                        type="Username"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Full Name"
                        type="name"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="Password"
                        label="Password"
                        type="Password"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="Password"
                        label="Confirm Password"
                        type="Password"
                        fullWidth
                        variant="standard"
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose}>Add user</Button>
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