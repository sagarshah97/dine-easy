import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASEURL_FIRESTORE,
  headers: {
    "X-API-Key": process.env.REACT_APP_API_KEY_UPDATE,
    "Content-Type": "application/json",
  },
});

const Reservation = () => {
  const navigate = useNavigate();
  const restaurantInfo = JSON.parse(window.localStorage.getItem("user"));
  console.log(restaurantInfo);
  const data = {
    resId: restaurantInfo?.uid,
    reservationId: restaurantInfo?.id,
  };
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      // Use a POST request and send restaurantId in the body
      const response = await api.post(
        "https://rpb4wuk0b3.execute-api.us-east-1.amazonaws.com/dev-get/get",
        {
          restaurantId: data.resId,
        }
      );

      let parsedData = JSON.parse(response.data.body); // Parse the stringified JSON array
      console.log(parsedData);

      if (parsedData?.length) {
        console.log("inside parsed data");
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the current day

        // Filter reservations to only include today's and future dates
        const filteredReservations = parsedData
          .filter(
            (booking) => new Date(booking.start_time._seconds * 1000) >= today
          )
          .map((booking) => ({
            ...booking,
            start_time: new Date(booking.start_time._seconds * 1000),
            end_time: new Date(booking.end_time._seconds * 1000),
          }));

        console.log(filteredReservations);
        setReservations(filteredReservations);
      } else {
        console.error("Unexpected data format:", parsedData);
        setReservations([]);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
    }
    setLoading(false);
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    setLoading(true);
    try {
      const response = await api.post(
        `https://q8bpl0ajb6.execute-api.us-east-1.amazonaws.com/update/update`,
        {
          reservationId: reservationId, // Using the passed reservationId
          status: newStatus, // Setting the status to either "approved" or "rejected"
        }
      );
      if (response.status === 200) {
        setSnackbarMessage(`Reservation ${newStatus}`);
        setSnackbarSeverity("success");
        fetchReservations(); // Refetch the reservations to update the list
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      setSnackbarMessage("Failed to update reservation");
      setSnackbarSeverity("error");
    }
    setLoading(false);
    setSnackbarOpen(true);
  };

  const handleDelete = async (reservationId, startTime) => {
    // Check if the reservation starts in more than 1 hour
    const reservationStartTime = new Date(startTime);
    const currentTime = new Date();
    const oneHourBeforeReservation = new Date(
      reservationStartTime.getTime() - 60 * 60 * 1000
    ); // 60 minutes * 60 seconds * 1000 milliseconds

    if (currentTime > oneHourBeforeReservation) {
      setSnackbarMessage(
        "Cannot delete reservation less than 1 hour before start time"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // API call to delete the reservation
    setLoading(true);
    try {
      const response = await api.post(
        `https://h2692m4q61.execute-api.us-east-1.amazonaws.com/dev-delete/delete`,
        { reservationId: reservationId } // Include reservationId in the body
      );

      if (response.status === 200) {
        setSnackbarMessage("Reservation deleted");
        setSnackbarSeverity("success");
        fetchReservations();
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      setSnackbarMessage("Failed to delete reservation");
      setSnackbarSeverity("error");
    }
    setLoading(false);
    setSnackbarOpen(true);
  };

  // Function to determine if the reservation can be deleted or edited
  const canModifyReservation = (startTime) => {
    const oneHourBefore = new Date(startTime);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);
    return new Date() < oneHourBefore;
  };

  return (
    <Container>
      {data.resId ? (
        <>
          <Typography variant="h4" sx={{ marginBottom: 2 }}>
            Restaurant Reservations
          </Typography>

          {loading && <CircularProgress />}
          {reservations.length > 0 ? (
            reservations.map((reservation) => (
              <Accordion key={reservation.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{reservation.restaurant_name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography>Table: {reservation.table}</Typography>
                      <Typography>
                        Capacity: {reservation.table_capacity}
                      </Typography>
                      <Typography>
                        Start Time:{" "}
                        {new Date(reservation.start_time).toLocaleString()}
                      </Typography>
                      <Typography>
                        End Time:{" "}
                        {new Date(reservation.end_time).toLocaleString()}
                      </Typography>
                      <Typography>Status: {reservation.status}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        onClick={() =>
                          handleStatusChange(reservation.id, "Approved")
                        }
                        disabled={!canModifyReservation(reservation.start_time)}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() =>
                          handleStatusChange(reservation.id, "Rejected")
                        }
                        disabled={!canModifyReservation(reservation.start_time)}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() =>
                          handleDelete(reservation.id, reservation.start_time)
                        }
                        disabled={!canModifyReservation(reservation.start_time)}
                      >
                        Delete
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography>No reservations to display</Typography>
          )}
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
    </Container>
  );
};
export default Reservation;
