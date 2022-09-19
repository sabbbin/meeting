import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Autocomplete,
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
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import React, { MouseEvent, useMemo, useState } from "react";

import dayjs from "dayjs";
import { ValuesType } from "utility-types";
import AddMemberDialog from "../dialog/addMemberDialog";
import ChangePasswordDialog from "../dialog/changePasswordDialog copy";
import ChangeStatusDialog from "../dialog/changeStatusDialog";
import UserFormDialog from "../dialog/userFormDialog";
import { FilterType } from "../filter";
import usePagination from "../hooks/usePagination";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Popover from "@mui/material/Popover";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import { useSnackbar } from "notistack";
import StyledTableRow from "../components/StyledTableRow";
import StyledTableCell from "../components/StyledTableCell";

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
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
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
        header: "createdBy",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row.createdOn, {
        header: "createdOn",
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

  const [sortCol, setSortCol] = useState<SortingState>([
    {
      id: "createdOn",
      desc: false,
    },
  ]);

  let accessToken = localStorage.getItem("access_token");
  const [multiValue, setMultiValue] = useState<string[]>([]);

  interface IaxiosConfig {
    params: {
      size: number;
      page: number;
      searchCol?: string;
      searchVal?: string[];
      operators?: string;
      sortCol?: string;
      sortOrder?: boolean;
    };
    headers: {
      Authorization: string;
    };
  }

  let axiosConfig: IaxiosConfig = {
    params: {
      size: pagination.pageSize,
      page: pagination.pageNumber + 1,
      sortCol: sortCol[0]?.id || "createdOn",
      sortOrder: sortCol[0]?.desc || true,
    },
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };

  const { data: userData, refetch } = useQuery(
    ["users", pagination.pageSize, pagination.pageNumber, sortCol],
    () =>
      axios
        .get("api/User/GetAllUser", { ...axiosConfig })
        .then((res) => res.data),
    { initialData: [] }
  );

  const table = useReactTable({
    data: userData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting: sortCol,
    },
    onSortingChange: setSortCol,
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const handleSearch = () => {
    if (
      searchValue ||
      multiValue.length > 0 ||
      filterOperator == "is empty" ||
      filterOperator == "is not empty"
    ) {
      let temp = "";

      if (multiValue) {
        multiValue.map((mul, id) => {
          if (id !== multiValue.length - 1) {
            temp += `'${mul}',`;
          } else {
            temp += `'${mul}'`;
          }
        });
      }

      if (filterOperator != "is empty" && filterOperator != "is not empty") {
        axiosConfig.params["searchVal"] =
          searchValue != "" ? searchValue : temp;
      }
      (axiosConfig.params["searchCol"] = filterField),
        (axiosConfig.params["operators"] = filterOperator);
      refetch();
    }
  };

  return (
    <>
      <Toolbar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          sx={{ m: 1 }}
          size="small"
          variant="contained"
          onClick={() => {
            setIsDialogOpen(true);
            handleClose();
          }}
        >
          Add User
        </Button>

        <PopupState variant="popover" popupId="demo-popup-popover">
          {(popupState) => (
            <div>
              <Button
                size="small"
                variant="contained"
                sx={{ marginBottom: "10px" }}
                {...bindTrigger(popupState)}
              >
                Open search
              </Button>
              <Popover
                {...bindPopover(popupState)}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <Paper
                  sx={{
                    padding: "10px",
                  }}
                >
                  <Select
                    id="demo-simple-select"
                    value={filterField}
                    label="Age"
                    sx={{ marginRight: "5px" }}
                    size="small"
                    onChange={(e) => {
                      setFilterField(e.target.value as never);

                      setsearchValue("");

                      setMultiValue([]);
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
                    onChange={(e) => {
                      setFilterOperator(e.target.value as never);
                      if (dayjs(searchValue).isValid()) {
                        setsearchValue(dayjs().format("YYYY-MM-DD"));
                      } else {
                        setsearchValue("");
                      }
                      setMultiValue([]);
                    }}
                  >
                    {(
                      filterOptions.find((op) => op.field === filterField)
                        ?.options ?? []
                    ).map((col) => (
                      <MenuItem value={col}>{col}</MenuItem>
                    ))}
                  </Select>

                  {filterField == "Created On" ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        label="Select Date"
                        inputFormat="YYYY-MM-DD"
                        value={searchValue}
                        onChange={(val: any) => {
                          setsearchValue(dayjs(val).format("YYYY-MM-DD"));
                        }}
                        renderInput={(params) => (
                          <TextField
                            size="small"
                            sx={{
                              marginRight: "5px",
                              ...(filterOperator == "is empty" ||
                              filterOperator == "is not empty"
                                ? { display: "none" }
                                : { display: "inline-block" }),
                            }}
                            {...params}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  ) : filterOperator == "is any of" ? (
                    <Autocomplete
                      multiple
                      size="small"
                      sx={{
                        minWidth: "200px",
                        maxWidth: "300px",
                        maxHeight: "50px",

                        marginRight: "5px",
                        zIndex: 100,
                      }}
                      id="tags-filled"
                      options={multiValue!.map((option) => option)}
                      freeSolo
                      renderTags={(value, getTagProps) => {
                        setMultiValue(value);
                        return value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                          />
                        ));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="filled"
                          label="Enter search value"
                        />
                      )}
                    />
                  ) : (
                    <TextField
                      size="small"
                      sx={{
                        marginRight: "5px",
                        ...(filterOperator == "is empty" ||
                        filterOperator == "is not empty"
                          ? { display: "none" }
                          : { display: "inline-block" }),
                      }}
                      value={searchValue}
                      onChange={(e) => setsearchValue(e.target.value)}
                    />
                  )}

                  <Button onClick={handleSearch} variant="contained">
                    Search
                  </Button>
                </Paper>
              </Popover>
            </div>
          )}
        </PopupState>
      </Box>

      {isDialogOpen && (
        <UserFormDialog
          refetch={refetch}
          toEdit={isforMenu}
          open={isDialogOpen}
          onSuccessDialog={() => {
            enqueueSnackbar("Success", { variant: "success" });
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
            enqueueSnackbar("Successfully added member", {
              variant: "success",
            });
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
            enqueueSnackbar("Successfully changes status", {
              variant: "success",
            });
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
            enqueueSnackbar("Successfully changed password", {
              variant: "success",
            });
            setisResetPassword(false);
          }}
          onChangePasswordSuccessDialog={() => {
            setisResetPassword(false);
          }}
          toEditChangePasswprd={Number(isforMenu?.userId)}
        />
      )}
      <TableContainer
        sx={{
          margin: "1",
        }}
        component={Paper}
      >
        <Table size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <StyledTableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <StyledTableCell
                    key={header.id}
                    sx={{
                      whiteSpace: "nowrap",
                      alignItems: "center",
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <StyledTableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <StyledTableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          width="140px"
          component="div"
          count={userData[0]?.totalRows || 0}
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
