// Author: Sagar Paresh Shah (B00930009)

import React, { useEffect, useState } from "react";
import {
  Container,
  Button,
  Snackbar,
  Alert,
  Grid,
  Backdrop,
  CircularProgress,
  Typography,
} from "@mui/material";

import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useNavigate, useLocation } from "react-router-dom";

import generateAvailableSlots from "../../utils/AvailabilityGenerator";
import transformData from "../../utils/TransformResAvailability";
import axios from "axios";
const moment = require("moment");

const ReservationApp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userInfo = JSON.parse(window.localStorage.getItem("user"));
  const userData = {
    customerId: userInfo?.uid,
    customerEmail: userInfo?.email,
    customerName: userInfo?.displayName
      ? userInfo?.displayName
      : userInfo?.email.split("@")[0],
  };
  const data = location.state.data;
  const mode = location.state.mode;
  const resInfo = location.state.resData;

  const transformedTableData = (inputData) => {
    if (!inputData || !inputData.L) {
      return [];
    }

    return inputData.L.map((item) => {
      const tableData = item.M;
      return {
        tableNumber: tableData.table_number.S,
        capacity: tableData.capacity.S,
      };
    });
  };

  const resData = {
    restaurantId: resInfo.restaurant_id?.S,
    restaurantName: resInfo.restaurant_name?.S,
    tables: transformedTableData(resInfo.table_details),
    availability: transformData({
      restaurant_operation_details: resInfo.restaurant_operation_details,
    }),
  };

  if (!userData || !resData) {
    navigate("/");
  }

  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [parsedDate, setParsedDate] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedTableCapacity, setSelectedTableCapacity] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [spinnerOpen, setSpinnerOpen] = useState(false);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASEURL,
    headers: {
      "X-API-Key": process.env.REACT_APP_API_KEY,
      "Content-Type": "application/json",
    },
  });

  const fetchBookings = async (date, restaurantId) => {
    try {
      const response = await api.post(
        "/dev-get-br/getReservationByRestaurant",
        {
          body: {
            restaurantId: restaurantId,
            date: date,
            timezone: "America/Halifax",
          },
        }
      );

      return response.data.body;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  };

  const handleDateChange = async (event) => {
    setSpinnerOpen(true);
    const newDate = event.$d.toString();
    setSelectedDate(newDate);

    const parts = newDate.split(" ");
    const day = parts[0];
    const month = parts[1];
    const date = parts[2];
    const year = parts[3];

    const formattedDate = `${month} ${date}, ${year}`;
    setParsedDate(formattedDate);
    let bookingData = await fetchBookings(formattedDate, resData.restaurantId);
    if (bookingData.toString().includes("No reservations found")) {
      bookingData = [];
    }

    const bookingSlots = generateAvailableSlots(
      bookingData,
      resData,
      day,
      formattedDate
    );
    setBookings(bookingSlots);
    setSpinnerOpen(false);
  };

  const handleTableSelect = (tableNumber) => {
    setSelectedTable(tableNumber);
    setSelectedTableCapacity(
      resData.tables.find((obj) => obj.tableNumber === tableNumber).capacity
    );
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleReservationSubmit = async () => {
    setSpinnerOpen(true);
    setSuccessMessage("");
    setErrorMessage("");
    if (selectedSlot) {
      const { startTime, endTime } = convertSlotToTimes(
        selectedSlot.slot,
        parsedDate
      );

      try {
        let response;

        if (mode === "edit") {
          response = await api.post("/dev-update/updateReservation", {
            body: {
              reservationId: data.id,
              newReservationData: {
                tableNumber: parseInt(selectedTable),
                tableCapacity: parseInt(selectedTableCapacity),
                startTime: startTime,
                endTime: endTime,
                timezone: "America/Halifax",
                customerId: userData.customerId,
                customerName: userData.customerName,
                customerEmail: userData.customerEmail,
                restaurantId: resData.restaurantId,
                restaurantName: resData.restaurantName,
              },
            },
          });
        } else {
          response = await api.post("/dev-create/createReservation", {
            body: {
              tableNumber: parseInt(selectedTable),
              tableCapacity: parseInt(selectedTableCapacity),
              startTime: startTime,
              endTime: endTime,
              timezone: "America/Halifax",
              customerId: userData.customerId,
              customerName: userData.customerName,
              customerEmail: userData.customerEmail,
              restaurantId: resData.restaurantId,
              restaurantName: resData.restaurantName,
            },
          });
        }

        if (response.data.body.message?.includes("success")) {
          setSuccessMessage(response.data.body.message);
          setTimeout(() => {
            navigate("/mybookings");
          }, 2000);
        } else {
          setErrorMessage(response.data.body.error);
        }
        setSpinnerOpen(false);
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error submitting reservation:", error);
      }
    }
  };

  const convertSlotToTimes = (slot, date) => {
    const formattedDate = moment(date, "MMM DD, YYYY").format("YYYY-MM-DD");

    // Split the slot into start and end times
    const [startTimeStr, endTimeStr] = slot.split(" - ");

    // Parse the times and format them
    const startTime = moment(
      formattedDate + " " + startTimeStr.trim(),
      "YYYY-MM-DD HH:mm"
    ).format("YYYY-MM-DD HH:mm:ss");
    const endTime = moment(
      formattedDate + " " + endTimeStr.trim(),
      "YYYY-MM-DD HH:mm"
    ).format("YYYY-MM-DD HH:mm:ss");

    return { startTime, endTime };
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
      {userData.customerId &&
      userData?.customerEmail &&
      resData?.restaurantId ? (
        <>
          <Container maxWidth="md">
            <Grid container spacing={2}>
              {mode === "edit" && (
                <>
                  <Grid item xs={12}>
                    <Typography sx={{ fontStyle: "italic" }}>
                      Current reservation details:
                    </Typography>
                  </Grid>
                </>
              )}
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 100, fontSize: "1rem" }}>
                  Customer Name
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: "1.3rem" }}>
                  {userData.customerName}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 100, fontSize: "1rem" }}>
                  Customer Email
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: "1.3rem" }}>
                  {userData.customerEmail}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography sx={{ fontWeight: 100, fontSize: "1rem" }}>
                  Restaurant Name
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: "1.3rem" }}>
                  {resData.restaurantName}
                </Typography>
              </Grid>
              {mode === "edit" && (
                <>
                  <Grid item xs={8}>
                    <Typography sx={{ fontWeight: 100, fontSize: "1rem" }}>
                      Time
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: "1.3rem" }}>
                      {new Date(data.startTime).toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(data.endTime).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography sx={{ fontWeight: 100, fontSize: "1rem" }}>
                      Table number
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: "1.3rem" }}>
                      {data.table}
                    </Typography>
                  </Grid>
                </>
              )}
              {mode === "edit" && (
                <>
                  <Grid item xs={12}>
                    <Typography sx={{ fontStyle: "italic" }}>
                      Modify reservation details:
                    </Typography>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Typography sx={{ fontWeight: 100, fontSize: "1rem" }}>
                  Pick a date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      label="Select"
                      value={selectedDate}
                      onChange={handleDateChange}
                      disablePast
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>

              {bookings?.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        paddingTop: "2%",
                        paddingBottom: "2%",
                        fontWeight: 200,
                        fontSize: "1.3rem",
                      }}
                    >
                      Tables:
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.keys(bookings).map((tableNumber) => (
                        <Grid item key={tableNumber}>
                          <Button
                            variant={
                              selectedTable === tableNumber
                                ? "contained"
                                : "outlined"
                            }
                            onClick={() => handleTableSelect(tableNumber)}
                          >
                            Table {tableNumber}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                    {selectedTable && (
                      <Grid item xs={12} sx={{ marginTop: "3%" }}>
                        {selectedTable && (
                          <Typography
                            sx={{
                              fontWeight: 200,
                              fontSize: "1.3rem",
                            }}
                          >
                            Capacity: <b>{selectedTableCapacity}</b>
                          </Typography>
                        )}
                      </Grid>
                    )}
                    {selectedTable && bookings && (
                      <Typography
                        sx={{
                          paddingTop: "2%",
                          paddingBottom: "2%",
                          fontWeight: 200,
                          fontSize: "1.3rem",
                        }}
                      >
                        Available slots:
                      </Typography>
                    )}
                    <Grid container spacing={2}>
                      {selectedTable &&
                        bookings[selectedTable].map((slot) => (
                          <Grid item xs={2} key={slot.slot}>
                            <Button
                              variant={
                                selectedSlot === slot ? "contained" : "outlined"
                              }
                              onClick={() => handleSlotSelect(slot)}
                              disabled={!slot.available}
                            >
                              {slot.slot}
                            </Button>
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>
                </>
              )}
              {!bookings?.length && (
                <>
                  <Typography
                    sx={{
                      ml: 2,
                      mt: 4,
                      fontStyle: "italic",
                      color: "grey",
                    }}
                  >
                    No availability
                  </Typography>
                </>
              )}
              <Grid item xs={12} sx={{ marginTop: "3%" }}>
                {selectedTable && selectedSlot && (
                  <Typography
                    sx={{
                      fontWeight: 200,
                      fontSize: "1.3rem",
                    }}
                  >
                    Reservation for table <b>{selectedTable}</b> at{" "}
                    <b>{selectedSlot.slot}</b> on <b>{parsedDate}</b>
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sx={{ marginTop: "4%" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleReservationSubmit}
                  disabled={!selectedSlot}
                >
                  Submit Reservation
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

export default ReservationApp;
