import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Menu, MenuItem, Paper, PaperTypeMap, TextField } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { IUser } from "../Tables/userTable";
import * as yup from 'yup';
import { IMeetingType } from "../Tables/meetingTypeTable";
import useMeetingType from "../hooks/useMeetingType";



interface AddMeetingTypeProps extends DialogProps {
    onAddMeetingTypeDiscardDialog: () => void;
    onAddMeetingTypeSuccessDialog: () => void;
    toEditAddMeetingType: IMeetingType;
    refetch: () => void;

}

const FormDialogPaper = (props: OverridableComponent<PaperTypeMap<{}, "div">>) => <Paper {...props as any} as="form" />


const validationSchema = yup.object({

    typeName: yup
        .string()
        .required("Please provide a Meeting name."),
    alias: yup
        .string()
        .required('Please provide an Alias.'),
    orderIdx: yup
        .number(),
    isEnable: yup
        .boolean()

});

type FormData = yup.TypeOf<typeof validationSchema>


export default function AddMeetingTypeDialog({ refetch, onAddMeetingTypeSuccessDialog, onAddMeetingTypeDiscardDialog, toEditAddMeetingType: toEdit, open }: AddMeetingTypeProps) {
    let accessToken = localStorage.getItem('access_token');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };


    // const { data: meetTypeData, refetch } = useMeetingType({
    //     headers: {
    //         Authorization: 'Bearer ' + accessToken,
    //     },
    // })



    const headers = {
        Authorization: 'Bearer ' + accessToken
    }

    const CreateMeetingTypeMutation = useMutation<unknown, unknown, FormData>(
        async (data) => await axios.post(
            "api/MeetingType",
            data,
            {
                headers: headers
            }
        ).then((res) => res.data), {
        onSuccess() {
            refetch()
            onAddMeetingTypeSuccessDialog()
        },
    })

    const formik = useFormik<FormData>({
        initialValues: {
            typeName: '',
            alias: '',
            isEnable: true,
            orderIdx: 0,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            CreateMeetingTypeMutation.mutate(values);
        }
    })


    useEffect(() => {
        if (toEdit)
            formik.setValues({
                typeName: toEdit?.TypeName,
                alias: toEdit?.Alias,
                orderIdx: toEdit?.OrderIdx,
                isEnable: toEdit?.IsEnable,
            });
    }, [toEdit])

    const handleClose = () => {
        onAddMeetingTypeDiscardDialog()
    };

    return (
        <Dialog PaperComponent={FormDialogPaper as never} PaperProps={{
            onSubmit: formik.handleSubmit as never
        }} open={open} onClose={handleClose}>
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
                <TextField
                    label='Meeting Type'
                    autoFocus
                    margin="dense"
                    id="alias"
                    name="typeName"
                    value={formik.values.typeName}
                    onChange={formik.handleChange}
                    error={formik.touched.typeName && Boolean(formik.errors.typeName)}
                    helperText={formik.touched.typeName && formik.errors.typeName}
                    type="typeName"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    label='Alias'
                    autoFocus
                    margin="dense"
                    id="alias"
                    name="alias"
                    value={formik.values.alias}
                    onChange={formik.handleChange}
                    error={formik.touched.alias && Boolean(formik.errors.alias)}
                    helperText={formik.touched.alias && formik.errors.alias}
                    type="alias"
                    fullWidth
                    variant="standard" />
                <TextField
                    label='Order Index'
                    autoFocus
                    margin="dense"
                    id="orderIdx"
                    name="orderIdx"
                    value={formik.values.orderIdx}
                    onChange={formik.handleChange}
                    error={formik.touched.orderIdx && Boolean(formik.errors.orderIdx)}
                    helperText={formik.touched.orderIdx && formik.errors.orderIdx}
                    type="orderIdx"
                    fullWidth
                    variant="standard" />
            </DialogContent>
            <DialogActions>
                <Button onClick={onAddMeetingTypeDiscardDialog}>Cancel</Button>
                <Button type="submit">Submit</Button></DialogActions>
        </Dialog>
    )
}