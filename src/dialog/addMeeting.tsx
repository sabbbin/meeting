import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
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
import { CheckBox, Info, MeetingRoomRounded } from "@mui/icons-material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import dayjs from "dayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import useUserMeetingType from "../hooks/useUserMeetingType";
import getAgenda from "./getAgenda";
import { width } from "@mui/system";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { IAgenda } from "../Tables/agendaTable";
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';


interface AddMeeting extends DialogProps {
  onAddMeetingDiscardDialog: () => void;
  onAddMeetingSuccessDialog: () => void;
  toEditAddMeeting: IMeeting;
}

interface AgendaRow {
  agenda: string;
  agendaId: string;
  description?: string;
  isSelected?: boolean;
  postedBy?: string;
  postedOn?: string;
}

const columnHelper = createColumnHelper<AgendaRow>();

const validationSchema = yup.object({
  meetId: yup.number().required("Required"),
  meetDatetime: yup.string().required("Please select a date"),
  meetTypeId: yup.number().required("id req"),
  location: yup.string().required("Please provide a location"),
  calledBy: yup.string().required("Please provide a Name"),

});

type FormDate = yup.TypeOf<typeof validationSchema>;

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;



export default function AddMeetingDialog({
  onAddMeetingSuccessDialog,
  onAddMeetingDiscardDialog,
  toEditAddMeeting: toEdit,
  open,
}: AddMeeting) {

  const [checked, setChecked] = useState(true);
  const [agendaRow, setAgendaRow] = useState([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  let access_token = localStorage.getItem("access_token");

  const handleCloseMenu = () => {

    onAddMeetingSuccessDialog;
    setAnchorEl(null);
  };

  const formik = useFormik<FormDate>({
    initialValues: {
      meetId: 0,
      meetDatetime: dayjs().format("YYYY-MM-DD"),
      meetTypeId: 0,
      location: "",
      calledBy: "",

    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (toEdit) {
        updateMeetingData.mutate(values)
      }
      createMeetingData.mutate(values)
    },
  });
  useEffect(() => {
    if (toEdit) {
      formik.setValues({
        meetId: toEdit?.meetId,
        meetDatetime: dayjs(toEdit?.meetDatetime).format("YYYY-MM-DD"),
        meetTypeId: toEdit?.meetTypeId,
        location: toEdit?.location,
        calledBy: toEdit?.calledBy,

      });
    }
  }, [toEdit]);


  let { data: updateMeetingData } = useMutation(() =>
    axios
      .patch("api/Meeting", {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      })
      .then((res) => res.data)
  );
  let { data: createMeetingData } = useMutation((data) =>
    axios
      .post("api/Meeting", data, {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      })
      .then((res) => res.data)
  );

  let userId = localStorage.getItem("userId");

  let meetTypeId = formik.values.meetTypeId;

  const { data: userMeetingtypeData } = useUserMeetingType(userId, {
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
  })

  const columns = [

    columnHelper.accessor((row) => row, {
      header: "Check",
      cell: (info) => <CheckBox />
    }),
    columnHelper.accessor("agenda", {
      header: "Agenda",
      cell: (info) => <Tooltip title={info.getValue()}>
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
      </Tooltip>,
      footer: (info) => info.column.id,
    }),

  ]

  const table = useReactTable({
    data: agenda,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })



  const handleClose = () => {
    onAddMeetingDiscardDialog();
  };

  return (
    <Card>
      <Box
        component={FormDialogPaper as never}
        onSubmit={formik.handleSubmit as never}
      >
        <DialogTitle sx={{ textAlign: "center", fontSize: "25px" }}><b>{!!toEdit ? "Update" : "Add"} Meeting</b></DialogTitle>
        <CardContent>
          <TextField
            label="Date"
            autoFocus
            margin="dense"
            name="meetDatetime"
            type="date"
            value={formik.values.meetDatetime}
            onChange={formik.handleChange}
            error={formik.touched.meetDatetime && Boolean(formik.errors.meetDatetime)}
            helperText={formik.touched.meetDatetime && formik.errors.meetDatetime}
            fullWidth
            variant="standard"
          />
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
              <Typography sx={{ m: 1, textAlign: 'center' }}><b>Add Agendas</b></Typography>
              <Divider />
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
            </Card>) : (null)}

        </CardContent>
        <CardActions>
          {toEdit ? (
            <Button type="submit" variant="contained">
              Update
            </Button>
          ) : (
            <Button type="submit" variant="contained">
              Register
            </Button>
          )}
          <Button onClick={handleClose}>Cancel</Button>
        </CardActions>
      </Box>
    </Card >
  );
}
