import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DetailsCard from './DetailsCard';
import { Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import '../../styles/App.css';


const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const apiUrl = 'https://i6morut7a6.execute-api.us-east-1.amazonaws.com/restaurantdetails/restaurants';
        const response = await fetch(apiUrl);
        const data = await response.json();
        const restaurantData = JSON.parse(data.body.replace(/"(\s+)(\w+)(?=")/g, '"$2'));
        const selectedRestaurant = restaurantData.find((item) => item.restaurant_id.S === id);
        setRestaurant(selectedRestaurant);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data: ', error);
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!restaurant) {
    console.error('Restaurant not found for id:', id);
    return <div>Restaurant data not found.</div>;
  }

  return (
    <div className="restaurant-details">
      <button className="custom-button" onClick={handleGoBack}>
        Go Back
      </button>
      <div className="centered-text">
        <h2>{restaurant?.restaurant_name.S || 'N/A'} Details</h2>
        <p className="center-text">Location: {restaurant?.restaurant_location.S || 'N/A'}</p>
        <p className="center-text">
          Operation Hours:
          <Typography variant="body2" color="textSecondary">
            {restaurant.restaurant_operation_details?.L?.map((day, index) => (
              <div key={index}>
                {day?.M?.day?.S || 'N/A'}: Opening at {day?.M?.opening_time?.N || 'N/A'} - Closing
                at {day?.M?.closing_time?.N || 'N/A'}
              </div>
            )) || 'N/A'}
          </Typography>
        </p>
      </div>
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        {restaurant?.restaurant_food_menu.L.map((data, i) => (
          <Grid item sm={3} key={i}>
            <DetailsCard data={data} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default RestaurantDetails;
