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
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { MouseEvent, useEffect, useMemo, useState } from "react";
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
import AddCallByMeeting from "../dialog/addCallByMeeting";
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

export interface IMeeting {
  meetId?: number | undefined;
  meetDatetime: string | undefined;
  meetTypeId: number | undefined;
  location: string | undefined;
  calledBy: string | undefined;
  postedOn?: Date;
  status?: string;
  typeName?: string;
  postedBy?: number | undefined;
  agendaIds?: string[] | undefined;
  totalRows?: number;
}




const columnHelper = createColumnHelper<IMeeting>();

export default function Meeting() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [flagForCallMinutes, setFlagForCallMInutes] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [isForMenu, setIsForMenu] = useState<IMeeting | null>();
  const [openMenu, setOpenMenu] = useState(false);
  const [isForPostpond, setisForPostpond] = useState(false);
  const [isForCancle, setIsForCancle] = useState(false);
  let access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const [callByMeeting, setCallByMeeting] = useState(false);

  const [sortCol, setSortCol] = useState<SortingState>([
    {
      id: "location",
      desc: false,
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
      sortOrder?: boolean;
    };
    headers: {
      Authorization: string;
    };
  }

  let axiosConfig: IaxiosConfig = {
    params: {
      pageSize: pagination.pageSize,
      pageNo: pagination.pageNumber + 1,
      sortCol: sortCol[0]?.id || "typeName",
      sortOrder: sortCol[0]?.desc || true,
      userId: userId!,
    },
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };
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
      await axios.post("/api/Meeting/Call", data, {
        headers: {
          Authorization: "Bearer " + access_token,
        },
        params: {
          meetId: data
        }
      }).then((res) => res.data),
    {
      onSuccess() {
        getMeeting();
      }
    }
  )

  const handleCallMeeting = () => {
    const callId = isForMenu?.meetId;
    callMeetingMutatae(callId!);
  }


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
        cell: (info) => ((info.getValue().status === "Concluded" || info.getValue().status === "Cancel") ? null : (<IconButton onClick={(e) => handleClickColumn(e, info.getValue())}>
          <MoreVertIcon />
        </IconButton>)

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

  const [showAgenda, setShowAgenda] = useState<number>();

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

  let done: String;
  const getMinutes = useQuery<IGetMinutes[], unknown, IGetMinutes[]>(
    ["getMinutes"],
    () => {
      return axios
        .get("api/Minute/GetMinute", {
          params: {
            meetid: showAgenda,
          },
          headers: {
            Authorization: "bearer " + accessToken,
          },
        })
        .then((res) => res.data);
    },
    {
      initialData: [],
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

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

          <PopupState variant="popover" popupId="demo-popup-popover">
            {(popupState) => (
              <div>
                <Button
                  variant="contained"
                  size="small"
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

                    {filterField == "meetDatetime" ||
                      filterField == "postedOn" ? (
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
      )}

      {/* {callByMeeting && (
        <AddCallByMeeting
          meeting={isForMenu!}
          onDialogClose={() => {
            setCallByMeeting(false);
            handleClose();
          }}
        />
      )} */}

      {isForCancle && (<CancleMeeting
        cancleMeetId={isForMenu?.meetId}
        refetch={getMeeting}
        open={isForCancle}
        onDiscardDialog={() => {
          setIsForCancle(false)
        }}
        onSuccessDialog={() => {
          setIsForCancle(false)
        }} />)}

      {isForPostpond && (<PostpondMeeting
        pospondMeetId={isForMenu?.meetId}
        initialDate={isForMenu!.meetDatetime}
        refetch={getMeeting}
        open={isForPostpond}
        onDiscardDialog={() => {
          setisForPostpond(false)
        }}
        onSuccessDialog={() => {
          setisForPostpond(false)
        }}
      />)}

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
              {table.getRowModel().rows.map((row) => {
                return (
                  <>
                    <StyledTableRow key={row.id}>
                      <StyledTableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={async () => {
                            if (showAgenda == row.original.meetId) {
                              setShowAgenda(-1);
                            } else {
                              await setShowAgenda(row.original.meetId);

                              getMinutes.refetch();
                              setFlagForCallMInutes(!flagForCallMinutes);
                            }
                          }}
                        >
                          {showAgenda == row.original.meetId ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </StyledTableCell>

                      {row.getVisibleCells().map((cell) => (
                        <StyledTableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </StyledTableCell>
                      ))}
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={6}
                      >
                        <Collapse
                          in={row.original.meetId == showAgenda}
                          timeout="auto"
                          unmountOnExit
                        >
                          {getMinutes.data.length == 0 ? (
                            <Box
                              sx={{
                                margin: 3,
                                textAlign: "center",
                                color: "red",
                                fontSize: 20,
                              }}
                            >
                              No Agendas
                            </Box>
                          ) : (
                            <Box sx={{ marginTop: 3, marginBottom: 3 }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                                textAlign="center"
                              >
                                Minutes
                              </Typography>
                              <Table size="small" aria-label="purchases">
                                <TableHead
                                  sx={{
                                    color: "se",
                                  }}
                                >
                                  <TableRow>
                                    <StyledTableCell>Agenda</StyledTableCell>
                                    <StyledTableCell>
                                      Description
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                      Presentator
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                      Discussion
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                      Conclusion
                                    </StyledTableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {getMinutes.data.length > 0 &&
                                    getMinutes.data.map((minute, id) => (
                                      <TableRow key={id}>
                                        <StyledTableCell
                                          component="th"
                                          scope="row"
                                        >
                                          <Tooltip title={minute.agenda}>
                                            <Typography
                                              sx={{
                                                width: "150px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {minute.agenda}
                                            </Typography>
                                          </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                          <Tooltip title={minute.description}>
                                            <Typography
                                              sx={{
                                                width: "150px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {minute.description}
                                            </Typography>
                                          </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell align="right">
                                          {minute.presenter}
                                        </StyledTableCell>
                                        <StyledTableCell align="right">
                                          {minute.discussion}
                                        </StyledTableCell>
                                        <StyledTableCell align="right">
                                          {minute.conclusion}
                                        </StyledTableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </Box>
                          )}
                        </Collapse>
                      </StyledTableCell>
                    </StyledTableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
          <Menu open={openMenu} anchorEl={anchorEl} onClose={handleCloseMenu}>
            {isForMenu?.status === 'New' ? (<MenuItem onClick={() => {
              handleClose();
              handleCallMeeting()

            }}>
              Call</MenuItem>) : (null)}

            {(isForMenu?.status === 'Called' || isForMenu?.status === 'Pospond') ? (<MenuItem
              onClick={() => {
                handleClose();
                navigate("conclusion", { replace: true });
              }}
            >
              Conclude
            </MenuItem>) : (null)}
            {isForMenu?.status === 'New' ? (<MenuItem
              onClick={() => {
                setIsDialogOpen(true);
                handleClose();
              }}
            >
              Edit
            </MenuItem>) : (null)}
            {isForMenu?.status === 'New' ? (<MenuItem
              onClick={() => {
                handleDelete();
                handleClose();
              }}
            >
              Delete
            </MenuItem>) : (null)}
            {(isForMenu?.status === 'Called' || isForMenu?.status === 'Pospond') ? (<MenuItem
              onClick={() => {
                setisForPostpond(true);
                handleClose();
              }}>
              Postpond
            </MenuItem>) : null}
            {(isForMenu?.status === 'Called' || isForMenu?.status === 'Pospond') ? (<MenuItem onClick={() => {
              setIsForCancle(true);
              handleClose();
            }}>
              Cancle
            </MenuItem>) : (null)}
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
