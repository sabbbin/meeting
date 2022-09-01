import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
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

import * as React from "react";
import { Theme, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { IUser } from "../Tables/userTable";
import { useFormik } from "formik";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

interface AddMemberDialogProps extends DialogProps {
  onDiscardAddMemberDialog: () => void;
  onSuccessAddMemberDialog: () => void;
  toEditMember: IUser;
}

const access_token = localStorage.getItem("access_token");

export default function AddMemberDialog({
  onDiscardAddMemberDialog,
  onSuccessAddMemberDialog,
  toEditMember,
  open,
}: AddMemberDialogProps) {
  const [personName, setPersonName] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const { data: dataTypeForUser } = useQuery(
    ["getTypeForUser"],
    () =>
      axios
        .get("api/MeetingType/GetTypeForUser", {
          headers: {
            Authorization: "Bearer " + access_token!,
          },
        })
        .then((res) => res.data),
    {
      initialData: {
        dataTypeForUser: [],
      },
    }
  );

  if (dataTypeForUser.length > 0) {
    var dataMeeting = dataTypeForUser.reduce((initial: any, info: any) => {
      let { MeetTypeId, TypeName } = info;

      let temp = {
        [MeetTypeId]: TypeName,
      };
      return { ...initial, ...temp };
    }, {});
  }

  const handleClose = () => {
    setPersonName([]);
    onDiscardAddMemberDialog();
  };

  interface UserMeetingType {
    userId: number;
    meetTypeId: number;
  }

  let { data: successData, mutate } = useMutation<
    UserMeetingType[],
    unknown,
    unknown
  >(
    (data) =>
      axios
        .post("api/MeetingType/MergeUserMeetingType", data, {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        })
        .then((res) => res.data),
    {
      onSuccess: () => onSuccessAddMemberDialog(),
    }
  );
  const UpdateMember = (e: any) => {
    e.preventDefault();

    let dataMeeting = personName.reduce((initial: any, info) => {
      let temp = {
        userId: toEditMember.userId,
        meetTypeId: info,
      };
      return [...initial, temp];
    }, []);
    console.log(dataMeeting);
    mutate(dataMeeting);
  };

  interface UserMeetingTypeGet {
    userId: number;
    MeetTypeId: number;
  }
  const {
    data: getMeetTypeSelected,
    isSuccess,
    refetch: getData,
  } = useQuery<UserMeetingTypeGet[]>(["getMeetType", toEditMember], () =>
    axios
      .get(`api/MeetingType/${toEditMember?.userId}`, {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      })
      .then((res) => res.data)
  );

  React.useEffect(() => {
    getData();
    console.log("asdfasd", isSuccess);
    if (isSuccess) {
      console.log("hdasflas", getMeetTypeSelected);
      let data = getMeetTypeSelected.reduce(
        (a: any, b) => {
          let { MeetTypeId } = b;

          return [...a, MeetTypeId];
        },
        [toEditMember]
      );

      setPersonName(data);
    } else {
      setPersonName([]);
    }
  }, [toEditMember]);

  console.log(personName);
  return (
    <>
      <Dialog
        PaperComponent={FormDialogPaper as never}
        open={open}
        onClose={handleClose}
        onSubmit={UpdateMember}
      >
        <DialogTitle>Add/remove user from Meetings</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            labelId="demo-multiple-chip-label"
            id="demo-multiple-chip"
            multiple
            value={personName}
            onChange={handleChange}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={dataMeeting[value]} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {dataTypeForUser.length > 0 &&
              dataTypeForUser.map((meeting: any) => (
                <MenuItem key={meeting} value={meeting.MeetTypeId}>
                  {meeting.TypeName}
                </MenuItem>
              ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDiscardAddMemberDialog}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
