import {
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

import { useFormik } from "formik";
import * as yup from "yup";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useMutation } from "@tanstack/react-query";

import axios from "axios";


const FormDialogPaper = (
    props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

interface ICancle {
    meetId: number,
    comment?: string,
    postedBy: number
}
interface CancleMeetingProps extends DialogProps {
    onDiscardDialog: () => void;
    onSuccessDialog: () => void;
}

const CancleMeeting = ({
    onDiscardDialog,
    onSuccessDialog,
    open,
}: CancleMeetingProps) => {

    const validationSchema = yup.object({
        meetId: yup.number(),
        comment: yup.string().optional(),
        postedBy: yup.number(),
    });


    let accessToken = localStorage.getItem("access_token");

    let userId = localStorage.getItem("userId")

    const headers = {
        Authorization: "Bearer " + accessToken,
    };

    const CancleMeetingData = useMutation<unknown, unknown, ICancle>(
        async (data) =>
            await axios
                .post("api/Meeting/Cancel", data, {
                    headers: headers,
                })
                .then((res) => res.data),
        {
            onSuccess() {
                onSuccessDialog()

            },
        }
    );


    const formik = useFormik<ICancle>({
        initialValues: {
            meetId: 0,
            comment: '',
            postedBy: Number(userId),
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            CancleMeetingData.mutate(values);
        },
    });

    return (
        <Dialog

            PaperComponent={FormDialogPaper as never}
            PaperProps={{
                onSubmit: formik.handleSubmit as never,
            }}
            open={open}
        >
            <DialogTitle>Cancle Meeting</DialogTitle>
            <DialogContent >
                <TextField
                    margin="dense"
                    id="comment"
                    name="comment"
                    value={formik.values.comment}
                    onChange={formik.handleChange}
                    error={formik.touched.comment && Boolean(formik.errors.comment)}
                    helperText={formik.touched.comment && formik.errors.comment}
                    label="Comment"
                    type="name"
                    multiline
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onDiscardDialog}>Cancel</Button>
                <Button type="submit">Submit</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancleMeeting;
