import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Menu, MenuItem, Paper, PaperTypeMap, TextField } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { IUser } from "../Tables/userTable";
import * as yup from 'yup';
import useMeetingType from "../hooks/useMeetingType";
import { IAgenda } from "../Tables/agendaTable";
import useUserMeetingType from "../hooks/useUserMeetingType";



interface AddAgendaProps extends DialogProps {
    onAddAgendaDiscardDialog: () => void;
    onAddAgendaSuccessDialog: () => void;
    toEditAddAgenda: IAgenda;
    refetch: () => void;

}

const FormDialogPaper = (props: OverridableComponent<PaperTypeMap<{}, "div">>) => <Paper {...props as any} as="form" />


const validationSchema = yup.object({

    agenda: yup
        .string()
        .required("Please provide a Meeting name."),
    description: yup
        .string()
        .required('Please provide an Alias.'),
    meetType: yup
        .number()
        .required('Please provide a Meeting Type.'),
});

type FormData = yup.TypeOf<typeof validationSchema>


export default function AddAgendaDialog({ refetch, onAddAgendaSuccessDialog, onAddAgendaDiscardDialog, toEditAddAgenda: toEdit, open }: AddAgendaProps) {
    let accessToken = localStorage.getItem('access_token');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const headers = {
        Authorization: 'Bearer ' + accessToken
    }

    const CreateMeetingTypeMutation = useMutation<unknown, unknown, FormData>(
        async (data) => await axios.post(
            "api/MeetingAgenda",
            data,
            {
                headers: headers
            }
        ).then((res) => res.data), {
        onSuccess() {
            refetch()
            onAddAgendaSuccessDialog()
        },
    })

    const UpdateMeetingTypeMutation = useMutation<unknown, unknown, FormData>(
        async (data) => await axios.put(
            "api/MeetingAgenda",
            data,
            {
                headers: headers
            }
        ).then((res) => res.data), {
        onSuccess() {
            refetch()
            onAddAgendaSuccessDialog()
        },
    }
    )

    const DeleteMeetingTypeMutation = useMutation<unknown, unknown, IAgenda>(
        async (data) => await axios.delete(
            `api/MeetingAgenda/${data.agendaId}`,
            {
                headers: headers
            }
        ).then((res) => res.data), {
        onSuccess() {
            refetch()
            onAddAgendaSuccessDialog()
        },
    }
    )

    let userId = localStorage.getItem('userId');

    const { data: userMeetingtypeData } = useUserMeetingType(userId, {
        params: {
            userId: userId
        },
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })


    const formik = useFormik<FormData>({
        initialValues: {
            agenda: '',
            description: '',
            meetType: 1,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (toEdit) UpdateMeetingTypeMutation.mutate(values)
            else CreateMeetingTypeMutation.mutate(values);
        }
    })


    useEffect(() => {
        if (toEdit)
            formik.setValues({
                agenda: toEdit.agenda,
                description: toEdit.description,
                meetType: toEdit.meetTypeId,
            });
    }, [toEdit])


    const handleClose = () => {
        onAddAgendaDiscardDialog()
    };

    return (
        <Dialog PaperComponent={FormDialogPaper as never} PaperProps={{
            onSubmit: formik.handleSubmit as never
        }} open={open} onClose={handleClose}>
            <DialogTitle>{!!toEdit ? 'Update' : 'Add'} Agenda</DialogTitle>
            <DialogContent>
                <TextField
                    label='Agenda'
                    autoFocus
                    margin="dense"
                    id="agenda"
                    name="agenda"
                    value={formik.values.agenda}
                    onChange={formik.handleChange}
                    error={formik.touched.agenda && Boolean(formik.errors.agenda)}
                    helperText={formik.touched.agenda && formik.errors.agenda}
                    type="typeName"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    label='description'
                    autoFocus
                    margin="dense"
                    id="description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    type="alias"
                    fullWidth
                    variant="standard" />
                <TextField
                    select
                    fullWidth
                    name="meetType"
                    id="meetType"
                    margin="dense"
                    label="Meet Type"
                    variant="standard"
                    SelectProps={{
                        value: formik.values.meetType,
                        onChange: formik.handleChange
                    }}>
                    {userMeetingtypeData.map((meetType: any, index: number) => (
                        <MenuItem key={index} value={meetType.MeetTypeId}>{meetType.TypeName}</MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={onAddAgendaDiscardDialog}>Cancel</Button>
                <Button type="submit">Submit</Button></DialogActions>
        </Dialog>
    )
}