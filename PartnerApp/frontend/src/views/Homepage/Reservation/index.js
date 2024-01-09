import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  Button,
  Backdrop,
  CircularProgress,
  Modal,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate, useLocation } from "react-router-dom";

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASEURL,
  headers: {
    "X-API-Key": process.env.REACT_APP_API_KEY,
    "Content-Type": "application/json",
  },
});

const Today = new Date();

const ReservationList = () => {
  const userInfo = JSON.parse(window.localStorage.getItem("user"));
  const data = {
    customerId: userInfo.uid,
    customerEmail: userInfo.email,
    customerName: userInfo.displayName,
  };
  const [resData, setResData] = useState();
  useEffect(() => {
    axios
      .get(
        "https://i6morut7a6.execute-api.us-east-1.amazonaws.com/restaurantdetails/restaurants"
      )
      .then((response) => {
        setResData(JSON.parse(response.data?.body));
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const navigate = useNavigate();

  const [pastReservations, setPastReservations] = useState();
  const [upcomingReservations, setUpcomingReservations] = useState();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [spinnerOpen, setSpinnerOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      fetchBookingData();
    };

    fetchData();
  }, []);

  const fetchBookingData = async () => {
    try {
      setSpinnerOpen(true);
      const response = await api.post("/dev-get-bu/getReservationByUser", {
        body: {
          userId: data.customerId,
          timezone: "America/Halifax",
        },
      });

      populateReservations(response.data.body);
    } catch (error) {
      // Handle error
      setSpinnerOpen(false);
      console.error("Error fetching data:", error);
    }
  };

  const populateReservations = (bookings) => {
    let pastReservations = [];
    let upcomingReservations = [];

    bookings.forEach((reservation) => {
      const startTime = new Date(reservation.startTime);
      if (startTime < Today) {
        pastReservations.push(reservation);
      } else {
        upcomingReservations.push(reservation);
      }
    });

    setPastReservations(pastReservations);
    setUpcomingReservations(upcomingReservations);
    setSpinnerOpen(false);
  };

  const handleEdit = (event) => {
    const dataToPass = upcomingReservations.find(
      (obj) => obj.id === event.target.value
    );

    const restaurant = resData.find(
      (obj) => obj.restaurant_id?.S == dataToPass.restaurantId
    );

    navigate("/booking", {
      state: {
        mode: "edit",
        data: dataToPass,
        resData: restaurant,
      },
    });
  };

  const openDeleteModal = (reservationId) => {
    setReservationToDelete(reservationId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setReservationToDelete(null);
  };

  const handleDeleteConfirmation = async (confirmed) => {
    closeDeleteModal();
    setErrorMessage("");
    setSuccessMessage("");
    if (confirmed) {
      setSpinnerOpen(true);
      console.log("Delete confirmed for reservation ID:", reservationToDelete);
      const response = await api.post("/dev-delete/deleteReservation", {
        body: {
          reservationId: reservationToDelete,
          timezone: "America/Halifax",
        },
      });

      if (response.data.body.message) {
        setSnackbarOpen(true);
        setSpinnerOpen(false);

        setSuccessMessage(response.data.body.message);
      } else {
        setSnackbarOpen(true);
        setSpinnerOpen(false);
        setErrorMessage(response.data.body.error);
      }
      fetchBookingData();
      return response;
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const isEditButtonDisabled = (startTime) => {
    const currentTime = new Date();
    const reservationTime = new Date(startTime);
    const timeDifference = reservationTime - currentTime;

    // Check if the start time is 1 hour or less from the current time
    return timeDifference <= 60 * 60 * 1000; // 60 minutes * 60 seconds * 1000 milliseconds
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
        <Typography
          variant="h4"
          sx={{
            marginBottom: "2%",
          }}
        >
          Restaurant Reservations
        </Typography>

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.1rem",
            fontStyle: "italic",
            marginBottom: "2%",
          }}
        >
          Upcoming Reservations
        </Typography>

        {upcomingReservations &&
          upcomingReservations.map((reservation) => (
            <Accordion key={reservation.id} style={{ marginBottom: "16px" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                id={reservation.id}
              >
                <Grid container>
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                      {reservation.restaurantName}
                    </Typography>
                    <Typography>
                      {new Date(reservation.startTime).toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(reservation.endTime).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      <Chip
                        label={reservation.status}
                        sx={{
                          marginLeft: "2%",
                          color: "#fff",
                          backgroundColor:
                            reservation.status === "Pending"
                              ? "#ff9800"
                              : "#4caf50",
                        }}
                        size="small"
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: "1.1rem",
                        fontStyle: "italic",
                      }}
                    >
                      Reservation details
                    </Typography>
                    <Typography>
                      Table: {reservation.table}
                      <br />
                      Table Capacity: {reservation.tableCapacity}
                      <br />
                      Customer Name: {reservation.customerName}
                      <br />
                      Customer Email: {reservation.customerEmail}
                      <br />
                      Restaurant ID: {reservation.restaurantId}
                    </Typography>
                  </Grid>
                  {/* <Grid item xs={6}>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: "1.1rem",
                        fontStyle: "italic",
                      }}
                    >
                      Menu details
                    </Typography>
                    <Typography>None</Typography>
                  </Grid> */}
                  <Grid item xs={12}>
                    {isEditButtonDisabled(reservation.startTime) && (
                      <Typography
                        sx={{
                          fontWeight: 200,
                          fontSize: "1rem",
                          fontStyle: "italic",
                        }}
                      >
                        Reservation cannot be modified within 1 hour of
                        commencing
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      value={reservation.id}
                      onClick={handleEdit}
                      sx={{ width: "6rem", marginTop: "2%" }}
                      disabled={isEditButtonDisabled(reservation.startTime)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      value={reservation.id}
                      onClick={() => openDeleteModal(reservation.id)}
                      sx={{ width: "6rem", marginTop: "2%", marginLeft: "1%" }}
                    >
                      Delete
                    </Button>

                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        navigate("/menu", {
                          state: { mode: "nothing", data: reservation.id },
                        })
                      }
                      sx={{ width: "8rem", marginTop: "2%", marginLeft: "1%" }}
                    >
                      View Menu
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.1rem",
            fontStyle: "italic",
            marginBottom: "2%",
            marginTop: "3%",
          }}
        >
          Past Reservations
        </Typography>
        {pastReservations &&
          pastReservations.map((reservation) => (
            <Accordion key={reservation.id} style={{ marginBottom: "16px" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                id={reservation.id}
              >
                <Grid container>
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                      {reservation.restaurantName}
                    </Typography>
                    <Typography>
                      {new Date(reservation.startTime).toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(reservation.endTime).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Table: {reservation.table}
                  <br />
                  Table Capacity: {reservation.tableCapacity}
                  <br />
                  Customer Name: {reservation.customerName}
                  <br />
                  Customer Email: {reservation.customerEmail}
                  <br />
                  Restaurant ID: {reservation.restaurantId}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}

        {/* Confirmation modal */}
        <Modal
          open={isDeleteModalOpen}
          onClose={closeDeleteModal}
          aria-labelledby="delete-confirmation-modal"
          aria-describedby="delete-confirmation-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              id="delete-confirmation-modal"
              sx={{ marginBottom: "2%" }}
            >
              Confirm Deletion
            </Typography>
            <Typography
              id="delete-confirmation-description"
              sx={{ marginBottom: "6%" }}
            >
              Are you sure you want to delete this reservation?
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleDeleteConfirmation(true)}
            >
              Confirm
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteConfirmation(false)}
              sx={{ marginLeft: "1%" }}
            >
              Cancel
            </Button>
          </Box>
        </Modal>
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
  );
};

export default ReservationList;
