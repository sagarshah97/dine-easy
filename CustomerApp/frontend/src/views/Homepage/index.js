import underConstruction from "../../assets/images/underConstruction.jpeg";
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Container,
} from "@mui/material";
import LogoutButton from "../Authentication/logout";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "View Restaurants",
      image: "https://customeappimages.s3.amazonaws.com/Viewrestaurants.jpg",
      link: "/listrestaurants",
    },
    {
      title: "View Reservations",
      image: "https://customeappimages.s3.amazonaws.com/reservation.jpg",
      link: "/mybookings",
    },
    // Add more menu items as needed
  ];

  const handleClick = (menuItem) => {
    console.log(menuItem);
    navigate(menuItem.link);
  };

  const handleRestaurants = () => {
    navigate("/listrestaurants");
  };

  const handleView = () => {
    navigate("/mybookings");
  };

  const handleMenu = () => {
    navigate("/menu");
  };

  return (
    <>
      <Container>
        <Grid container spacing={2}>
          {menuItems.map((menuItem, index) => (
            <Grid item xs={6} key={index}>
              <Card>
                <CardActionArea onClick={() => handleClick(menuItem)}>
                  <CardMedia
                    component="img"
                    alt={menuItem.title}
                    height="200"
                    image={menuItem.image}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {menuItem.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "3%",
            }}
          >
            <LogoutButton />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Homepage;
