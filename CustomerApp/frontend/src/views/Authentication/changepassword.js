import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Container,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function ChangePassword() {
  const [showPassword, setShowPassword] = useState(false);
  const handleShowClick = () => setShowPassword(!showPassword);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (password.length < 8) {
      setErrorMessage("Password should have a minimum of 8 characters");
      setSuccessMessage("");
      setIsLoading(false);
      return;
    } else if (password !== cpassword) {
      setErrorMessage("New password and confirm password do not match.");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      setSuccessMessage("");
      setIsLoading(false);
      setShowPassword(false);
    } else {
      try {
        // Replace the URL with your API endpoint
        const response = await fetch(
          `http://localhost:8080/users/changePassword/${email}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          }
        );

        if (response.ok) {
          setSuccessMessage("Password changed successfully!");
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
          setErrorMessage("");
          setPassword("");
          setCPassword("");
        } else {
          setErrorMessage("Failed to change password. Please try again.");
          setTimeout(() => {
            setErrorMessage(null);
          }, 3000);
          setSuccessMessage("");
        }
      } catch (error) {
        setErrorMessage("An error occurred. Please try again later.");
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        setSuccessMessage("");
      }
      setIsLoading(false);
      setShowPassword(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        mt={2}
        boxShadow={4}
        p={4}
        style={{ backgroundColor: "white" }}
      >
        <Typography variant="h4" color="textPrimary">
          Change Password
        </Typography>
        <form onSubmit={handleSubmit}>
          {successMessage && (
            <Typography color="success" align="center" fontWeight="bold">
              {successMessage}
            </Typography>
          )}
          {errorMessage && (
            <Typography color="error" align="center" fontWeight="bold">
              {errorMessage}
            </Typography>
          )}
          <FormControl required>
            <FormLabel>Email Address</FormLabel>
            <TextField
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
            />
          </FormControl>
          <FormControl required>
            <FormLabel>New Password</FormLabel>
            <TextField
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleShowClick}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Confirm Password</FormLabel>
            <TextField
              type={showPassword ? "text" : "password"}
              value={cpassword}
              onChange={(event) => setCPassword(event.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleShowClick}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            style={{ marginTop: "1rem" }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </Box>
    </Container>
  );
}
