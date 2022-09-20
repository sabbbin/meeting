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
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import axios from "axios";
import * as yup from "yup";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";


const FormDialogPaper = (
    props: OverridableComponent<PaperTypeMap<{}, "div">>
) => <Paper {...(props as any)} as="form" />;

interface IPostpond {
    meetId: number,
    newMeetingDatetime: string,
    comment?: string,
    postedBy: number
}
interface PostpondMeetingProps extends DialogProps {
    onDiscardDialog: () => void;
    onSuccessDialog: () => void;
    refetch: () => void;
    initialDate: string | undefined;
    pospondMeetId: number | undefined,
}

const PostpondMeeting = ({
    onDiscardDialog,
    onSuccessDialog,
    open,
    refetch,
    initialDate,
    pospondMeetId,
}: PostpondMeetingProps) => {

    const validationSchema = yup.object({
        meetId: yup.number(),
        newMeetingDatetime: yup.string(),
        comment: yup.string().optional(),
        postedBy: yup.number(),
    });


    let accessToken = localStorage.getItem("access_token");

    let userId = localStorage.getItem("userId")

    const headers = {
        Authorization: "Bearer " + accessToken,
    };

    const PostpondMeeting = useMutation<unknown, unknown, IPostpond>(
        async (data) =>
            await axios
                .post("api/Meeting/Pospond", data, {
                    headers: headers,
                })
                .then((res) => res.data),
        {
            onSuccess() {
                onSuccessDialog()
                refetch()
            },
        }
    );


    const formik = useFormik<IPostpond>({
        initialValues: {
            meetId: Number(pospondMeetId),
            newMeetingDatetime: dayjs(initialDate).format(),
            comment: '',
            postedBy: Number(userId),
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            PostpondMeeting.mutate(values);
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
            <DialogTitle>Pospond Meeting</DialogTitle>
            <DialogContent >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker

                        label='Date/time'
                        value={formik.values.newMeetingDatetime}
                        inputFormat="MMM D, YYYY h:mm A"
                        onChange={(newValue) => {

                            formik.setFieldValue("newMeetingDatetime", newValue);

                        }}
                        renderInput={(params) => (
                            <TextField
                                sx={{ mt: 1 }}
                                fullWidth
                                error={
                                    formik.touched.newMeetingDatetime &&
                                    Boolean(formik.errors.newMeetingDatetime)
                                }
                                helperText={
                                    formik.touched.newMeetingDatetime && formik.errors.newMeetingDatetime
                                }
                                {...params}
                            />
                        )}
                    />
                </LocalizationProvider>
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

export default PostpondMeeting;
