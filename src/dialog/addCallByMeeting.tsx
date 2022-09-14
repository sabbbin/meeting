import {
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  PaperTypeMap,
} from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import React from "react";

const FormDialogPaper = (
  props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

export default function AddCallByMeeting() {
  return (
    <Dialog PaperComponent={FormDialogPaper as never} open={true}>
      <DialogTitle>Call for Meeting</DialogTitle>
      <DialogContent></DialogContent>
    </Dialog>
  );
}
