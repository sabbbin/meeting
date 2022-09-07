import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
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
import { MouseEvent, useMemo, useState } from "react";
import useUsers from "../hooks/useUsers";

import { useInputState } from "@mantine/hooks";
import dayjs from "dayjs";
import { ValuesType } from "utility-types";
import AddMemberDialog from "../dialog/addMemberDialog";
import ChangePasswordDialog from "../dialog/changePasswordDialog copy";
import ChangeStatusDialog from "../dialog/changeStatusDialog";
import UserFormDialog from "../dialog/userFormDialog";
import { FilterType } from "../filter";
import usePagination from "../hooks/usePagination";
import useUserCount from "../hooks/useUserCount";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import useStatus from "../hooks/useStatus";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

console.log(FilterType);
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
      pageSize: 25,
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
  const filterOptions = [
    {
      field: "Username",
      options: FilterType.StringFilterType,
    },
    {
      field: "Full Name",
      options: FilterType.StringFilterType,
    },
    {
      field: "Email",
      options: FilterType.StringFilterType,
    },
    {
      field: "Role",
      options: FilterType.StringFilterType,
    },
    {
      field: "Status",
      options: FilterType.StringFilterType,
    },

    {
      field: "Created By",
      options: FilterType.StringFilterType,
    },
    {
      field: "Created On",
      options: FilterType.DateFilterType,
    },
  ] as const;
  const [filterField, setFilterField] =
    useState<ValuesType<typeof filterOptions>["field"]>("Username");

  const [filterOperator, setFilterOperator] = useState<
    ValuesType<ValuesType<typeof filterOptions>["options"]>
  >(filterOptions.find((op) => op.field === filterField)?.options[0]!);

  const [searchValue, setsearchValue] = useState<any>();

  const [sortCol, setSortCol] = useState();
  const [sortOrder, setSortOrder] = useState();
  let accessToken = localStorage.getItem("access_token");

  interface IaxiosConfig {
    params: {
      size: number;
      page: number;
      searchCol?: string;
      searchVal?: string;
      operators?: string;
      sortCol?: string;
      sortOrder?: string;
    };
    headers: {
      Authorization: string;
    };
  }

  let axiosConfig: IaxiosConfig = {
    params: {
      size: pagination.pageSize,
      page: pagination.pageNumber + 1,
    },
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };
  if (filterField) {
    (axiosConfig.params["searchCol"] = filterField),
      (axiosConfig.params["searchVal"] = searchValue),
      (axiosConfig.params["operators"] = filterOperator);
  }
  if (sortCol && sortOrder) {
    (axiosConfig.params["sortCol"] = sortCol),
      (axiosConfig.params["sortOrder"] = sortOrder);
  }

  const { data: userData, refetch } = useQuery(
    ["users", pagination.pageSize, pagination.pageNumber, filterField],
    () =>
      axios
        .get("api/User/GetAllUser", { ...axiosConfig })
        .then((res) => res.data),
    { initialData: [] }
  );

  const { data: countData } = useUserCount({
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  const table = useReactTable({
    data: userData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSearch = () => {
    console.log("dlf", filterOperator);
    console.log("adf", dayjs(searchValue).format("DD/MM/YYYY"));
    console.log("adsf", filterField);
  };
  return (
    <>
      <Toolbar />
      <Box>
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
        <Box>
          <Select
            id="demo-simple-select"
            value={filterField}
            label="Age"
            sx={{ marginRight: "5px" }}
            size="small"
            onChange={(e) => {
              setFilterField(e.target.value as never);
              setFilterOperator(
                filterOptions.find((op) => op.field === e.target.value)
                  ?.options[0]! as never
              );
            }}
          >
            {filterOptions.map((col, i) => (
              <MenuItem value={col.field}>{col.field}</MenuItem>
            ))}
          </Select>
          <Select
            id="demo-simple-select"
            value={filterOperator}
            label="Age"
            sx={{ marginRight: "5px" }}
            size="small"
            onChange={(e) => setFilterOperator(e.target.value as never)}
          >
            {(
              filterOptions.find((op) => op.field === filterField)?.options ??
              []
            ).map((col) => (
              <MenuItem value={col}>{col}</MenuItem>
            ))}
          </Select>

          {filterField != "Created On" ? (
            <TextField
              size="small"
              sx={{ marginRight: "5px" }}
              value={searchValue}
              onChange={(e) => setsearchValue(e.target.value)}
            />
          ) : (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Select Date"
                inputFormat="MM/DD/YYYY"
                value={searchValue}
                onChange={(val: any) => {
                  setsearchValue(val);
                }}
                renderInput={(params) => (
                  <TextField
                    size="small"
                    sx={{ marginRight: "5px" }}
                    {...params}
                  />
                )}
              />
            </LocalizationProvider>
          )}

          <Button onClick={handleSearch} variant="contained">
            Search
          </Button>
        </Box>
      </Box>

      {isDialogOpen && (
        <UserFormDialog
          refetch={refetch}
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
      {isAddMemberDialogOpen && (
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
      )}
      {isChangeStatus && (
        <ChangeStatusDialog
          refetch={refetch}
          open={isChangeStatus}
          onStatusSuccessDialog={() => {
            setisChangeStatus(false);
          }}
          onStatusDiscardDialog={() => {
            setisChangeStatus(false);
          }}
          toEditStatus={isforMenu!}
        />
      )}
      {isResetPassword && (
        <ChangePasswordDialog
          open={isResetPassword}
          onChangePasswordDiscardDialog={() => {
            setisResetPassword(false);
          }}
          onChangePasswordSuccessDialog={() => {
            setisResetPassword(false);
          }}
          toEditChangePasswprd={Number(isforMenu?.userId)}
        />
      )}
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
          onRowsPerPageChange={(e) => {
            handlePageSizeChange(+e.target.value);
          }}
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
