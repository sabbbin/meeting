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

export interface IUser {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  roleId: number;
  role: string;
  statusId: number;
  status: string | null;
  createdById: number;
  createdBy: string;
  createdOn: string;
  password?: string;
  confirmPassword?: string;
}

interface Role {
  RoleId: number;
  RoleName: string;
  Alias: string;
  OrderIdx: number;
  IsEnable: boolean;
}

const columnHelper = createColumnHelper<IUser>();

export default function UserTable() {
  const { pagination, handlePageNumberChange, handlePageSizeChange } =
    usePagination({
      pageNumber: 0,
      pageSize: 10,
    });

  const [isforMenu, setisforMenu] = useState<IUser | null>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isChangeStatus, setisChangeStatus] = useState(false);
  const [isResetPassword, setisResetPassword] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [openMenu, setOpenMenu] = useState(false);

  const handleClickColumn = (
    event: MouseEvent<HTMLButtonElement>,
    user: IUser
  ) => {
    setAnchorEl(event.currentTarget);
    setisforMenu(user);
    setOpenMenu(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setOpenMenu(false);
  };

  const handleClose = () => {
    setOpenMenu(false);
  };

  const getStatusID = (statusId: number) => {
    switch (statusId) {
      case 1:
        return "success";
      case 2:
        return "default";
      case 3:
        return "warning";
      case 4:
        return "error";
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("username", {
        header: "Username",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("fullName", {
        header: "Full Name",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),

      columnHelper.accessor((row) => row.email, {
        header: "Email",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row, {
        header: "Status",
        cell: (info) => (
          <Chip
            size="small"
            label={info.getValue().status}
            color={getStatusID(info.getValue().statusId)}
          />
        ),
      }),
      columnHelper.accessor((row) => row.createdBy, {
        header: "Created By",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row.createdOn, {
        header: "Created On",
        cell: (info) => dayjs(info.getValue()).format("YYYY-MM-DD"),
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

  const { data: userData, refetch } = useUsers(
    pagination.pageSize,
    pagination.pageNumber + 1,
    {
      params: {
        size: pagination.pageSize,
        page: pagination.pageNumber + 1,
      },
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );

  const { data: countData } = useMeetingCount({
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  const { data: roleData, refetch: refetchRoleData } = useRole({
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  const { data: userStatusData, refetch: refetchStatus } = useStatus({
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  const table = useReactTable({
    data: userData,
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
        Add User
      </Button>

      {isDialogOpen && (
        <UserFormDialog
          toEdit={isforMenu}
          open={isDialogOpen}
          onSuccessDialog={() => {
            setisforMenu(null);
            setIsDialogOpen(false);
          }}
          onDiscardDialog={() => {
            setisforMenu(null);
            setIsDialogOpen(false);
          }}
        />
      )}
      <AddMemberDialog
        toEditMember={isforMenu!}
        open={isAddMemberDialogOpen}
        onSuccessAddMemberDialog={() => {
          setIsAddMemberDialogOpen(false);
        }}
        onDiscardAddMemberDialog={() => {
          setIsAddMemberDialogOpen(false);
        }}
      />
      <ChangeStatusDialog
        open={isChangeStatus}
        onStatusSuccessDialog={() => {
          setisChangeStatus(false);
        }}
        onStatusDiscardDialog={() => {
          setisChangeStatus(false);
        }}
        toEditStatus={isforMenu!}
      />
      <ChangePasswordDialog
        open={isResetPassword}
        onChangePasswordDiscardDialog={() => {
          setisResetPassword(false);
        }}
        onChangePasswordSuccessDialog={() => {
          setisResetPassword(false);
        }}
        toEditChangePasswprd={isforMenu!}
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
        <TablePagination
          width="140px"
          component="div"
          count={countData.TotalCount}
          page={pagination.pageNumber}
          onPageChange={(e, page) => handlePageNumberChange(page)}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={(e) =>
            handlePageSizeChange(+e.currentTarget.value)
          }
        />
        <Menu open={openMenu} anchorEl={anchorEl} onClose={handleClose}>
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
              setIsAddMemberDialogOpen(true);
              handleClose();
            }}
          >
            Add Membership
          </MenuItem>
          <MenuItem
            onClick={() => {
              setisChangeStatus(true);
              handleClose();
            }}
          >
            Change Status
          </MenuItem>
          <MenuItem
            onClick={() => {
              setisResetPassword(true);
              handleClose();
            }}
          >
            Change Password
          </MenuItem>
        </Menu>
      </TableContainer>
    </>
  );
}
