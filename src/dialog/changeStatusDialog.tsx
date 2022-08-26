import { Dialog, DialogContent, DialogProps, DialogTitle } from "@mui/material";

interface UserDialogProps extends DialogProps {
    onDiscardDialog: () => void;
    onSuccessDialog: () => void;

}
export default function ChangeStatusDialog({ onDiscardDialog, onSuccessDialog, open }: UserDialogProps) {
    return (
        <Dialog open={open}>
            <DialogTitle>hello</DialogTitle>
            <DialogContent>

            </DialogContent>
        </Dialog>
    )
}