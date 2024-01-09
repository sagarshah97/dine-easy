import React, { useState } from "react";
import {
  Button,
  Container,
  CircularProgress,
  FormControl,
  FormLabel,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import ErrorMessage from "../../utils/Messages/ErrorMessage";
import { auth } from "../../utils/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export default function Register() {
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASEURL,
    headers: {
      "X-API-Key": process.env.REACT_APP_API_KEY,
      "Content-Type": "application/json",
    },
  });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");

  const handleShowClick = () => setShowPassword(!showPassword);
  const handleShowCClick = () => setShowCPassword(!showCPassword);

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (password === cpassword) {
      if (password.length >= 8) {
        try {
          const res = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          console.log(JSON.stringify(res));
          api
            .post("/dev-create-sns/createSNS", { email })
            .then((response) => {
              console.log(response.data.body);
            })
            .catch((error) => {
              console.log("Error: " + error);
            });
          const restaurantData = {
            restaurant_email: email,
            restaurant_id: res.user.uid,
            restaurant_description: "This is the best restaurant ever!",
            restaurant_name: restaurantName,
          };
          console.log(res);
          await sendRestaurantDataToBackend(restaurantData);

          setIsLoading(false);
          setShowPassword(false);
          navigate("/login");
        } catch (error) {
          console.error("Error while registering:", error);
          setError("An error occurred. Please try again later.");
          setIsLoading(false);
          setShowPassword(false);
        }
      } else {
        setError("Password should have a minimum of 8 characters!");
        setIsLoading(false);
        setShowPassword(false);
      }
    } else {
      setError("Password and Confirm password do not match!");
      setIsLoading(false);
      setShowPassword(false);
    }
  };

  const sendRestaurantDataToBackend = async (restaurantData) => {
    try {
      const backendUrl =
        "https://rsvl8zqlyk.execute-api.us-east-1.amazonaws.com/signup/sign";
      console.log(restaurantData);
      await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restaurantData),
      });
    } catch (error) {
      console.error("Error sending restaurant data to backend:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mt={8}
        p={4}
        boxShadow={3}
        bgcolor="whiteAlpha.900"
        borderRadius={4}
      >
        <Typography variant="h5" color="text.primary" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          {error && <ErrorMessage message={error} />}
          <FormControl fullWidth required>
            <FormLabel>Email</FormLabel>
            <TextField
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
          </FormControl>
          <FormControl fullWidth required>
            <FormLabel>Password</FormLabel>
            <TextField
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleShowClick}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormControl fullWidth required>
            <FormLabel>Confirm Password</FormLabel>
            <TextField
              type={showCPassword ? "text" : "password"}
              value={cpassword}
              onChange={(event) => setCPassword(event.currentTarget.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleShowCClick}>
                      {showCPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormControl fullWidth required>
            <FormLabel>Restaurant Name</FormLabel>
            <TextField
              value={restaurantName}
              onChange={(event) => setRestaurantName(event.currentTarget.value)}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Register"
            )}
          </Button>
        </form>
        <Typography
          variant="body2"
          color="text.primary"
          align="center"
          sx={{ mt: 2 }}
        >
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Log In
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
