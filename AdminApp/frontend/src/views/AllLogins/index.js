import React from "react";
import { Grid, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/images/homescreen.jpeg";

const styles = {
  leftSide: {
    flex: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100vh",
    objectFit: "cover",
  },
  rightSide: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  button: {
    margin: "10px",
    width: "200px",
  },
};

const AllLogins = () => {
  const navigate = useNavigate();

  const handleLoginClick = (url) => {
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      navigate(url);
    }
  };

  return (
    <Grid container>
      <Grid item xs={12} md={7} sx={styles.leftSide}>
        <img src={backgroundImage} alt="Background" style={styles.image} />
      </Grid>

      <Grid item xs={12} md={5} sx={styles.rightSide}>
        <Typography variant="h4" gutterBottom>
          Choose Login Option
        </Typography>
        <Button
          variant="contained"
          color="primary"
          style={styles.button}
          onClick={() => handleLoginClick(process.env.REACT_APP_CUSTOMER_URL)}
        >
          Login as Customer
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={styles.button}
          onClick={() => handleLoginClick(process.env.REACT_APP_PARTNER_URL)}
        >
          Login as Partner
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={styles.button}
          onClick={() => handleLoginClick("/login")}
        >
          Login as Admin
        </Button>
      </Grid>
    </Grid>
  );
};

export default AllLogins;
