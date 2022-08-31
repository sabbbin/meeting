import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
} from "@mui/material";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { MouseEvent, useCallback, useMemo, useState } from "react";
import AddMeetingDialog from "../dialog/addMeeting";

export interface IMeeting {
  meetId: number;
  meetDatetime: Date;
  meetTypeId: number;
  location: string;
  calledBy: string;
  postedBy: number;
  postedOn: Date;
  statusId: number;
}

const data: IMeeting[] = [
  {
    meetId: 0,
    meetDatetime: new Date("2022-08-31T04:21:27.168Z"),
    meetTypeId: 0,
    location: "string",
    calledBy: "string",
    postedBy: 0,
    postedOn: new Date("2022-08-31T04:21:27.168Z"),
    statusId: 0,
  },
  {
    meetId: 0,
    meetDatetime: new Date("2022-08-31T04:21:27.168Z"),
    meetTypeId: 0,
    location: "string",
    calledBy: "string",
    postedBy: 0,
    postedOn: new Date("2022-08-31T04:21:27.168Z"),
    statusId: 0,
  },
  {
    meetId: 0,
    meetDatetime: new Date("2022-08-31T04:21:27.168Z"),
    meetTypeId: 0,
    location: "string",
    calledBy: "string",
    postedBy: 0,
    postedOn: new Date("2022-08-31T04:21:27.168Z"),
    statusId: 0,
  },
];
const columnHelper = createColumnHelper<IMeeting>();

const columns = [
  columnHelper.accessor("meetId", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("meetDatetime", {
    cell: (info) => dayjs(info.getValue()).format("DD/MM/YYYY"),
  }),
  columnHelper.accessor("meetTypeId", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("location", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("calledBy", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("postedBy", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("postedOn", {
    cell: (info) => dayjs(info.getValue()).format("DD/MM/YYYY"),
  }),
  columnHelper.accessor("statusId", {
    cell: (info) => info.getValue(),
  }),
];

const handleChangePage = () => {};
const handleChangeRowsPerPage = () => {};
export default function Meeting() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [isForMenu, setIsForMenu] = useState<IMeeting | null>();
  const [openMenu, setOpenMenu] = useState(false);

  const handleClose = () => {
    setOpenMenu(false);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setOpenMenu(false);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Toolbar />
      <Button
        variant="contained"
        onClick={() => {
          setIsDialogOpen(true);
          handleClose();
        }}
      >
        Add New Meeting
      </Button>
      {isDialogOpen && (
        <AddMeetingDialog
          open={isDialogOpen}
          toEditAddMeeting={isForMenu!}
          onAddMeetingDiscardDialog={() => {
            setIsForMenu(null);
            setIsDialogOpen(false);
          }}
          onAddMeetingSuccessDialog={() => {
            setIsForMenu(null);
            setIsDialogOpen(false);
          }}
        />
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableCell>
                ))}
                <TableCell>Action</TableCell>
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        setIsForMenu(row.original);
                        setAnchorEl(e.currentTarget);
                        setOpenMenu(true);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Menu open={openMenu} anchorEl={anchorEl} onClose={handleCloseMenu}>
          <MenuItem
            onClick={() => {
              setIsDialogOpen(true);
              handleClose();
            }}
          >
            Edit
          </MenuItem>
          <MenuItem>Delete</MenuItem>
        </Menu>
        <TablePagination
          component="div"
          count={10}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </>
  );
}
