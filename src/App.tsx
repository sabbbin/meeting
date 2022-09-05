import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import { useRoutes } from "react-router-dom";
import { AppRoutes } from "./routes";

let access_token = localStorage.getItem("access_token");
let refresh_token = localStorage.getItem("refresh_toke");
let userId = localStorage.getItem("userId");

function App() {
  const { data, isSuccess, mutate } = useMutation(() =>
    axios
      .post(
        "api/User/RefreshToken",
        {
          userId: Number(userId),
          oldAccessToken: access_token,
          refreshToken: refresh_token,
        },
        {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        }
      )
      .then((res) => res.data)
  );
  useEffect(() => {
    if (access_token && refresh_token) {
      mutate();
      console.log("asdf", isSuccess, data);
      if (isSuccess) {
        console.log(data);
      }
    }
  }, []);
  const element = useRoutes(AppRoutes);

  return <Suspense>{element}</Suspense>;
}

export default App;
