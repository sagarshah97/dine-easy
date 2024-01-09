import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  InputLabel,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import axios from "axios";

const AddMenuItems = () => {
  const navigate = useNavigate();
  const api = axios.create();

  const location = useLocation();
  const { isEditing, initialMenuData, totalItems, restaurantId } =
    location.state || {};
  const [menuItem, setMenuItem] = useState({ initialMenuData });
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errSnackbarOpen, setErrSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [addedMenuItems, setAddedMenuItems] = useState([]);
  const [spinnerOpen, setSpinnerOpen] = useState(false);

  console.log("Data:", JSON.stringify(totalItems, null, 2));
  console.log("Menu:", JSON.stringify(menuItem, null, 2));

  useEffect(() => {
    setMenuItem(initialMenuData[0]);
    setAddedMenuItems(totalItems);
  }, [isEditing, initialMenuData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const fieldValue = name === "photo" ? files[0] : value;

    setMenuItem((prevMenuItem) => ({
      ...prevMenuItem,
      [name]: fieldValue,
    }));

    /*     if (name === 'photo' && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhoto(e.target.result);
      };
      reader.readAsDataURL(files[0]);
    } */
  };

  const handleAddMenu = () => {
    console.log(menuItem);
    if (!menuItem) {
      setErrorMessage("Please add any item details to save");
      setErrSnackbarOpen(true);
      return;
    }

    if (
      !menuItem.menu_category ||
      !menuItem.menu_item_name ||
      !menuItem.menu_price
    ) {
      setErrorMessage(
        "Please fill all the required fields: Category, Item Name, and Price"
      );
      setErrSnackbarOpen(true);
      return;
    }

    if (addedMenuItems?.length > 0) {
      const lastItemId = parseInt(
        addedMenuItems[addedMenuItems.length - 1].menu_item_id,
        10
      );
      menuItem.menu_item_id = (lastItemId + 1).toString();
    } else {
      // If no items previously, start with 1000
      menuItem.menu_item_id = "1000";
    }

    //setAddedMenuItems([...addedMenuItems, menuItem]);
    setSpinnerOpen(true);

    // console.log("addedMenuItems",addedMenuItems);
    // console.log("updatedMenuItems",[...addedMenuItems, menuItem]);


    api
      .post(process.env.REACT_APP_API_MENU_UPDATE, {
        restaurant_id: restaurantId,
        restaurant_food_menu: addedMenuItems?.length ? [...addedMenuItems, menuItem]:  [ menuItem],
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

  const handleUpdateMenu = () => {
    if (!menuItem) {
      setErrorMessage("Please add any item details to save");
      setErrSnackbarOpen(true);
      return;
    }

    if (
      !menuItem.menu_category ||
      !menuItem.menu_item_name ||
      !menuItem.menu_price
    ) {
      setErrorMessage(
        "Please fill all the required fields: Category, Item Name, and Price"
      );
      setErrSnackbarOpen(true);
      return;
    }

    const index = addedMenuItems.findIndex(
      (item) => item.menu_item_id === menuItem.menu_item_id
    );

    if (index !== -1) {
      const updatedMenuItems = [...addedMenuItems];
      updatedMenuItems[index] = menuItem;

      setAddedMenuItems(updatedMenuItems);
      setSpinnerOpen(true);

      console.log("addedMenuItems", addedMenuItems);
      console.log("updatedMenuItems", updatedMenuItems);

      api
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
    }
  };

  const handleCancelModify = () => {
    navigate("/menu");
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setErrSnackbarOpen(false);
  };

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={spinnerOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Container>
        {!isEditing ? (
          <Typography
            variant="h4"
            style={{ textAlign: "center", padding: "20px" }}
          >
            Add Menu Item
          </Typography>
        ) : (
          <Typography
            variant="h4"
            style={{ textAlign: "center", padding: "20px" }}
          >
            Edit Menu Item
          </Typography>
        )}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <InputLabel>Item Name</InputLabel>
            <TextField
              fullWidth
              name="menu_item_name"
              value={menuItem?.menu_item_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <InputLabel>Description</InputLabel>
            <TextField
              fullWidth
              name="menu_ingredients"
              value={menuItem?.menu_ingredients}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <InputLabel>Availability</InputLabel>
            <Select
              fullWidth
              name="menu_item_availability"
              value={menuItem?.menu_item_availability || ""}
              onChange={handleChange}
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Unavailable">Unavailable</MenuItem>
              {/* Add more types as needed */}
            </Select>
          </Grid>
          <Grid item xs={6}>
            <InputLabel>Category</InputLabel>
            <Select
              fullWidth
              name="menu_category"
              value={menuItem?.menu_category || ""}
              onChange={handleChange}
            >
              <MenuItem value="">Select Category</MenuItem>
              <MenuItem value="Appetizer">Appetizer</MenuItem>
              <MenuItem value="Main Course">Main Course</MenuItem>
              <MenuItem value="Curries">Curries</MenuItem>
              <MenuItem value="Desserts">Desserts</MenuItem>
              {/* Add more types as needed */}
            </Select>
          </Grid>
          <Grid item xs={6}>
            <InputLabel>Price</InputLabel>
            <TextField
              fullWidth
              type="number"
              name="menu_price"
              inputProps={{
                maxLength: 13,
                step: "1",
              }}
              value={menuItem?.menu_price}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <InputLabel>Offer</InputLabel>
            <TextField
              fullWidth
              name="menu_offer"
              value={menuItem?.menu_offer}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <InputLabel>Discounted Price</InputLabel>
            <TextField
              fullWidth
              type="number"
              name="menu_offer_price"
              inputProps={{
                maxLength: 13,
                step: "1",
              }}
              value={menuItem?.menu_offer_price}
              onChange={handleChange}
            />
          </Grid>
          <Grid
            container
            spacing={5}
            alignItems="center"
            justifyContent="center"
            style={{ margin: "0px" }}
          >
            <Grid item>
              {!isEditing ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleAddMenu}
                  style={{ width: "150px" }}
                >
                  Save
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleUpdateMenu}
                  style={{ width: "150px" }}
                >
                  Save
                </Button>
              )}
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CancelIcon />}
                onClick={handleCancelModify}
                style={{ width: "150px" }}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
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
      </Container>
    </>
  );
};

export default AddMenuItems;
