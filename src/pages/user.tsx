import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar } from "@mui/material";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useState } from "react";

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
        createdBy: 'raj',
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

const columns = [
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

]


export default function User() {

    const table = useReactTable({
        data: defaultData,
        columns,
        getCoreRowModel: getCoreRowModel()
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
                                    <TableCell key={header.id}>
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
            </TableContainer>
        </>
    )
}