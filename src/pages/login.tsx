import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Card, CardContent, InputLabel } from "@mui/material";
import { Form, Formik, FormikHelpers, useFormik } from "formik";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import { useAuthenticationStore } from "../hooks/useAuthenticationLogin";
import { IUser } from "../Tables/userTable";
import { useNavigate } from "react-router-dom";

const theme = createTheme();

export interface ILogin {
  username: string;
  password: string;
}

const validationSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .typeError("Username name must be a string"),
  password: yup
    .string()
    // .min(8, 'Password should be of minimum 8 characters length')
    .required("Password is required")
    .typeError("Username name must be a string"),
});

export default function Login() {
  // const useLogin = useAuthenticationStore(
  //     state => state.Login
  // );
  let navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values: ILogin, { setSubmitting }: FormikHelpers<ILogin>) => {
      LoginMutation.mutate(values);
    },
  });
  interface ILoginOutput {
    accessToken: string;
    refreshToken: string;
    userId: string;
    fullname: string;
  }

  const LoginMutation = useMutation<ILoginOutput, unknown, ILogin>(
    async (data) =>
      await axios.post("api/User/Login", data).then((res) => res.data),
    {
      onSuccess(data) {
        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_toke", data.refreshToken);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("fullname", data.fullname);
        navigate("/", {
          replace: true,
        });
      },
    }
  );

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            alt="Channakya Software"
            src="/src/logo/Channakya-logo.png"
            sx={{
              height: 61,
              width: 263.13,
            }}
          />
          <Typography
            component="h1"
            variant="h5"
            sx={{
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            Sign in to Channakya Meetings
          </Typography>
          <Card>
            <CardContent>
              <Box
                component="form"
                onSubmit={formik.handleSubmit}
                noValidate
                sx={{ mt: 1 }}
              >
                <InputLabel>Username/Email</InputLabel>
                <TextField
                  margin="normal"
                  fullWidth
                  id="username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.username && Boolean(formik.errors.username)
                  }
                  helperText={formik.touched.username && formik.errors.username}
                  autoFocus
                />
                <InputLabel sx={{}}>Password</InputLabel>
                <TextField
                  margin="normal"
                  fullWidth
                  id="password"
                  name="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  style={{
                    backgroundColor: "#26A641",
                    color: "#FFFFFF",
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </CardContent>
          </Card>
          <Card
            sx={{
              margin: 4,
              width: 343,
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              New To Meetings?
              <Link href="#" variant="body2">
                {"Create an account."}
              </Link>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
