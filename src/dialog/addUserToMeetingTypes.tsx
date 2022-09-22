import * as React from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import {
  Dialog,
  DialogContent,
  DialogProps,
  Paper,
  PaperTypeMap,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { LocalConvenienceStoreOutlined } from "@mui/icons-material";

interface getUserFromMeeting {
  UserId: number;
  UserName: string;
  FullName: string;
  IsSelected: number;
}

function not(
  a: readonly getUserFromMeeting[],
  b: readonly getUserFromMeeting[]
) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(
  a: readonly getUserFromMeeting[],
  b: readonly getUserFromMeeting[]
) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

interface AddUserToMeetingTypes extends DialogProps {
  refetch: () => void;
  meetTypeId: number;
  onDialogClose: () => void;
}

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

function AddUserToMeetingTypes({
  refetch,
  onDialogClose,
  meetTypeId,
  open,
}: AddUserToMeetingTypes) {
  console.log("meeting", meetTypeId);
  const [checked, setChecked] = React.useState<readonly getUserFromMeeting[]>(
    []
  );
  const [left, setLeft] = React.useState<readonly getUserFromMeeting[]>([]);
  const [right, setRight] = React.useState<readonly getUserFromMeeting[]>([]);
  let access_token = localStorage.getItem("access_token");

  let getUserFromMeeting = useQuery<getUserFromMeeting[]>(
    ["getUserData"],
    async () =>
      await axios
        .get(`api/MeetingType/GetUserByType/${meetTypeId}`, {
          headers: {
            Authorization: "bearer " + access_token,
          },
        })
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        let leftdata = data.reduce((da: any, arr) => {
          if (arr.IsSelected == 0) {
            let temp = {
              FullName: arr.FullName,
              UserId: arr.UserId,
            };
            return [...da, temp];
          } else {
            return da;
          }
        }, []);
        let rightdata = data.reduce((da: any, arr) => {
          if (arr.IsSelected == 1) {
            let temp = {
              FullName: arr.FullName,
              UserId: arr.UserId,
            };
            return [...da, temp];
          } else {
            return da;
          }
        }, []);

        setLeft(leftdata);
        setRight(rightdata);
      },
    }
  );

  React.useEffect(() => {
    getUserFromMeeting.refetch();
  }, [meetTypeId]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);
  const handleToggle = (value: getUserFromMeeting) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };
  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  interface submitUserToMeeting {
    userId: [number];
  }

  let submitUserToMeeting = useMutation<unknown, unknown, submitUserToMeeting>(
    (data) =>
      axios.post("api/MeetingType/MergeMeetingTypeUser", data, {
        params: {
          meetTypeId: meetTypeId,
        },
        headers: {
          Authorization: "bearer " + access_token,
        },
      }),
    {
      onSuccess: () => {
        onDialogClose();
      },
    }
  );
  const handleSubmit = (e: any) => {
    e.preventDefault();

    let data = right.reduce((init: any, dat) => {
      return [...init, dat.UserId!];
    }, []);
    let userIds = {
      userId: data,
    };
    console.log("right data", userIds);
    submitUserToMeeting.mutate(userIds);
  };

  const customList = (
    title: React.ReactNode,
    items: readonly getUserFromMeeting[]
  ) => (
    <Card>
      <CardHeader sx={{ px: 2, py: 1 }} title={title}></CardHeader>

      <Divider />

      <List
        dense
        component="div"
        role="list"
        sx={{
          width: 300,
          height: 400,
          bgcolor: "background.paper",
          overflow: "auto",
        }}
      >
        {items.map((value: any, id) => {
          return (
            <ListItem key={id} button onClick={handleToggle(value)} dense>
              <ListItemIcon>
                <Checkbox checked={checked.indexOf(value) !== -1}></Checkbox>
              </ListItemIcon>
              <ListItemText primary={value.FullName} />
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
  return (
    <Dialog
      PaperComponent={FormDialogPaper as never}
      open={open}
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "1000px", // Set your width here
          },
        },
      }}
    >
      <DialogContent>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item>{customList("User not In Meeting", left)}</Grid>
          <Grid item>
            <Grid container direction="column" alignItems="center">
              <Button
                sx={{ m: 2 }}
                size="small"
                variant="contained"
                onClick={handleCheckedRight}
                disabled={leftChecked.length == 0}
              >
                Add
              </Button>
              <Button
                sx={{ m: 2 }}
                variant="contained"
                size="small"
                onClick={handleCheckedLeft}
                disabled={rightChecked.length == 0}
              >
                Remove
              </Button>
            </Grid>
          </Grid>
          <Grid item> {customList("User  in Meeting", right)}</Grid>
        </Grid>
        <div>
          <Button
            variant="contained"
            sx={{
              marginTop: "20px",
              float: "right",
            }}
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            sx={{
              margin: "20px 10px 0 0",
              float: "right",
            }}
            onClick={onDialogClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddUserToMeetingTypes;
