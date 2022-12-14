import React, { ReactNode, Suspense, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Roles } from "../roles/roles";
import Navlist from "../route/NavListItem";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { AccountBox, CalendarMonth } from "@mui/icons-material";
import GroupsIcon from "@mui/icons-material/Groups";
import LogoutIcon from "@mui/icons-material/Logout";
import ChangePasswordDialog from "../dialog/changePasswordDialog copy";
import { IUser } from "../Tables/userTable";
import { Menu, MenuItem } from "@mui/material";

const drawerWidth = 240;

export interface INavItemsProps {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  role?: Roles[];
  items?: INavItemsProps[];
}

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function BaseLayout() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openUserInfo = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  let navigate = useNavigate();

  const handleLogOut = () => {
    localStorage.clear;
    navigate("/login");
  };
  const [isResetPassword, setisResetPassword] = useState(false);
  const [isforMenu, setisforMenu] = useState<IUser | null>();

  const UserName = sessionStorage.getItem("username");

  const sidebarItems: INavItemsProps[] = [
    {
      label: "Users",
      icon: <GroupIcon />,
      role: [Roles.ADMIN],
      onClick: () => {
        navigate("./userTable");
      },
    },
    {
      label: "Meetings",
      icon: <MeetingRoomIcon />,
      role: [Roles.ADMIN],
      onClick: () => {
        navigate("./meeting");
      },
    },
    {
      label: "Agenda",
      icon: <CalendarMonth />,
      role: [Roles.ADMIN],
      onClick: () => {
        navigate("./agendaTable");
      },
    },
    {
      label: "MeetingType",
      icon: <GroupsIcon />,
      role: [Roles.ADMIN],
      onClick: () => {
        navigate("./MeetingTypeTable");
      },
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <ChangePasswordDialog
            open={isResetPassword}
            onChangePasswordDiscardDialog={() => {
              setisResetPassword(false);
            }}
            onChangePasswordSuccessDialog={() => {
              setisResetPassword(false);
            }}
            toEditChangePasswprd={isforMenu!}
          />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Channakya Meetings
            </Typography>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={openUserInfo}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <MenuItem> Username</MenuItem>

            <MenuItem
              onClick={() => {
                setisResetPassword(true);
              }}
            >
              {" "}
              Change Password
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogOut}>
              <LogoutIcon />
              Logout
            </MenuItem>
          </Menu>
          <IconButton onClick={handleClick}>
            <AccountBox />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Navlist items={sidebarItems} />
      </Drawer>
      <Main open={open}>
        <Outlet />
      </Main>
    </Box>
  );
}
