import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Paper,
  PaperTypeMap,
  TextField,
} from "@mui/material";

import * as React from "react";

import { OverridableComponent } from "@mui/material/OverridableComponent";
import { IUser } from "../Tables/userTable";
import { useFormik } from "formik";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

interface AddMemberDialogProps extends DialogProps {
  onDiscardAddMemberDialog: () => void;
  onSuccessAddMemberDialog: () => void;
  toEditMember: IUser;
}

interface UserMeetingTypeGet {
  TypeName: string;
  MeetTypeId: number;
}

interface UserMeetingType {
  userId: number;
  meetTypeId: number[];
}

const access_token = localStorage.getItem("access_token");

export default function AddMemberDialog({
  onDiscardAddMemberDialog,
  onSuccessAddMemberDialog,
  toEditMember,
  open,
}: AddMemberDialogProps) {
  const [personName, setPersonName] = React.useState<string[]>([]);
  const [meetingField, setMeetingField] = React.useState<UserMeetingTypeGet[]>(
    []
  );

  //get the userMeeting types for user
  const { data: getMeetTypeSelected, refetch: getData } = useQuery<
    UserMeetingTypeGet[]
  >(
    ["getMeetType", toEditMember],
    () =>
      axios
        .get(`api/MeetingType/${toEditMember?.userId}`, {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        })
        .then((res) => res.data),
    {
      onSuccess: (getMeetTypeSelected) => {
        let data = getMeetTypeSelected.reduce(
          (a: any, b) => {
            let { MeetTypeId } = b;

            return [...a, MeetTypeId];
          },
          [toEditMember]
        );
        let abc = data.shift();

        let temp = data.reduce((init: any, dat: any) => {
          return [...data];
        }, []);

        if (temp.length > 0) {
          setPersonName(temp);
        }
      },
    }
  );

  //load all meeting types
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
      onSuccess: async () => {
        let info = await getData().then((res) => res.data);
        console.log("info", info);
        if (info) setMeetingField(info);
      },
    }
  );

  //keeeping user in dictionary
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

  ///adding user in meeting types fields
  let { data: successData, mutate } = useMutation<
    UserMeetingType,
    unknown,
    unknown
  >(
    (data) =>
      axios
        .post("api/MeetingType/MergeUserMeetingType", data, {
          params: {
            userId: toEditMember.userId,
          },
          headers: {
            Authorization: "Bearer " + access_token,
          },
        })
        .then((res) => res.data),
    {
      onSuccess: () => onSuccessAddMemberDialog(),
    }
  );

  //preprocessing data before send for updating  data
  const UpdateMember = (e: any) => {
    e.preventDefault();
    let temp = {
      meetTypeIds: meetingField.map((m) => m.MeetTypeId),
    };

    console.log("tempt", meetingField);
    mutate(temp);
  };

  return (
    <Dialog
      PaperComponent={FormDialogPaper as never}
      open={open}
      onClose={handleClose}
      onSubmit={UpdateMember}
    >
      <DialogTitle>Add/remove user from Meetings</DialogTitle>
      <DialogContent>
        <Autocomplete
          id="tags-outlined"
          multiple
          options={dataTypeForUser}
          value={[...meetingField]}
          filterSelectedOptions
          getOptionLabel={(option) => option.TypeName}
          onChange={(e, value) => {
            setMeetingField(value);
          }}
          isOptionEqualToValue={(option, value) =>
            option.MeetTypeId == value.MeetTypeId
          }
          renderInput={(params) => <TextField required {...params}></TextField>}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onDiscardAddMemberDialog}>Cancel</Button>
        <Button type="submit">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
