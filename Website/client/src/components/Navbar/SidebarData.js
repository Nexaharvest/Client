import React from "react";
import * as AiIcons from "react-icons/ai";
import * as bifrom from "react-icons/bi";
import * as feathericons from "react-icons/fi";

export const SidebarData = [
  {
    title: "Home",
    path: "/",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "History",
    path: "/history",
    icon: <bifrom.BiHistory />,
    cName: "nav-text",
  },
  {
    title: "Devices",
    path: "/devices",
    icon: <bifrom.BiDevices />,
    cName: "nav-text",
  },
  {
    title: "Landing",
    path: "/landing",
    icon: <bifrom.BiLaptop />,
    cName: "nav-text",
  },
  {
    title: "Documentation",
    path: "/doc",
    icon: <bifrom.BiFile />,
    cName: "nav-text",
  },
  {
    title: "Profile",
    path: "/profile",
    icon: <feathericons.FiUser />,
    cName: "nav-text",
  },
  {
    title: "Logout",
    path: "/logout",
    icon: <feathericons.FiLogOut />,
    cName: "nav-text",
  },
];
