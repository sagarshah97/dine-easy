import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Backdrop,
  CircularProgress,
  IconButton,
} from "@mui/material";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import axios from "axios";

const AddMenuItem = ({ onAddMenuItem, resData }) => {
  const restaurantData = resData;
  const [addedMenuItems, setAddedMenuItems] = useState(
    restaurantData.restaurant_food_menu
  );
  const [spinnerOpen, setSpinnerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [menuItem, setMenuItem] = useState({
    menu_category: "",
    menu_ingredients: "",
    menu_item_availability: "",
    menu_item_id: "",
    menu_item_name: "",
    menu_offer: "",
    menu_price: "",
  });

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASEURL,
    headers: {
      "X-API-Key": process.env.REACT_APP_API_KEY,
      "Content-Type": "application/json",
    },
  });

  const handleMenuItemChange = (field, value) => {
    setMenuItem({
      ...menuItem,
      [field]: value,
    });
  };

  const handleAddMenuItem = () => {
    // Validate required fields
    if (
      !menuItem.menu_category ||
      !menuItem.menu_item_name ||
      !menuItem.menu_price
    ) {
      alert("Please fill in required fields: Category, Item Name, and Price");
      return;
    }

    // Call the parent component's function to add the menu item
    handleSaveMenuItem(menuItem);
    setSuccessMessage("Menu item added!");
    setSnackbarOpen(true);
    // Clear the form after adding the menu item
    setMenuItem({
      menu_category: "",
      menu_ingredients: "",
      menu_item_availability: "",
      menu_item_id: "",
      menu_item_name: "",
      menu_offer: "",
      menu_price: "",
    });
  };

  const handleSaveMenuItem = (newMenuItem) => {
    // Check if addedItems is not empty
    if (addedMenuItems.length > 0) {
      // Get the menu_item_id of the last item, convert to int, add 1, convert to string
      const lastItemId = parseInt(
        addedMenuItems[addedMenuItems.length - 1].menu_item_id,
        10
      );
      newMenuItem.menu_item_id = (lastItemId + 1).toString();
    } else {
      // If no items previously, start with 1000
      newMenuItem.menu_item_id = "1000";
    }

    setAddedMenuItems([...addedMenuItems, newMenuItem]);
    setSpinnerOpen(true);

    api
      .post("/dev-update-rd/updateRestaurantDetails", {
        restaurant_id: restaurantData.restaurant_id,
        restaurant_food_menu: [...addedMenuItems, newMenuItem],
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
        setSnackbarOpen(true);
        console.error("Error fetching data:", error);
      });
  };

  const handleRemoveMenuItem = (index) => {
    const updatedMenuItems = [...addedMenuItems];
    updatedMenuItems.splice(index, 1);
    setAddedMenuItems(updatedMenuItems);
    setSpinnerOpen(true);

    api
      .post("/dev-update-rd/updateRestaurantDetails", {
        restaurant_id: restaurantData.restaurant_id,
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
        setSnackbarOpen(true);
        console.error("Error fetching data:", error);
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={spinnerOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {addedMenuItems.length > 0 && (
        <div sx={{ marginBottom: "5%" }}>
          <Typography variant="h6" style={{ marginTop: "3%" }}>
            Added Menu Items
          </Typography>
          <TableContainer component={Paper} style={{ marginTop: "10px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>CATEGORY</b>
                  </TableCell>
                  <TableCell>
                    <b>ITEM NAME</b>
                  </TableCell>
                  <TableCell>
                    <b>INGREDIENTS</b>
                  </TableCell>
                  <TableCell>
                    <b>AVAILABILITY</b>
                  </TableCell>
                  <TableCell>
                    <b>OFFER</b>
                  </TableCell>
                  <TableCell>
                    <b>PRICE</b>
                  </TableCell>
                  <TableCell
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <b>REMOVE ITEM</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addedMenuItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.menu_category}</TableCell>
                    <TableCell>{item.menu_item_name}</TableCell>
                    <TableCell>{item.menu_ingredients}</TableCell>
                    <TableCell>{item.menu_item_availability}</TableCell>
                    <TableCell>{item.menu_offer}</TableCell>
                    <TableCell>${item.menu_price}</TableCell>
                    <TableCell
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        onClick={() => handleRemoveMenuItem(index)}
                        color="error"
                      >
                        <DeleteForeverIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="h6" sx={{ marginBottom: "3%" }}>
          Add New Menu Item
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Category"
              fullWidth
              value={menuItem.menu_category}
              onChange={(e) =>
                handleMenuItemChange("menu_category", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Item Name"
              fullWidth
              value={menuItem.menu_item_name}
              onChange={(e) =>
                handleMenuItemChange("menu_item_name", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Ingredients"
              fullWidth
              value={menuItem.menu_ingredients}
              onChange={(e) =>
                handleMenuItemChange("menu_ingredients", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Availability"
              fullWidth
              value={menuItem.menu_item_availability}
              onChange={(e) =>
                handleMenuItemChange("menu_item_availability", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Offer"
              fullWidth
              value={menuItem.menu_offer}
              onChange={(e) =>
                handleMenuItemChange("menu_offer", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Price"
              fullWidth
              type="number"
              value={menuItem.menu_price}
              onChange={(e) =>
                handleMenuItemChange("menu_price", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddMenuItem}
            >
              Add Item
            </Button>
          </Grid>
        </Grid>
        {successMessage && (
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert severity="success">{successMessage}</Alert>
          </Snackbar>
        )}
        {errorMessage && (
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert severity="error">{errorMessage}</Alert>
          </Snackbar>
        )}
      </Paper>
    </>
  );
};

export default AddMenuItem;
