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
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { useState } from "react";
import AddMeetingDialog from "../dialog/addMeeting";
import axios from "axios";
import useMeeting from "../hooks/useMeeting";
import usePagination from "../hooks/usePagination";
import useMeetingTypeCount from "../hooks/useMeetingCount";

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

const columnHelper = createColumnHelper<IMeeting>();


const handleChangePage = () => { };
const handleChangeRowsPerPage = () => { };
export default function Meeting() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [isForMenu, setIsForMenu] = useState<IMeeting | null>();
  const [openMenu, setOpenMenu] = useState(false);
  let access_token = localStorage.getItem("access_token");

  const { data: datatry } = useQuery(["data"], () =>
    axios.get("api/Meeting/MeetingCountAll", {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    })
  );
  const handleClose = () => {
    setOpenMenu(false);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setOpenMenu(false);
  };

  let { data: deletedata, mutate } = useMutation(() =>
    axios
      .delete(`api/Meeting/${isForMenu?.meetId}`, {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      })
      .then((res) => res.data)
  );


  let accessToken = localStorage.getItem("access_token");

  let userId = localStorage.getItem("userId");


  const { pagination, handlePageNumberChange, handlePageSizeChange } =
    usePagination({
      pageNumber: 0,
      pageSize: 10,
    });

  const { data: meetingData } = useMeeting(pagination.pageNumber, pagination.pageSize, userId, {
    params: {
      pageSize: pagination.pageSize,
      pageNo: pagination.pageNumber + 1,
      userId: userId,
    },
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })

  const { data: meetingCountData } = useMeetingTypeCount(userId, {
    params: {
      userId: userId,
    },
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })

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

  const table = useReactTable({
    data: meetingData,
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
          <MenuItem
            onClick={() => {
              setIsDialogOpen(true);
              handleClose();
              mutate();
            }}
          >
            Delete
          </MenuItem>
        </Menu>
        <TablePagination
          width="140px"
          component="div"
          count={meetingCountData.TotalCount}
          page={pagination.pageNumber}
          onPageChange={(e, page) => handlePageNumberChange(page)}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={(e) =>
            handlePageSizeChange(+e.currentTarget.value)
          }
        />
      </TableContainer>
    </>
  );
}
