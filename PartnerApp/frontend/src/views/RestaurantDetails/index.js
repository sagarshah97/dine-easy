import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Switch,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Autocomplete from "react-google-autocomplete";

import axios from "axios";
import OpeningClosingHours from "./OpeningClosingHours";
import TableAvailability from "./TableAvailability";
import RestaurantStatus from "./RestaurantStatus";
// import AddMenuItem from "./AddMenuItem";

import { useNavigate } from "react-router-dom";

import "../../styles/App.css";

const RestaurantDetails = () => {
  const resDetails = JSON.parse(window.localStorage.getItem("user"));
  const resId = resDetails?.uid;
  const navigate = useNavigate();
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASEURL,
    headers: {
      "X-API-Key": process.env.REACT_APP_API_KEY,
      "Content-Type": "application/json",
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [editedTableDetails, setEditedTableDetails] = useState([]);
  const [newTable, setNewTable] = useState({ table_number: "", capacity: "" });
  const [selectedDate, setSelectedDate] = useState();
  const [spinnerOpen, setSpinnerOpen] = useState(false);
  const [tableAvailability, setTableAvailability] = useState();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [restaurantStatus, setRestaurantStatus] = useState("");
  // const [addedMenuItems, setAddedMenuItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    // Make an API call to fetch restaurant data
    getResDetails();
  }, []);

  const getResDetails = () => {
    setSpinnerOpen(true);
    api
      .post("/dev-get-rd/getRestaurantDetails", {
        restaurant_id: resId,
      })
      .then((response) => {
        console.log(response.data);
        setRestaurantData(response.data.body);
        setEditedTableDetails(
          response.data.body.table_details
            ? response.data.body.table_details
            : []
        );
        setRestaurantStatus(response.data.body.restaurant_status);
        // setAddedMenuItems(response.data.body.restaurant_food_menu);
        setSpinnerOpen(false);
      })
      .catch((error) => {
        setSpinnerOpen(false);
        console.error("Error fetching data:", error);
      });
  };

  const handleEdit = () => {
    if (editedTableDetails.length > 0) {
      setIsEditing(true);
    }
  };

  const handleEditImage = () => {
    setIsEditingImage(true);
  };

  const handleCancelImage = () => {
    setIsEditingImage(false);
  };

  const handleSaveImage = async () => {
    try {
      if (selectedImage) {
        setSpinnerOpen(true);

        // Convert the selected image to base64
        setPreviewImage(URL.createObjectURL(selectedImage));
        const base64Image = await convertImageToBase64(selectedImage);
        console.log(base64Image);

        // Make API call to update the image
        const response = await api.post(
          "/dev-update-rd/updateRestaurantDetails",
          {
            restaurant_id: restaurantData.restaurant_id,
            restaurant_image: base64Image,
          }
        );

        if (response?.data?.statusCode === 200) {
          setSuccessMessage("Image updated successfully!");
          setSnackbarOpen(true);
          getResDetails();
        }
      }
    } catch (error) {
      setErrorMessage("Error updating image!");
      setSnackbarOpen(true);
      console.error("Error updating image:", error);
    } finally {
      setIsEditingImage(false);
      setSpinnerOpen(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const convertImageToBase64 = (image) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });
  };

  const handleSave = (newData) => {
    setIsEditing(false);
    setSpinnerOpen(true);
    console.log(editedTableDetails);

    api
      .post("/dev-update-rd/updateRestaurantDetails", {
        restaurant_id: restaurantData.restaurant_id,
        table_details: newData.length ? newData : editedTableDetails,
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          setSpinnerOpen(false);
          setSuccessMessage("Table availability updated!");
          setSnackbarOpen(true);
          getResDetails();
        }
      })
      .catch((error) => {
        setSpinnerOpen(false);
        setErrorMessage("Error occurred!");
        setSnackbarOpen(true);
        console.error("Error fetching data:", error);
      });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTableDetails(restaurantData.table_details);
  };

  const handleCapacityChange = (tableNumber, event) => {
    const newCapacity = parseInt(event.target.value, 10); // Convert to an integer
    const updatedTableDetails = editedTableDetails.map((table) => {
      if (table.table_number === tableNumber) {
        return {
          ...table,
          capacity: newCapacity.toString(),
        };
      }
      return table;
    });

    setEditedTableDetails(updatedTableDetails);
  };

  const handleNewTableChange = (field, value) => {
    setNewTable({
      ...newTable,
      [field]: value,
    });
  };

  const handleAddNewTable = () => {
    if (newTable.table_number && newTable.capacity) {
      setEditedTableDetails([...editedTableDetails, newTable]);
      setNewTable({ table_number: "", capacity: "" });
      handleSave([...editedTableDetails, newTable]);
    }
  };

  const handleRemoveTable = (tableNumber) => {
    const updatedTableDetails = editedTableDetails.filter(
      (table) => table.table_number !== tableNumber
    );
    setEditedTableDetails(updatedTableDetails);
    setSpinnerOpen(true);

    api
      .post("/dev-update-rd/updateRestaurantDetails", {
        restaurant_id: restaurantData.restaurant_id,
        table_details: updatedTableDetails,
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          setSpinnerOpen(false);
          setSuccessMessage("Table removed!");
          setSnackbarOpen(true);
          getResDetails();
        }
      })
      .catch((error) => {
        setSpinnerOpen(false);
        setErrorMessage("Error occurred!");
        setSnackbarOpen(true);
        console.error("Error fetching data:", error);
      });
  };

  const handleDateChange = (date) => {
    setSpinnerOpen(true);
    const chosenDate = new Date(date.$d);
    const formattedDate = chosenDate.toDateString();

    api
      .post("/dev-get-ra/getRestaurantAvailability", {
        date: formattedDate,
        restaurant_id: restaurantData.restaurant_id,
        table_details: restaurantData.table_details,
        restaurant_operation_details:
          restaurantData.restaurant_operation_details,
      })
      .then((response) => {
        console.log(response.data.body);
        setTableAvailability(response.data.body);
        setSpinnerOpen(false);
      })
      .catch((error) => {
        setSpinnerOpen(false);
        console.error("Error fetching data:", error);
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const updateHours = (editedHours) => {
    setSpinnerOpen(true);

    api
      .post("/dev-update-rd/updateRestaurantDetails", {
        restaurant_id: restaurantData.restaurant_id,
        restaurant_operation_details: editedHours,
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          setSpinnerOpen(false);
          setSuccessMessage("Restaurant availability updated!");
          setSnackbarOpen(true);
          getResDetails();
        }
      })
      .catch((error) => {
        setSpinnerOpen(false);
        setErrorMessage("Error occurred!");
        setSnackbarOpen(true);
        console.error("Error fetching data:", error);
      });
  };

  const handleStatusChange = (value) => {
    setRestaurantStatus(value);
    setSpinnerOpen(true);

    api
      .post("/dev-update-rd/updateRestaurantDetails", {
        restaurant_id: restaurantData.restaurant_id,
        status: value,
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          setSpinnerOpen(false);
          setSuccessMessage("Restaurant Status updated!");
          setSnackbarOpen(true);
          getResDetails();
        }
      })
      .catch((error) => {
        setSpinnerOpen(false);
        setErrorMessage("Error occurred!");
        setSnackbarOpen(true);
        console.error("Error fetching data:", error);
      });
  };

  const handleReservableToggleChange = (tableNumber) => {
    setEditedTableDetails((prevDetails) =>
      prevDetails.map((table) =>
        table.table_number === tableNumber
          ? { ...table, reservable: !table.reservable }
          : table
      )
    );
  };

  const handleAddressSelect = (place) => {
    setSelectedAddress(place);
  };

  const handleAddressSave = () => {
    setSpinnerOpen(true);

    api
      .post("/dev-update-rd/updateRestaurantDetails", {
        restaurant_id: restaurantData.restaurant_id,
        address: selectedAddress.formatted_address
          ? selectedAddress.formatted_address
          : selectedAddress.name,
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          setSpinnerOpen(false);
          setSuccessMessage("Restaurant Status updated!");
          setSnackbarOpen(true);
          getResDetails();
        }
      })
      .catch((error) => {
        setSpinnerOpen(false);
        setErrorMessage("Error occurred!");
        setSnackbarOpen(true);
        console.error("Error fetching data:", error);
      });
    setSelectedAddress("");
  };

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={spinnerOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {resId ? (
        <>
          <Container maxWidth="lg">
            {restaurantData ? (
              <div>
                <Typography
                  align="left"
                  sx={{ marginBottom: "3%", fontWeight: 800, fontSize: "3rem" }}
                >
                  {restaurantData.restaurant_name.toUpperCase()}
                </Typography>

                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Typography variant="h5" sx={{ marginBottom: "2%" }}>
                      Restaurant Image
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 100,
                        marginBottom: "2%",
                        fontStyle: "italic",
                      }}
                    >
                      Set the image of the restaurant.
                    </Typography>
                    <div>
                      {!isEditingImage && (
                        <>
                          <div
                            style={{
                              backgroundImage: `url(${restaurantData.img})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              width: "70%",
                              paddingTop: "33.33%",
                              borderRadius: "10px",
                            }}
                          ></div>

                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleEditImage}
                            sx={{ marginTop: "3%" }}
                          >
                            Edit Image
                          </Button>
                        </>
                      )}
                      {isEditingImage && (
                        <div>
                          {previewImage && (
                            <img
                              src={previewImage}
                              alt="Preview"
                              style={{ width: "100%" }}
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <div style={{ marginTop: "2%" }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleSaveImage}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={handleCancelImage}
                              sx={{ marginLeft: "2%" }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" sx={{ marginBottom: "3%" }}>
                      Restaurant Availability
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 100,
                        marginTop: "2%",
                        marginBottom: "2%",
                        fontStyle: "italic",
                      }}
                    >
                      Select a date to know the availability of the restaurant.
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={["DatePicker"]}>
                        <DatePicker
                          label="Date"
                          value={selectedDate}
                          onChange={handleDateChange}
                          disablePast
                          disabled={
                            isEditing ||
                            !restaurantData?.table_details?.length ||
                            !restaurantData?.restaurant_operation_details
                              ?.length
                          }
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                    {tableAvailability && (
                      <>
                        <div style={{ marginBottom: "5%" }}>
                          <TableAvailability
                            availabilityData={tableAvailability}
                          />
                        </div>
                      </>
                    )}
                    <RestaurantStatus
                      status={restaurantStatus}
                      disabled={isEditing}
                      onStatusChange={handleStatusChange}
                    />
                    <Typography
                      variant="h5"
                      sx={{ marginTop: "3%", marginBottom: "3%" }}
                    >
                      Restaurant Address
                    </Typography>
                    <Typography sx={{ marginBottom: "3%" }}>
                      Current Location: <br></br>
                      <b>{restaurantData.restaurant_location}</b>
                    </Typography>
                    <Typography sx={{ marginBottom: "1%", fontSize: "16px" }}>
                      New location:
                    </Typography>
                    <div style={{ marginBottom: "5%" }}>
                      <Autocomplete
                        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                        onPlaceSelected={(place) => handleAddressSelect(place)}
                        componentRestrictions={{ country: "ca" }}
                        options={{
                          types: ["geocode", "establishment"],
                        }}
                        className="maps-css"
                      />
                      {selectedAddress && (
                        <>
                          <Typography
                            variant="body1"
                            sx={{ marginTop: "1%", marginBottom: "2%" }}
                          >
                            New Location:{" "}
                            {selectedAddress.name
                              ? selectedAddress.name
                              : selectedAddress.formatted_address}
                          </Typography>
                          <Button
                            onClick={handleAddressSave}
                            variant="contained"
                            color="primary"
                            sx={{ marginBottom: "2%" }}
                          >
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </Grid>
                </Grid>

                <Typography align="left" variant="h5" sx={{ marginTop: "3%" }}>
                  Restaurant Operation Details
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 100,
                    marginBottom: "2%",
                    marginTop: "1%",
                    fontStyle: "italic",
                  }}
                >
                  Update the table and its capacity as per your needs.
                </Typography>
                {!isEditing && (
                  <Grid
                    container
                    spacing={1}
                    sx={{ marginTop: "4%", marginBottom: "3%" }}
                  >
                    <Grid
                      item
                      xs={5}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        label="Table Number"
                        value={newTable.table_number}
                        fullWidth
                        onChange={(e) =>
                          handleNewTableChange("table_number", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid
                      item
                      xs={5}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        label="Capacity"
                        type="number"
                        value={newTable.capacity}
                        fullWidth
                        onChange={(e) =>
                          handleNewTableChange("capacity", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid
                      item
                      xs={2}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        onClick={handleAddNewTable}
                        variant="contained"
                        color="primary"
                        sx={{ minHeight: "56px" }}
                        fullWidth
                      >
                        Add New Table
                      </Button>
                    </Grid>
                  </Grid>
                )}
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <b>TABLE NUMBER</b>
                        </TableCell>
                        <TableCell>
                          <b>CAPACITY</b>
                        </TableCell>
                        <TableCell>
                          <b>RESERVABLE</b>
                        </TableCell>
                        <TableCell
                          sx={{ display: "flex", justifyContent: "center" }}
                        >
                          <b>REMOVE AVAILABILITY</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isEditing
                        ? editedTableDetails.map((table) => (
                            <TableRow key={table.table_number}>
                              <TableCell>{table.table_number}</TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  value={table.capacity}
                                  onChange={(e) =>
                                    handleCapacityChange(table.table_number, e)
                                  }
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={table.reservable}
                                  onChange={() =>
                                    handleReservableToggleChange(
                                      table.table_number
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <IconButton
                                  onClick={() =>
                                    handleRemoveTable(table.table_number)
                                  }
                                  variant="contained"
                                  color="error"
                                  disabled
                                >
                                  <DeleteForeverIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        : editedTableDetails.map((table) => (
                            <TableRow key={table.table_number}>
                              <TableCell>{table.table_number}</TableCell>
                              <TableCell>{table.capacity}</TableCell>
                              <TableCell>
                                <Switch checked={table.reservable} disabled />
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <IconButton
                                  onClick={() =>
                                    handleRemoveTable(table.table_number)
                                  }
                                  variant="contained"
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
                {isEditing ? (
                  <div style={{ marginTop: "4%" }}>
                    <Button
                      onClick={handleSave}
                      variant="contained"
                      color="primary"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="contained"
                      color="secondary"
                      sx={{ marginLeft: "1%" }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Button
                      onClick={handleEdit}
                      variant="contained"
                      color="primary"
                      sx={{ marginTop: "2%" }}
                      disabled={editedTableDetails.length === 0}
                    >
                      Edit
                    </Button>
                    <div style={{ marginTop: "5%" }}>
                      <OpeningClosingHours
                        operationDetails={
                          restaurantData.restaurant_operation_details
                            ? restaurantData.restaurant_operation_details
                            : []
                        }
                        restaurantData={restaurantData}
                        refreshView={() => getResDetails()}
                        onSave={(editedHours) => {
                          console.log(
                            "Edited opening and closing hours:",
                            editedHours
                          );
                          updateHours(editedHours);
                        }}
                      />
                      <div style={{ marginTop: "5%" }}>
                        <Typography
                          align="left"
                          variant="h5"
                          sx={{ marginTop: "3%" }}
                        >
                          Restaurant Menu
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 100,
                            marginBottom: "4%",
                            marginTop: "1%",
                            fontStyle: "italic",
                          }}
                        >
                          Add any new item your restaurant's menu.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => navigate("/menu")}
                        >
                          Go to menu
                        </Button>
                        <>
                          {/* <AddMenuItem
                        refreshView={getResDetails}
                        resData={restaurantData}
                      /> */}
                        </>
                      </div>
                    </div>
                  </div>
                )}
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
              </div>
            ) : (
              <div>Loading...</div>
            )}
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

export default RestaurantDetails;
