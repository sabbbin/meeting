import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Select,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import SearchIcon from "@mui/icons-material/Search";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import React, { MouseEvent, useEffect, useMemo, useState } from "react";
// import AddMeetingDialog from "../dialog/addMeeting";
import axios from "axios";
import useMeeting from "../hooks/useMeeting";
import usePagination from "../hooks/usePagination";

import AddMeetingDrawer from "../drawer/addMemberDrawer";
import AddMeetingDialog from "../dialog/addMeeting";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { number } from "yup";
import AgendaTable from "./agendaTable";
import AddCallByMeeting from "../dialog/meetingPreviewConclude";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import { ValuesType } from "utility-types";
import { FilterType } from "../filter";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSnackbar } from "notistack";
import { useMeetingConclusinStore } from "../hooks/zustard";
import { useNavigate } from "react-router-dom";
import StyledTableRow from "../components/StyledTableRow";
import StyledTableCell from "../components/StyledTableCell";
import PostpondMeeting from "../dialog/postpond";
import CancleMeeting from "../dialog/cancleMeeting";
import { IGetAgenda } from "../dialog/getAgenda";
import MeetingTableRow from "../components/meetingTableRow";

export interface IMeeting {
  meetId?: number | undefined;
  meetDatetime: string | undefined;
  meetTypeId: number | undefined;
  typeName?: string;
  location: string | undefined;
  calledBy: string | undefined;
  postedBy?: number | undefined;
  postedOn?: Date;
  status?: string;
  agendaIds?: string[] | undefined;
  totalRows?: number;
}
export interface IPostMeeting {
  meetDatetime: string | undefined;
  meetTypeId: number | undefined;
  location: string | undefined;
  calledBy: string | undefined;
  postedBy: number | undefined;
}

interface IGetMinutes {
  minuteId: number;
  meetId: number;
  agenda: string;
  agendaId: number;
  description: string;
  presenter: string;
  discussion: string;
  conclusion: string;
}

const columnHelper = createColumnHelper<IMeeting>();

export default function Meeting() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isForMenu, setIsForMenu] = useState<IMeeting | null>();
  const [openMenu, setOpenMenu] = useState(false);
  const [isForPostpond, setisForPostpond] = useState(false);
  const [isForCancle, setIsForCancle] = useState(false);
  let access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [anchorSearchEl, setAnchorSearchEl] =
    React.useState<HTMLButtonElement | null>(null);
  const handleOpenPop = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorSearchEl(event.currentTarget);
  };

  const handleClosePop = () => {
    setAnchorSearchEl(null);
  };

  const [sortCol, setSortCol] = useState<SortingState>([
    {
      id: "postedBy",
      desc: true,
    },
  ]);

  const { storeMeeting, deleteMeeting } = useMeetingConclusinStore(
    (state) => state
  );

  const handleClickColumn = (
    event: MouseEvent<HTMLButtonElement>,
    meeting: IMeeting
  ) => {
    setAnchorEl(event.currentTarget);

    setIsForMenu(meeting);
    console.log("meeting abc", meeting);
    deleteMeeting();
    storeMeeting(meeting);
    setOpenMenu(true);
  };

  const handleClose = () => {
    setOpenMenu(false);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setOpenMenu(false);
  };

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  let accessToken = localStorage.getItem("access_token");

  let userId = localStorage.getItem("userId");

  const { pagination, handlePageNumberChange, handlePageSizeChange } =
    usePagination({
      pageNumber: 0,
      pageSize: 10,
    });

  interface IaxiosConfig {
    params: {
      pageSize: number;
      pageNo: number;
      userId: string;
      searchCol?: string;
      searchVal?: string[];
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
      sortCol: sortCol[0]?.id || "PostedOn",
      sortOrder: sortCol[0]?.desc ? "desc" : "asc",
      userId: userId!,
    },
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };
  const [removeFilterFlag, setRemoveFilterFlag] = useState<boolean>(false);

  useEffect(() => {
    getMeeting();
  }, []);
  const { data: meetingData, refetch: getMeeting } = useMeeting(
    pagination.pageNumber,
    pagination.pageSize,
    userId,
    sortCol,
    {
      ...axiosConfig,
    }
  );

  type callId = number;

  const { mutate: callMeetingMutatae } = useMutation<unknown, unknown, callId>(
    async (data) =>
      await axios
        .post("/api/Meeting/Call", "", {
          headers: {
            Authorization: "Bearer " + access_token,
          },
          params: {
            meetId: data,
          },
        })
        .then((res) => res.data),
    {
      onSuccess() {
        getMeeting();
        enqueueSnackbar("Meeting Sucesfully called", { variant: "success" });
      },
      onError() {
        enqueueSnackbar("Meeting with no agendas can't be called", {
          variant: "error",
        });
      },
    }
  );

  const handleCallMeeting = () => {
    const callId = isForMenu?.meetId;
    callMeetingMutatae(callId!);
  };

  const filterOptions = [
    {
      field: "typeName",
      options: FilterType.StringFilterType,
    },
    {
      field: "meetDatetime",
      options: FilterType.DateFilterType,
    },
    {
      field: "location",
      options: FilterType.StringFilterType,
    },
    {
      field: "postedOn",
      options: FilterType.DateFilterType,
    },
    {
      field: "status",
      options: FilterType.StringFilterType,
    },
  ];

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
    }
    getMeeting();
  };

  const [filterField, setFilterField] =
    useState<ValuesType<typeof filterOptions>["field"]>("typeName");

  const [filterOperator, setFilterOperator] = useState<
    ValuesType<ValuesType<typeof filterOptions>["options"]>
  >(filterOptions.find((op) => op.field === filterField)?.options[0]!);

  const [searchValue, setsearchValue] = useState<any>();
  const [multiValue, setMultiValue] = useState<string[]>([]);

  const columns = useMemo(
    () => [
      // columnHelper.accessor("meetId", {
      //   header: 'Meet ID',
      //   cell: (info) => info.getValue(),
      // }),
      columnHelper.accessor("meetDatetime", {
        header: "Date/time",
        cell: (info) => dayjs(info.getValue()).format("MMM D, YYYY h:mm A"),
      }),
      columnHelper.accessor("typeName", {
        header: "Type",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("postedOn", {
        header: "Posted On",
        cell: (info) => dayjs(info.getValue()).format("DD/MM/YYYY"),
      }),
      columnHelper.accessor("postedBy", {
        header: "Posted By",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row, {
        header: "Actions",
        enableSorting: false,
        cell: (info) =>
          info.getValue().status === "Concluded" ||
          info.getValue().status === "Cancel" ? null : (
            <IconButton onClick={(e) => handleClickColumn(e, info.getValue())}>
              <MoreVertIcon />
            </IconButton>
          ),
      }),
    ],
    []
  );

  type deleteId = number;
  const { mutate: deleteMutatae } = useMutation<unknown, unknown, deleteId>(
    (deleteId) =>
      axios
        .delete("/api/Meeting/", {
          params: { meetId: isForMenu?.meetId },
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
        })
        .then((res) => res.data),
    {
      onSuccess: () => {
        getMeeting();
      },
    }
  );

  const handleDelete = () => {
    const deleteId = isForMenu?.meetId;
    deleteMutatae(deleteId!);
  };
  const table = useReactTable({
    data: meetingData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting: sortCol,
    },
    onSortingChange: setSortCol,
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return (
    <>
      <Toolbar />
      {!isDialogOpen && (
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
            Add New Meeting
          </Button>

          <Box>
            <Button
              sx={{
                marginBottom: "10px",
                marginRight: 1,
              }}
              size="small"
              variant="contained"
              onClick={() => getMeeting()}
            >
              Reset Filter
            </Button>

            <Button
              size="small"
              variant="contained"
              sx={{ marginBottom: "10px" }}
              onClick={handleOpenPop}
            >
              Open search
            </Button>
            <Popover
              open={Boolean(anchorSearchEl)}
              anchorEl={anchorSearchEl}
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
                    <MenuItem key={i} value={col.field}>
                      {col.field}
                    </MenuItem>
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
                  ).map((col, i) => (
                    <MenuItem key={i} value={col}>
                      {col}
                    </MenuItem>
                  ))}
                </Select>

                {filterField == "meetDatetime" || filterField == "postedOn" ? (
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
                <IconButton
                  size="small"
                  sx={{
                    marginBottom: "9px",
                    border: "1px solid lightgray",
                    color: "black",
                    backgroundColor: "lightgray",
                  }}
                  onClick={handleSearch}
                >
                  <SearchIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    marginBottom: "9px",
                    border: "1px solid lightgray",
                    color: "red",
                    marginLeft: 1,
                    backgroundColor: "lightgray",
                  }}
                  onClick={() => {
                    handleClosePop();
                    setsearchValue("");
                    setMultiValue([]);
                  }}
                >
                  <HighlightOffIcon />
                </IconButton>
              </Paper>
            </Popover>
          </Box>
        </Box>
      )}

      {isForCancle && (
        <CancleMeeting
          cancleMeetId={isForMenu?.meetId}
          refetch={getMeeting}
          open={isForCancle}
          onDiscardDialog={() => {
            setIsForCancle(false);
          }}
          onSuccessDialog={() => {
            setIsForCancle(false);
          }}
        />
      )}

      {isForPostpond && (
        <PostpondMeeting
          pospondMeetId={isForMenu?.meetId}
          initialDate={isForMenu!.meetDatetime}
          refetch={getMeeting}
          open={isForPostpond}
          onDiscardDialog={() => {
            setisForPostpond(false);
          }}
          onSuccessDialog={() => {
            setisForPostpond(false);
          }}
        />
      )}

      {isDialogOpen ? (
        <AddMeetingDialog
          checkboxMeetId={isForMenu?.meetId}
          refetch={getMeeting}
          open={isDialogOpen}
          toEditAddMeeting={isForMenu}
          onAddMeetingDiscardDialog={() => {
            setIsForMenu(null);
            setIsDialogOpen(false);
          }}
          onAddMeetingSuccessDialog={() => {
            enqueueSnackbar("Success", { variant: "success" });
            setIsForMenu(null);
            setIsDialogOpen(false);
          }}
        />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <StyledTableRow key={headerGroup.id}>
                  <StyledTableCell> </StyledTableCell>
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
                <MeetingTableRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
          <Menu open={openMenu} anchorEl={anchorEl} onClose={handleCloseMenu}>
            {isForMenu?.status === "New" ? (
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleCallMeeting();
                }}
              >
                Call
              </MenuItem>
            ) : null}

            {isForMenu?.status === "Called" ||
            isForMenu?.status === "Pospond" ? (
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate("conclusion", { replace: true });
                }}
              >
                Conclude
              </MenuItem>
            ) : null}
            {isForMenu?.status === "New" ? (
              <MenuItem
                onClick={() => {
                  setIsDialogOpen(true);
                  handleClose();
                }}
              >
                Edit
              </MenuItem>
            ) : null}
            {isForMenu?.status === "New" ? (
              <MenuItem
                onClick={() => {
                  handleDelete();
                  handleClose();
                }}
              >
                Delete
              </MenuItem>
            ) : null}
            {isForMenu?.status === "Called" ||
            isForMenu?.status === "Pospond" ? (
              <MenuItem
                onClick={() => {
                  setisForPostpond(true);
                  handleClose();
                }}
              >
                Postpond
              </MenuItem>
            ) : null}
            {isForMenu?.status === "Called" ||
            isForMenu?.status === "Pospond" ? (
              <MenuItem
                onClick={() => {
                  setIsForCancle(true);
                  handleClose();
                }}
              >
                Cancle
              </MenuItem>
            ) : null}
          </Menu>
          <TablePagination
            width="140px"
            component="div"
            count={meetingData[0]?.totalRows || 0}
            page={pagination.pageNumber}
            onPageChange={(e, page) => handlePageNumberChange(page)}
            rowsPerPage={pagination.pageSize}
            onRowsPerPageChange={(e) =>
              handlePageSizeChange(+e.currentTarget.value)
            }
          />
        </TableContainer>
      )}
    </>
  );
}
