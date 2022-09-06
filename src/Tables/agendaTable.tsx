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
  Tooltip,
  Typography,
} from "@mui/material";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { MouseEvent, ReactNode, useMemo, useState } from "react";
import usePagination from "../hooks/usePagination";
import useAgenda from "../hooks/useAgenda";
import dayjs from "dayjs";
import useAgendaCount from "../hooks/useAgendaCount";
import AddAgendaDialog from "../dialog/addAgenda";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export interface IAgenda {
  agendaId: string;
  agenda: string;
  typeName: number;
  meetTypeId: number;
  description: string;
  statusId: number;
  statusName: string;
  postedBy: number;
  postedOn: string;
  fullName: string;
}

const columnHelper = createColumnHelper<IAgenda>();

export default function AgendaTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isforAgenda, setisforAgenda] = useState<IAgenda | null>();
  const openMenu = Boolean(anchorEl);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClickColumn = (
    event: MouseEvent<HTMLButtonElement>,
    agenda: IAgenda
  ) => {
    setAnchorEl(event.currentTarget);
    setisforAgenda(agenda);
  };

  const { pagination, handlePageNumberChange, handlePageSizeChange } =
    usePagination({
      pageNumber: 0,
      pageSize: 10,
    });

  const columns = useMemo(
    () => [
      columnHelper.accessor("typeName", {
        header: "Type",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("agenda", {
        header: "Agenda",
        cell: (info) => (
          <Tooltip title={info.getValue()}>
            <Typography
              sx={{
                width: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {info.getValue()}
            </Typography>
          </Tooltip>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row.description, {
        header: "Description",
        cell: (info) => (
          <Tooltip title={info.getValue()}>
            <Typography
              sx={{
                width: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {info.getValue()}
            </Typography>
          </Tooltip>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("statusName", {
        header: "Status",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("fullName", {
        header: "Posted By",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row.postedOn, {
        header: "Posted On",
        cell: (info) => dayjs(info.getValue()).format("YYYY-MM-DD"),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row, {
        header: "Actions",
        cell: (info) => (info.getValue().statusId === 6 &&
          <IconButton onClick={(e) => handleClickColumn(e, info.getValue())}>
            <MoreVertIcon />
          </IconButton>
        ),
      }),
    ],
    []
  );

  let accessToken = localStorage.getItem("access_token");

  let userId = localStorage.getItem("userId");

  const { data: meetingAgendaData, refetch } = useAgenda(
    pagination.pageSize,
    pagination.pageNumber + 1,
    userId,
    {
      params: {
        pageSize: pagination.pageSize,
        pageNo: pagination.pageNumber + 1,
        userId: userId,
      },
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );

  const { data: meetingCount } = useAgendaCount(userId, {
    params: {
      userId: userId,
    },
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  type deleteId = string;
  const { mutate: deleteMutatae } = useMutation<unknown, unknown, deleteId>(
    (deleteId) =>
      axios
        .delete('/api/MeetingAgenda/', {
          params: { agendaId: isforAgenda?.agendaId },
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
        })
        .then((res) => res.data),
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const handleDelete = () => {
    const deleteId = isforAgenda?.agendaId;
    deleteMutatae(deleteId!);
  };

  const table = useReactTable({
    data: meetingAgendaData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Toolbar />
      <Button
        sx={{ m: 1 }}
        variant="contained"
        onClick={() => {
          setIsDialogOpen(true);
          handleCloseMenu();
        }}
      >
        Add Agenda
      </Button>
      <AddAgendaDialog
        refetch={refetch}
        toEditAddAgenda={isforAgenda!}
        open={isDialogOpen}
        onAddAgendaDiscardDialog={() => {
          setisforAgenda(null);
          setIsDialogOpen(false);
        }}
        onAddAgendaSuccessDialog={() => {
          setisforAgenda(null);
          setIsDialogOpen(false);
        }}
      />
      <TableContainer sx={{ minWidth: 1000 }} component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    sx={{
                      fontWeight: "600",
                    }}
                    key={header.id}
                  >
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      "&:hover": {
                        overflow: "visible",
                      },
                    }}
                    key={cell.id}
                  >
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
          onRowsPerPageChange={(e) =>
            handlePageSizeChange(+e.currentTarget.value)
          }
        />

        <Menu open={openMenu} anchorEl={anchorEl} onClose={handleCloseMenu}>
          <MenuItem
            onClick={() => {
              setIsDialogOpen(true);
              handleCloseMenu();
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDelete();
              handleCloseMenu();
            }}
          >
            Delete
          </MenuItem>
        </Menu>

      </TableContainer>
    </>
  );
}
