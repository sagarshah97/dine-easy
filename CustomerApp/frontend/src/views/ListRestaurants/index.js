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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl =
      "https://i6morut7a6.execute-api.us-east-1.amazonaws.com/restaurantdetails/restaurants";

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const restaurantData = JSON.parse(
          data.body.replace(/"(\s+)(\w+)(?=")/g, '"$2')
        );

        setRestaurants(restaurantData);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const handleReservation = (restaurantId) => {
    navigate("/booking", {
      state: {
        mode: "create",
        resData: restaurants.find(
          (obj) => obj.restaurant_id?.S === restaurantId
        ),
      },
    });
  };

  const handleViewMenu = (id) => {
    navigate(`/RestaurantDetails/${id}`);
  };

  return (
    <>
      <Container maxWidth="md">
        <Grid container spacing={2}>
          {restaurants.map((restaurant, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <CardMedia
                      component="img"
                      alt={restaurant.restaurant_name?.S || "N/A"}
                      height="170px"
                      image={restaurant?.img?.S}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {restaurant.restaurant_name?.S || "N/A"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {restaurant.restaurant_description?.S || "N/A"}
                      </Typography>
                      <Box mt={2} display="flex">
                        <Button
                          onClick={() =>
                            handleReservation(restaurant.restaurant_id?.S)
                          }
                          variant="contained"
                          color="primary"
                          style={{ marginRight: "10px" }}
                        >
                          Make Reservation
                        </Button>
                        <Button
                          onClick={() =>
                            handleViewMenu(restaurant.restaurant_id?.S)
                          }
                          variant="outlined"
                        >
                          View Menu
                        </Button>
                      </Box>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default RestaurantList;
