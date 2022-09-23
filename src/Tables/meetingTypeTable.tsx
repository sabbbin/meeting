import {
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  PaperTypeMap,
  Popover,
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
  SortingState,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { memo, MouseEvent, useMemo, useState } from "react";
import useUsers from "../hooks/useUsers";

import { Add, Info, LocalConvenienceStoreOutlined } from "@mui/icons-material";
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

import useMeetingType from "../hooks/useMeetingType";
import AddMeetingTypeDialog from "../dialog/addMeetingType";

import { number } from "yup/lib/locale";
import { FilterType } from "../filter";
import { ValuesType } from "utility-types";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AddUserToMeetingTypes from "../dialog/addUserToMeetingTypes";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import { useSnackbar } from "notistack";
import StyledTableRow from "../components/StyledTableRow";
import StyledTableCell from "../components/StyledTableCell";

export interface IMeetingType {
  meetTypeId?: number;
  typeName: string;
  alias: string;
  orderIdx: number;
  isEnable: boolean;
}

const columnHelper = createColumnHelper<IMeetingType>();

export default function MeetingTypeTable() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  let userIdLocal = localStorage.getItem("userId");
  let accessToken = localStorage.getItem("access_token");

  const { pagination, handlePageNumberChange, handlePageSizeChange } =
    usePagination({
      pageNumber: 0,
      pageSize: 10,
    });
  const [isforMenu, setisforMenu] = useState<IMeetingType | null>();
  let meetTypeId = isforMenu?.meetTypeId;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [viewUser, setViewUser] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const handleClickColumn = (
    event: MouseEvent<HTMLButtonElement>,
    MeetType: IMeetingType
  ) => {
    setAnchorEl(event.currentTarget);
    setisforMenu(MeetType);
    setOpenMenu(true);
  };

  const handleCloseMenu = () => {
    setOpenMenu(false);
  };

  const filterOptions = [
    {
      field: "TypeName",
      options: FilterType.StringFilterType,
    },
    {
      field: "Alias",
      options: FilterType.StringFilterType,
    },
    {
      field: "OrderIdx",
      options: FilterType.StringFilterType,
    },
    {
      field: "IsEnable",
      options: FilterType.BooleanFilterType,
    },
  ];

  const [filterField, setFilterField] =
    useState<ValuesType<typeof filterOptions>["field"]>("TypeName");

  const [filterOperator, setFilterOperator] = useState<
    ValuesType<ValuesType<typeof filterOptions>["options"]>
  >(filterOptions.find((op) => op.field === filterField)?.options[0]!);

  const [searchValue, setsearchValue] = useState<any>();
  const [multiValue, setMultiValue] = useState<string[]>([]);

  const [sortCol, setSortCol] = useState<SortingState>([
    {
      id: "typeName",
      desc: true,
    },
  ]);
  const [removeFilterFlag, setRemoveFilterFlag] = useState<boolean>(false);

  interface IaxiosConfig {
    params: {
      pageSize: number;
      pageNo: number;
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
      pageSize: pagination.pageSize,
      pageNo: pagination.pageNumber + 1,
      sortCol: sortCol[0]!.id || "typeName",
      sortOrder: sortCol[0]!.desc == true ? "desc" : "asc",
    },
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("typeName", {
        header: "TypeName",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("alias", {
        header: "Alias",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("orderIdx", {
        header: "OrderIdx",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("isEnable", {
        header: "IsEnable",
        cell: (info) => (info.getValue() ? "Enable" : "Disable"),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row, {
        header: "Actions",
        enableSorting: false,
        cell: (info) => (
          <IconButton onClick={(e) => handleClickColumn(e, info.getValue())}>
            <MoreVertIcon />
          </IconButton>
        ),
      }),
    ],
    []
  );

  const { data: meetTypeData, refetch } = useMeetingType(
    pagination.pageSize,
    pagination.pageNumber + 1,
    sortCol,
    {
      ...axiosConfig,
    }
  );
  console.log("axiosconfitg", meetTypeData);

  const { data: updateStatus, mutate: updateMutate } = useMutation(
    (data: any) => {
      return axios
        .put("/api/MeetingType", data, {
          params: { meetTypeId },
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
        })
        .then((res) => res.data);
    },
    {
      onSuccess: () => {
        enqueueSnackbar("Successfully updated Status.", { variant: "success" })
        refetch();
      },
      onError: () => {
        enqueueSnackbar("Can not be updated Status.", { variant: "error" })
      }
    }
  );

  type deleteId = number;
  const { data: deleteMeetingType, mutate: deleteMutatae } = useMutation<
    any,
    unknown,
    deleteId
  >(
    (deleteId) =>
      axios
        .delete(`/api/MeetingType/${deleteId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
        })
        .then((res) => res.data),
    {
      onSuccess: () => {
        enqueueSnackbar("Successfully Deleted.", { variant: "warning" })
        refetch();
      },
      onError: () => {
        enqueueSnackbar("Can not be Deleted.", { variant: "error" })
      }
    }
  );

  const handleDelete = (value: any) => {
    const deleteId = isforMenu?.meetTypeId!;
    deleteMutatae(deleteId);
  };

  const handleStatusChange = (value: any) => {
    const id = isforMenu?.meetTypeId;
    const updateData = {
      isEnable: value,
      typeName: isforMenu?.typeName,
      alias: isforMenu?.alias,
      orderIdx: isforMenu?.orderIdx,
    };

    updateMutate(updateData);
  };

  const table = useReactTable({
    data: meetTypeData,
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
            handleCloseMenu();
          }}
        >
          Add MeetingTypes
        </Button>

        <PopupState variant="popover" popupId="demo-popup-popover">
          {(popupState) => {
            return (
              <div>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    marginBottom: "10px",
                    marginRight: 1,
                  }}
                  onClick={() => {
                    setRemoveFilterFlag(false);
                    setMultiValue([]);
                    setsearchValue("");
                    refetch();
                  }}
                >
                  Remove Filter
                </Button>
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
                          filterOptions.find(
                            (op) => op.field === e.target.value
                          )?.options[0]! as never
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
            );
          }}
        </PopupState>
      </Box>

      {isDialogOpen && (
        <AddMeetingTypeDialog
          refetch={refetch}
          open={isDialogOpen}
          toEditAddMeetingType={isforMenu!}
          onAddMeetingTypeDiscardDialog={() => {
            setisforMenu(null);
            setIsDialogOpen(false);
          }}
          onAddMeetingTypeSuccessDialog={() => {
            enqueueSnackbar("Success", { variant: "success" });
            setisforMenu(null);
            setIsDialogOpen(false);
          }}
        />
      )}
      {viewUser && (
        <AddUserToMeetingTypes
          refetch={refetch}
          onDialogClose={() => {
            setViewUser(false);
            setisforMenu(null);
          }}
          open={viewUser}
          meetTypeId={isforMenu!.meetTypeId!}
        />
      )}
      <TableContainer sx={{ minWidth: 1000, margin: "1" }} component={Paper}>
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
          count={meetTypeData[0]?.totalRows || 0}
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
          {isforMenu?.isEnable == true ? (
            <MenuItem
              onClick={() => {
                handleStatusChange(false);
                handleCloseMenu();
              }}
            >
              Disable
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                handleStatusChange(true);
                handleCloseMenu();
              }}
            >
              Enable
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setViewUser(true);
              handleCloseMenu();
            }}
          >
            Add User
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDelete(true);
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
