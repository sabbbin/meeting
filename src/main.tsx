import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SnackbarProvider } from "notistack";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <App />
      </SnackbarProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
