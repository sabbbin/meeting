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
import useMeetingCount from "../hooks/useMeetingCount";

import useMeetingType from "../hooks/useMeetingType";
import AddMeetingTypeDialog from "../dialog/addMeetingType";

export interface IMeetingType {
  MeetTypeId?: number;
  TypeName: string;
  Alias: string;
  OrderIdx: number;
  IsEnable: boolean;
}

const columnHelper = createColumnHelper<IMeetingType>();

// const { pagination, handlePageNumberChange, handlePageSizeChange } =
//     usePagination({
//         pageNumber: 0,
//         pageSize: 10
//     });

export default function MeetingTypeTable() {
  const [isforMenu, setisforMenu] = useState<IMeetingType | null>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const handleClickColumn = (
    event: MouseEvent<HTMLButtonElement>,
    MeetType: IMeetingType
  ) => {
    console.log("adfasdf", event);
    setAnchorEl(event.currentTarget);
    setisforMenu(MeetType);
  };
  const openMenu = Boolean(anchorEl);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("TypeName", {
        header: "Meeting type",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("Alias", {
        header: "Alias",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("OrderIdx", {
        header: "Order Index",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("IsEnable", {
        header: "Is Enable",
        cell: (info) => (info.getValue() ? "Enable" : "Disable"),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row, {
        header: "Actions",
        cell: (info) => (
          <IconButton onClick={(e) => handleClickColumn(e, info.getValue())}>
            <MoreVertIcon />
          </IconButton>
        ),
      }),
    ],
    []
  );

  let accessToken = localStorage.getItem("access_token");

  const { data: meetTypeData, refetch } = useMeetingType({
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  const table = useReactTable({
    data: meetTypeData,
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
          handleClose();
        }}
      >
        Add a new Meeting Type
      </Button>
      <AddMeetingTypeDialog
        refetch={refetch}
        open={isDialogOpen}
        toEditAddMeetingType={isforMenu!}
        onAddMeetingTypeDiscardDialog={() => {
          setisforMenu(null);
          setIsDialogOpen(false);
        }}
        onAddMeetingTypeSuccessDialog={() => {
          setisforMenu(null);
          setIsDialogOpen(false);
        }}
      />
      <TableContainer sx={{ minWidth: 1000, margin: "1" }} component={Paper}>
        <Table size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    width="140px"
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* <TablePagination
                    width="140px"
                    component="div"
                    count={countData.TotalCount}
                    page={pagination.pageNumber}
                    onPageChange={(e, page) => handlePageNumberChange(page)}
                    rowsPerPage={pagination.pageSize}
                    onRowsPerPageChange={(e) => handlePageSizeChange(+e.currentTarget.value)}
                /> */}
        <Menu open={openMenu} anchorEl={anchorEl} onClose={handleCloseMenu}>
          <MenuItem
            onClick={() => {
              setIsDialogOpen(true);
              handleClose();
            }}
          >
            Edit
          </MenuItem>
          <MenuItem onClick={() => {}}>Delete</MenuItem>
        </Menu>
      </TableContainer>
    </>
  );
}
