import { lazy } from "react";
import { RouteObject } from "react-router-dom";

const Login = lazy(() => import("./pages/login"));
const BaseLayout = lazy(() => import("./pages/baseLayout"));
const UserTable = lazy(() => import("./Tables/userTable"));
const AgendaTable = lazy(() => import("./Tables/agendaTable"));
const MeetingTypeTable = lazy(() => import("./Tables/meetingTypeTable"));
const Meeting = lazy(() => import("./Tables/meeting"));

export const AppRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <BaseLayout />,
    children: [
      {
        path: "/userTable",
        element: <UserTable />,
      },
      {
        path: "/meeting",
        element: <Meeting />,
      },
      {
        path: "/agendaTable",
        element: <AgendaTable />,
      },
      {
        path: "/MeetingTypeTable",
        element: <MeetingTypeTable />,
      },
    ],
  },
];
