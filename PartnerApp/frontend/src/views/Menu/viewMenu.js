import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Box,
  Container,
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import axios from "axios";
const MenuList = () => {
  const resDetails = JSON.parse(window.localStorage.getItem("user"));
  console.log(resDetails);
  const restaurantId = resDetails?.uid;

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASEURL,
    headers: {
      "X-API-Key": process.env.REACT_APP_API_KEY,
      "Content-Type": "application/json",
    },
  });

  const api2 = axios.create();

  const [menuItems, setMenuItems] = useState([]);
  const [entireMenuOffer, setEntireMenuOffer] = useState([]);
  const [spinnerOpen, setSpinnerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errSnackbarOpen, setErrSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogValue, setDialogValue] = useState("");
  const navigate = useNavigate();

  const initialMenuData = {
    menu_category: "",
    menu_ingredients: "",
    menu_item_availability: "",
    menu_item_id: "",
    menu_item_name: "",
    menu_price: "",
    menu_offer: "",
    menu_offer_price: "",
  };

  useEffect(() => {
    // Make an API call to fetch restaurant data
    setSpinnerOpen(true);
    api
      .post("/dev-get-rd/getRestaurantDetails", {
        restaurant_id: restaurantId,
      })
      .then((response) => {
        console.log(response.data);
        setMenuItems(response.data.body.restaurant_food_menu);
        setEntireMenuOffer(response.data.body.restaurant_offers); //restaurant_offers
        setSpinnerOpen(false);
      })
      .catch((error) => {
        setSpinnerOpen(false);
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleAddMenuItem = () => {
    navigate("/updateMenu", {
      state: {
        isEditing: false,
        initialMenuData: initialMenuData,
        totalItems: menuItems,
        restaurantId: restaurantId,
      },
    });
  };

  const handleEditMenuItem = (menuId) => {
    const menuItemData = menuItems.filter(
      (item) => item.menu_item_id === menuId
    );

    navigate("/updateMenu", {
      state: {
        isEditing: true,
        initialMenuData: menuItemData,
        totalItems: menuItems,
        restaurantId: restaurantId,
      },
    });
  };

  const handleDeleteMenuItem = (menuIndex) => {
    const updatedMenuItems = [...menuItems];
    updatedMenuItems.splice(menuIndex, 1);
    setMenuItems(updatedMenuItems);
    setSpinnerOpen(true);

    console.log("addedMenuItems", menuItems);
    console.log("updatedMenuItems", updatedMenuItems);

    api2
      .post(process.env.REACT_APP_API_MENU_UPDATE, {
        restaurant_id: restaurantId,
        restaurant_food_menu: updatedMenuItems,
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          setSpinnerOpen(false);
          setSuccessMessage("Menu updated!");
          setSnackbarOpen(true);
        }
      })
      .catch((error) => {
        setSpinnerOpen(false);
        setErrorMessage("Error occurred!");
        setErrSnackbarOpen(true);
        console.error("Error fetching data:", error);
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setErrSnackbarOpen(false);
  };

  const handleOpenDialog = (value) => {
    setOpenDialog(true);
    setDialogValue(value);
  };

  const handleDialogInputChange = (event) => {
    setDialogValue(event.target.value);
  };

  const handleSaveDialog = () => {
    setSpinnerOpen(true);

    api2
      .post(process.env.REACT_APP_API_MENU_UPDATE, {
        restaurant_id: restaurantId,
        restaurant_offers: dialogValue,
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          setOpenDialog(false);
          setSuccessMessage("Menu offer updated!");
          setSnackbarOpen(true);
          setEntireMenuOffer(dialogValue);
        }
      })
      .catch((error) => {
        console.error("Error updating menu offer:", error);
        setErrorMessage("Error occurred while updating menu offer!");
        setErrSnackbarOpen(true);
      })
      .finally(() => {
        setSpinnerOpen(false);
      });
  };

  const handleDeleteEntireMenuOffer = () => {
    setSpinnerOpen(true);

    api2
      .post(process.env.REACT_APP_API_MENU_UPDATE, {
        restaurant_id: restaurantId,
        restaurant_offers: null, // Set the entire menu offer as an empty string or null to delete it
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          setOpenDialog(false);
          setSuccessMessage("Menu offer deleted!");
          setSnackbarOpen(true);
          setEntireMenuOffer("");
        }
      })
      .catch((error) => {
        console.error("Error deleting menu offer:", error);
        setErrorMessage("Error occurred while deleting menu offer!");
        setErrSnackbarOpen(true);
      })
      .finally(() => {
        setSpinnerOpen(false);
      });
  };

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={spinnerOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {restaurantId ? (
        <>
          <Container maxWidth="md">
            <Typography
              variant="h1"
              style={{
                textAlign: "center",
                padding: "20px",
                fontFamily: "Brush Script MT",
              }}
            >
              Menu
            </Typography>
            {entireMenuOffer ? (
              <Box
                bgcolor="red"
                p={2}
                mb={2}
                borderRadius={3}
                display="flex"
                justifyContent="space-between"
              >
                <Typography
                  variant="h6"
                  color="textPrimary"
                  style={{ color: "#ffffff" }}
                >
                  {entireMenuOffer}
                </Typography>
                <IconButton
                  color="inherit"
                  size="medium"
                  onClick={() => handleOpenDialog(entireMenuOffer)}
                  sx={{
                    borderRadius: "50%",
                    bgcolor: "#ffffff",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      bgcolor: "#f0f0f0",
                    },
                  }}
                >
                  <EditIcon fontSize="inherit" />
                </IconButton>
              </Box>
            ) : (
              <Box
                bgcolor="#fafafa"
                p={2}
                mb={2}
                borderRadius={4}
                display="flex"
                justifyContent="space-between"
              >
                <Typography variant="h6" color="textPrimary">
                  Add special offer for the entire menu
                </Typography>
                <IconButton
                  aria-label="add"
                  size="large"
                  onClick={() => handleOpenDialog("")}
                >
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Box>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              style={{ marginBottom: "20px" }}
              onClick={handleAddMenuItem}
            >
              Add New Item
            </Button>
            <Grid container spacing={2}>
              {menuItems?.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Card>
                    <Grid container>
                      <Grid item xs={12}>
                        <CardContent>
                          <Grid container justifyContent="space-between">
                            <Grid item>
                              <Typography variant="h5" component="div">
                                {item.menu_item_name || "N/A"}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography
                                variant="h5"
                                component="div"
                                style={{ color: "#b26a00", textAlign: "right" }}
                              >
                                {item.menu_offer_price ? (
                                  <span>
                                    <s>(${item.menu_price})</s> $
                                    {item.menu_offer_price}
                                  </span>
                                ) : (
                                  <span>(${item.menu_price})</span>
                                )}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Typography variant="body2" color="textSecondary">
                            {item.menu_ingredients || "N/A"}
                          </Typography>

                          <Typography variant="h6" color="textPrimary">
                            Offer:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.menu_offer || "N/A"}
                          </Typography>
                          <Grid container>
                            <Typography variant="h6" color="textPrimary">
                              Category:
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                              {item.menu_category || "N/A"}
                            </Typography>
                          </Grid>
                          <Box mt={2} display="flex">
                            <Button
                              onClick={() =>
                                handleEditMenuItem(item.menu_item_id)
                              }
                              variant="contained"
                              color="primary"
                              style={{ marginRight: "10px" }}
                              startIcon={<EditIcon />}
                            >
                              Edit Item
                            </Button>
                            <Button
                              onClick={() => handleDeleteMenuItem(index)}
                              variant="outlined"
                              startIcon={<DeleteIcon />}
                            >
                              Delete{" "}
                            </Button>
                          </Box>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Alert severity="success">{successMessage}</Alert>
            </Snackbar>
            <Snackbar
              open={errSnackbarOpen}
              autoHideDuration={3000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert severity="error">{errorMessage}</Alert>
            </Snackbar>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
              <DialogTitle>Modify Entire Menu Offer</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  type="text"
                  fullWidth
                  value={dialogValue}
                  onChange={handleDialogInputChange}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={handleSaveDialog}
                  color="primary"
                >
                  Save
                </Button>
                {entireMenuOffer && (
                  <Button
                    onClick={handleDeleteEntireMenuOffer}
                    color="secondary"
                  >
                    Delete
                  </Button>
                )}
              </DialogActions>
            </Dialog>
          </Container>
        </>
      ) : (
        <>
          <Container
            maxWidth="md"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Typography
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "20px",
                  }}
                >
                  Please login first
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 5,
                }}
              >
                <Button variant="contained" onClick={() => navigate("/login")}>
                  Login
                </Button>
              </Grid>
            </Grid>
          </Container>
        </>
      )}
    </>
  );
};

export default MenuList;
