import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar } from "@mui/material";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ReactNode, useState } from "react";

export interface IAgenda {
    agenda: string,
    meetType: number,
    email: string,
    description: string,
    postedBy: string,
    postedOn: string

};

const columnHelper = createColumnHelper<IAgenda>()

const defaultData: IAgenda[] = [
    {
        agenda: 'This is a dummy agenda 0',
        meetType: 0,
        email: 'abc@gmail.com',
        description: 'This is a dummy disc',
        postedBy: 'Ram',
        postedOn: '1914/6/9'
    },
    {
        agenda: 'This is a dummy agenda 1',
        meetType: 1,
        email: 'abc@gmail.com',
        description: 'This is a dummy disc',
        postedBy: 'Shyam',
        postedOn: '1914/6/8'
    },
    {
        agenda: 'This is a dummy agenda 2',
        meetType: 2,
        email: 'abc@gmail.com',
        description: 'This is a dummy disc',
        postedBy: 'Hari',
        postedOn: '1914/6/10'
    },
    {
        agenda: 'This is a dummy agenda 3',
        meetType: 3,
        email: 'abc@gmail.com',
        description: 'This is a dummy disc',
        postedBy: 'Puri',
        postedOn: '1914/6/5'
    },
]

const columns = [
    columnHelper.accessor('agenda', {
        header: "Agenda",
        cell: info => info.getValue(),
        footer: info => info.column.id,
    }),
    columnHelper.accessor('meetType', {
        header: "MeetType",
        cell: info => info.getValue(),
        footer: info => info.column.id,
    }),
    columnHelper.accessor(row => row.email, {
        header: "Email",
        cell: info => info.getValue(),
        footer: info => info.column.id,
    }),
    columnHelper.accessor(row => row.description, {
        header: "Description",
        cell: info => info.getValue(),
        footer: info => info.column.id,
    }),
    columnHelper.accessor(row => row.postedBy, {
        header: "Posted By",
        cell: info => info.getValue(),
        footer: info => info.column.id,
    }),
    columnHelper.accessor(row => row.postedOn, {
        header: "Posted On",
        cell: info => info.getValue(),
        footer: info => info.column.id,
    }),

]


export default function AgendaTable() {

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
            </TableContainer>
        </>
    )
}