import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  PaperTypeMap,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { IMeeting } from "../Tables/meeting";
import * as yup from "yup";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useFormControlUnstyledContext } from "@mui/base";
import { useFormik } from "formik";
import { Info, MeetingRoomRounded } from "@mui/icons-material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import dayjs from "dayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import useUserMeetingType from "../hooks/useUserMeetingType";
import getAgenda from "./getAgenda";
import { width } from "@mui/system";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IAgenda } from "../Tables/agendaTable";
import {
  DataGrid,
  GridColDef,
  gridColumnsTotalWidthSelector,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { IMeetingType } from "../Tables/meetingTypeTable";
import {
  DateTimePicker,
  DesktopDateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface AddMeeting extends DialogProps {
  onAddMeetingDiscardDialog: () => void;
  onAddMeetingSuccessDialog: () => void;
  toEditAddMeeting: IMeeting;
  // toEditAgenda: AgendaRow;

}

export interface AgendaRow {
  meetId: number | undefined;
  agendaIds: string[] | undefined;
}
interface IGetAgenda {
  isSelected: boolean;
  agendaId: string;
  agenda: string;
  description: string;
  postedBy: string;
  postedOn: string;
}

const columnHelper = createColumnHelper<IGetAgenda>();

const validationSchema = yup.object({
  meetId: yup.number(),
  meetDatetime: yup.string(),
  meetTypeId: yup.number().required("id req"),
  location: yup.string().required("Please provide a location"),
  calledBy: yup.string().required("Please provide a Name"),
  postedBy: yup.number(),
});

// const agendaValidationSchema = yup.object({
//   meetId: yup.number().required("required"),
//   agendaIds: yup.array().required("required"),
// });

type FormData = yup.TypeOf<typeof validationSchema>;

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

export default function AddMeetingDialog({
  onAddMeetingSuccessDialog,
  onAddMeetingDiscardDialog,
  toEditAddMeeting: toEdit,

}: AddMeeting) {
  let access_token = localStorage.getItem("access_token");

  let accessToken = localStorage.getItem("access_token");

  const headers = {
    Authorization: "Bearer " + accessToken,
  };

  useEffect(() => {
    if (toEdit) {
      formik.setValues({
        meetId: toEdit?.meetId,
        meetDatetime: dayjs(toEdit?.meetDatetime).format("YYYY-MM-DD"),
        meetTypeId: toEdit?.meetTypeId,
        location: toEdit?.location,
        calledBy: toEdit?.calledBy,
        postedBy: toEdit.postedBy,
      });
    }
  }, [toEdit]);

  // useEffect(() => {
  //   if (toEditAgenda) {
  //     agendaFormik.setValues({
  //       meetId: toEdit.meetId,
  //       agendaIds: toEdit.agendaIds,

  //     })
  //   }
  // })


  const UpdateMeetingData = useMutation<number, unknown, IMeeting>(
    async (data) =>
      await axios
        .put("api/Meeting", data, {
          headers: headers,
        })
        .then((res) => res.data),
    {
      onSuccess(data) {
        if (data) {
          agendaFormik.setFieldValue("meetId", data);
        }
        agendaFormik.values.meetId = data;
        MergeMeetingMinute.mutate(agendaFormik.values);
        onAddMeetingSuccessDialog();

      },
    })

  const CreateMeetingData = useMutation<number, unknown, IMeeting>(
    async (data) =>
      await axios
        .post("api/Meeting", data, {
          headers: headers,
        })
        .then((res) => res.data),
    {
      onSuccess(data) {
        if (data) {
          console.log("data", data);
          agendaFormik.setFieldValue("meetId", data);
        }
        agendaFormik.values.meetId = data;
        MergeMeetingMinute.mutate(agendaFormik.values);
        onAddMeetingSuccessDialog();

      },
    }
  );

  const MergeMeetingMinute = useMutation<unknown, unknown, AgendaRow>(
    async (data) =>
      await axios
        .post("api/Minute", data, {
          headers: headers,
        })
        .then((res) => res.data),
    {
      onSuccess() {
        onAddMeetingSuccessDialog();
      },
    }
  );

  const formik = useFormik<FormData>({
    initialValues: {
      meetId: 0,
      meetDatetime: dayjs().format(),
      meetTypeId: 0,
      location: "",
      calledBy: "",
      postedBy: Number(localStorage.getItem("userId")),
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (toEdit) {

        UpdateMeetingData.mutate(values)
      } else {
        CreateMeetingData.mutate(values);
      }
    },
  });

  const agendaFormik = useFormik<AgendaRow>({
    initialValues: {
      meetId: 0,
      agendaIds: [],
    },
    onSubmit: () => { },
  });

  let userId = localStorage.getItem("userId");

  let meetTypeId = formik.values.meetTypeId;

  const { data: userMeetingtypeData, refetch } = useUserMeetingType(userId, {
    params: {
      userId: userId,
    },
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });

  const { data: agenda } = getAgenda(meetTypeId, {
    params: {
      meetTypeId: meetTypeId,
    },
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });

  const columns = [
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
    columnHelper.accessor("description", {
      header: "Desription",
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
    }),
    columnHelper.accessor("postedBy", {
      header: "Posted By",
      cell: (info) => info.getValue(),
    }),
  ];

  const table = useReactTable({
    data: agenda,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleClose = () => {
    onAddMeetingDiscardDialog();
  };


  return (
    <Card>
      <Box
        component={FormDialogPaper as never}
        onSubmit={formik.handleSubmit as never}
      >
        <DialogTitle sx={{ textAlign: "center", fontSize: "25px" }}>
          <b>{!!toEdit ? "Update" : "Add"} Meeting</b>
        </DialogTitle>
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Select Date and time"
              value={formik.values.meetDatetime}
              inputFormat="YYYY-MM-DD    HH:MM:ss A"
              onChange={(newValue) => {
                formik.setFieldValue("meetDatetime", newValue);
              }}
              renderInput={(params) => (
                <TextField
                  fullWidth
                  error={
                    formik.touched.meetDatetime &&
                    Boolean(formik.errors.meetDatetime)
                  }
                  helperText={
                    formik.touched.meetDatetime && formik.errors.meetDatetime
                  }
                  {...params}
                />
              )}
            />
          </LocalizationProvider>
          <TextField
            label="Location"
            autoFocus
            margin="dense"
            name="location"
            value={formik.values.location}
            onChange={formik.handleChange}
            error={formik.touched.location && Boolean(formik.errors.location)}
            helperText={formik.touched.location && formik.errors.location}
            fullWidth
            variant="standard"
          />
          <TextField
            label="CalledBy"
            autoFocus
            margin="dense"
            name="calledBy"
            value={formik.values.calledBy}
            onChange={formik.handleChange}
            error={formik.touched.calledBy && Boolean(formik.errors.calledBy)}
            helperText={formik.touched.calledBy && formik.errors.calledBy}
            fullWidth
            variant="standard"
          />
          <TextField
            select
            fullWidth
            name="meetTypeId"
            id="meetTypeId"
            margin="dense"
            label="Meeting Type"
            variant="standard"
            value={formik.values.meetTypeId}
            SelectProps={{
              value: formik.values.meetTypeId,
              onChange: formik.handleChange,
            }}
          >
            {userMeetingtypeData.map((meetType: any, index: number) => (
              <MenuItem key={index} value={meetType.MeetTypeId}>
                {meetType.TypeName}
              </MenuItem>
            ))}
          </TextField>
          {formik.values.meetTypeId ? (
            <Card sx={{ marginTop: 2.5 }}>
              <Typography sx={{ m: 1, textAlign: "center" }}>
                <b>Add Agendas</b>
              </Typography>
              <Divider />
              <Table>
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      <TableCell></TableCell>
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
                      <TableCell>
                        <Checkbox
                          name="agendaIds"
                          value={row.original.agendaId}
                          onChange={agendaFormik.handleChange}
                        />
                      </TableCell>
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : null}
        </CardContent>
        <CardActions>
          <Button type="submit" variant="contained">
            Submit
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </CardActions>
      </Box>
    </Card>
  );
}
