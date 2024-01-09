import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import restaurants from "../../assets/images/restaurants.jpeg";
import foodItems from "../../assets/images/fooditems.jpeg";
import customers from "../../assets/images/customers.jpeg";
import reviews from "../../assets/images/reviews.jpeg";
import periods from "../../assets/images/food-periods.jpeg";


const sections = [
  {
    key: "restaurants",
    image: restaurants,
    title: "Top 10 Restaurants",
    route: "/resbyorder",
  },
  {
    key: "foodItems",
    image: foodItems,
    title: "Top 10 Food Items",
    route: "/topfooditems",
  },
  {
    key: "periods",
    image: periods,
    title: "Top 10 Food Ordered Periods",
    route: "/foodorderperiods",
  },
  {
    key: "customers",
    image: customers,
    title: "Top 10 Customers",
    route: "/custbyorder",
  },
  {
    key: "reviews",
    image: reviews,
    title: "Reviews",
    route: "/reviewbyrestaurantname",
  },
];

const styles = {
  container: {
    textAlign: "center",
    marginTop: "3%",
  },
  card: {
    minWidth: "200px",
    width: "320px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  media: {
    height: 180,
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
  },
};

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for the existence of the username key in the session storage
    const username = window.sessionStorage.getItem("username");
    if (!username) {
      // Navigate to the login page if the username is not found
      navigate("/login");
    }
  }, [navigate]);

  const handleCardClick = (route) => {
    navigate(route);
  };

  const handleLogout = () => {
    // Clear the session storage and navigate to the login page
    window.sessionStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h1>Welcome to the Admin Dashboard</h1>
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 4,
        }}
      >
        {sections.map(({ key, image, title, route }) => (
          <Grid item key={key} sx={{ p: 0, m: 0 }}>
            <Card style={styles.card} onClick={() => handleCardClick(route)}>
              <CardMedia
                component="img"
                alt={`${key} image`}
                image={image}
                style={styles.media}
              />
              <CardContent>
                <Typography variant="subtitle1" style={styles.title}>
                  {title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button
        variant="contained"
        sx={{ mt: 5, mb: 5 }}
        color="error"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
};

export default Homepage;
