/* The following code has been adapted from the official documentation of React MUI.
 * "App Bar," React MUI, [Online], Available: https://mui.com/material-ui/react-app-bar/
 * [Accessed: October 4, 2023]
 */

import * as React from "react";
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import dineLogo from "../assets/images/dineLogoWhite.png";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const drawerWidth = 240;
const navItems = [
  "Home",
  "Restaurant Details",
  "Reservations",
  "Menu",
  "Holistic View",
];

function DrawerAppBar(props) {
  const navigate = useNavigate();

  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleNavigation = (value) => {
    if (value === "Home") {
      navigate("/home");
    } else if (value === "Restaurant Details") {
      navigate("/resdetails");
    } else if (value === "Reservations") {
      navigate("/reservation");
    } else if (value === "Holistic View") {
      navigate("/holisticview");
    } else if (value === "Menu") {
      navigate("/menu");
    } else {
      navigate("/");
    }
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        DINE EASY - PARTNERS
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => {
                handleNavigation(item);
              }}
            >
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: "none", sm: "block" },
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={dineLogo}
              height="30px"
              width="30px"
              alt="Logo"
              style={{ marginRight: "1%" }}
            ></img>
            DINE EASY - PARTNERS
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <>
              {navItems.map((item) => (
                <Button
                  key={item}
                  sx={{ color: "#fff" }}
                  onClick={() => {
                    handleNavigation(item);
                  }}
                >
                  {item}
                </Button>
              ))}
            </>
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <Box
        component="main"
        sx={{
          width: "100%",
          minHeight: "100vh",
          m: 10,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default DrawerAppBar;
