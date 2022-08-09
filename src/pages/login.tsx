import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Card, CardContent, InputLabel } from '@mui/material';

const theme = createTheme();

export default function Login() {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',

                    }}>
                    <Box component='img' alt='Channakya Software' src='/src/logo/Channakya-logo.png' sx={{
                        height: 61, width: 263.13
                    }} />
                    <Typography component="h1" variant="h5" sx={{
                        paddingTop: 4, paddingBottom: 4
                    }}>
                        Sign in to Channakya Meetings
                    </Typography>
                    <Card>
                        <CardContent>
                            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                                <InputLabel>
                                    Username /Email
                                </InputLabel>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="email"
                                    name="email"
                                    autoFocus
                                />
                                <InputLabel sx={{

                                }}>
                                    Password
                                </InputLabel>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    name="password"
                                    type="password"
                                    id="password"
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    style={{
                                        backgroundColor: '#26A641',
                                        color: '#FFFFFF'
                                    }}
                                >
                                    Sign In
                                </Button>
                            </Box>

                        </CardContent>
                    </Card>
                    <Card sx={{
                        margin: 4,
                        width: 343
                    }}>
                        <CardContent sx={{
                            display: 'flex',
                            justifyContent: 'center'

                        }}>
                            New To Meetings?
                            <Link href="#" variant="body2">
                                {"Create an account."}
                            </Link>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </ThemeProvider >
    );
}