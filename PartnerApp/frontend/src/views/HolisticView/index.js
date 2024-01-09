import React, { useState, useEffect } from "react";
import { Container, Grid, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BookingItem from "./BookingItem";
import "./ReservationsDashboard.css";

const HolisticView = () => {
  const navigate = useNavigate();
  const restaurantInfo = JSON.parse(window.localStorage.getItem("user"));
  const data = {
    resId: restaurantInfo?.uid,
  };
  const [bookings, setBookings] = useState([]);
  const [viewType, setViewType] = useState("daily"); // Options: 'daily', 'weekly', 'monthly'

  useEffect(() => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId: data.resId }),
    };

    fetch(
      "https://ddmvrp74fc.execute-api.us-east-1.amazonaws.com/view/restaurant",
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.body) {
          try {
            // Parsing the stringified body to get the bookings array
            const bookingsArray = JSON.parse(data.body);
            const bookingsWithDates = bookingsArray.map((booking) => ({
              ...booking,
              start_time: new Date(booking.start_time._seconds * 1000),
              end_time: new Date(booking.end_time._seconds * 1000),
            }));
            console.log(bookingsWithDates);
            setBookings(bookingsWithDates);
          } catch (error) {
            console.error("Error parsing bookings data:", error);
          }
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch((error) => console.error("Error fetching bookings:", error));
  }, []);

  const isWithinRange = (date, start, end) => {
    return date >= start && date <= end;
  };

  const filteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    console.log(startOfMonth + " >> " + endOfMonth);

    return bookings.filter((booking) => {
      const startTime = booking.start_time;
      switch (viewType) {
        case "daily":
          return isWithinRange(startTime, today, today);
        case "weekly":
          return isWithinRange(startTime, startOfWeek, endOfWeek);
        case "monthly":
          return isWithinRange(startTime, startOfMonth, endOfMonth);
        default:
          return true;
      }
    });
  };

  const getNoBookingMessage = () => {
    switch (viewType) {
      case "daily":
        return "No bookings for today";
      case "weekly":
        return "No bookings for this week";
      case "monthly":
        return "No bookings for this month";
      default:
        return "No bookings available";
    }
  };

  const countReservationsByStatus = () => {
    let Pending = 0,
      Approved = 0,
      Rejected = 0;

    filteredBookings().forEach((booking) => {
      switch (booking.status) {
        case "Pending":
          Pending++;
          break;
        case "Approved":
          Approved++;
          break;
        case "Rejected":
          Rejected++;
          break;
        default:
          break;
      }
    });

    return { Pending, Approved, Rejected };
  };

  const { Pending, Approved, Rejected } = countReservationsByStatus();

  return (
    <>
      {data.resId ? (
        <>
          <div>
            <div className="status-cards-container">
              <div className="card">
                <h4>Pending Reservations</h4>
                <p>{Pending}</p>
              </div>
              <div className="card">
                <h4>Approved Reservations</h4>
                <p>{Approved}</p>
              </div>
              <div className="card">
                <h4>Rejected Reservations</h4>
                <p>{Rejected}</p>
              </div>
            </div>

            <div className="button-container">
              <button onClick={() => setViewType("daily")}>Daily View</button>
              <button onClick={() => setViewType("weekly")}>Weekly View</button>
              <button onClick={() => setViewType("monthly")}>
                Monthly View
              </button>
            </div>

            <div>
              {filteredBookings().length > 0 ? (
                filteredBookings().map((booking) => (
                  <div key={booking.id} className="card">
                    <BookingItem booking={booking} />
                  </div>
                ))
              ) : (
                <p>{getNoBookingMessage()}</p>
              )}
            </div>
          </div>
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

export default HolisticView;
