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
import { Dialog, DialogContent, Paper } from "@mui/material";

function not(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function AddUserToMeetingTypes() {
  const [checked, setChecked] = React.useState<readonly number[]>([]);
  const [left, setLeft] = React.useState<readonly number[]>([0, 2, 3]);
  const [right, setRight] = React.useState<readonly number[]>([]);

  React.useEffect(() => {
    const dummyData = [
      1, 2, 3, 4, 5, 6, 7, 8, 5, 6, 7, 4, 3, 211, 12, 13, 14, 15, 16, 17, 18,
      99,
    ];
    let temp = not(dummyData, left);
    setRight(temp);
  }, []);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);
  const handleToggle = (value: number) => () => {
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

  const customList = (title: React.ReactNode, items: readonly number[]) => (
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
        {items.map((value: number) => {
          return (
            <ListItem key={value} button onClick={handleToggle(value)} dense>
              <ListItemIcon>
                <Checkbox checked={checked.indexOf(value) !== -1}></Checkbox>
              </ListItemIcon>
              <ListItemText primary={value} />
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
  return (
    <Dialog
      open={true}
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
          <Grid item>{customList("User In Meeting", left)}</Grid>
          <Grid item>
            <Grid container direction="column" alignItems="center">
              <Button
                sx={{ m: 2 }}
                size="small"
                variant="contained"
                onClick={handleCheckedRight}
                disabled={leftChecked.length == 0}
              >
                Remove
              </Button>
              <Button
                sx={{ m: 2 }}
                variant="contained"
                size="small"
                onClick={handleCheckedLeft}
                disabled={rightChecked.length == 0}
              >
                Add
              </Button>
            </Grid>
          </Grid>
          <Grid item> {customList("User not in Meeting", right)}</Grid>
        </Grid>
        <div>
          <Button
            variant="contained"
            sx={{
              marginTop: "20px",
              float: "right",
            }}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            sx={{
              margin: "20px 10px 0 0",
              float: "right",
            }}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddUserToMeetingTypes;
