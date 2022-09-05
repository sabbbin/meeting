import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { AppRoutes } from "./routes";

let access_token = localStorage.getItem("access_token");
let refresh_token = localStorage.getItem("refresh_toke");
let userId = localStorage.getItem("userId");

function App() {
  const navigate = useNavigate();
  const { data, isSuccess, mutate } = useMutation(
    () =>
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
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("refresh_toke", data.refreshToken);
        localStorage.setItem("fullname", data.fullname);
        navigate("/", {
          replace: true,
        });
      },
      onError: () => {
        navigate("/login");
      },
    }
  );

  let [refreshflag, setRefreshFlag] = useState(false);
  useEffect(() => {
    if (access_token && refresh_token) {
      mutate();
    }
  }, [refreshflag]);

  setTimeout(() => {
    setRefreshFlag(!refreshflag);
  }, 864000000);
  const element = useRoutes(AppRoutes);

  return <Suspense>{element}</Suspense>;
}

export default App;
