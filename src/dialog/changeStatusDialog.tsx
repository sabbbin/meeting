import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Menu, MenuItem, Paper, PaperTypeMap, TextField } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import changeUserStatus from "../hooks/changeUserStatus";
import useStatus from "../hooks/useStatus";
import { IUser } from "../Tables/userTable";


export interface IChangeStatusDialog {
    userId: number,
    statusId: number,
}

interface ChangeStatusProps extends DialogProps {
    onStatusDiscardDialog: () => void;
    onStatusSuccessDialog: () => void;
    toEditStatus: IUser;

}

const FormDialogPaper = (props: OverridableComponent<PaperTypeMap<{}, "div">>) => <Paper {...props as any} as="form" />


export default function ChangeStatusDialog({ onStatusDiscardDialog, onStatusSuccessDialog, open, toEditStatus: toEdit }: ChangeStatusProps) {
    let accessToken = localStorage.getItem('access_token');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };


    const { data: statusData, refetch } = useStatus({
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })

    const headers = {
        Authorization: 'Bearer ' + accessToken
    }

    const ChangeStatusMutation = useMutation<unknown, unknown, IChangeStatusDialog>(
        async (data) => await axios.post(
            "api/User/ChangeStatus",
            data,
            {
                headers: headers
            }
        ).then((res) => res.data), {
        onSuccess() {
            refetch()
            onStatusSuccessDialog()
        },
    })

    const formik = useFormik<IChangeStatusDialog>({
        initialValues: {
            userId: 1,
            statusId: 1,
        },
        onSubmit: (values) => {
            if (toEdit) ChangeStatusMutation.mutate(values);
        }
    })

    useEffect(() => {

        formik.setValues({
            userId: toEdit?.userId,
            statusId: toEdit?.statusId,
        });
    }, [toEdit])

    const handleClose = () => {
        onStatusDiscardDialog()
    };

    return (
        <Dialog PaperComponent={FormDialogPaper as never} PaperProps={{
            onSubmit: formik.handleSubmit as never
        }} open={open} onClose={handleClose}>
            <DialogTitle>Change User Status</DialogTitle>
            <DialogContent>
                <TextField
                    select
                    fullWidth
                    name="statusId"
                    id="statusId"
                    margin="dense"
                    label="Status"
                    variant="standard"
                    SelectProps={{
                        value: formik.values.statusId,
                        onChange: formik.handleChange
                    }}
                >
                    {statusData.map((status: any, index: number) => (
                        <MenuItem key={index} value={status.StatusId}>{status.StatusName}</MenuItem>
                    ))}

                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={onStatusDiscardDialog}>Cancel</Button>
                <Button type="submit">Submit</Button></DialogActions>
        </Dialog>
    )
}