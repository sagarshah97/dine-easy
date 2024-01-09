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
  Stack,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import ErrorMessage from "../../utils/Messages/ErrorMessage";
import { auth } from "../../utils/Firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const handleShowClick = () => setShowPassword(!showPassword);
  const handleShowCClick = () => setShowCPassword(!showCPassword);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
          await createUserWithEmailAndPassword(auth, email, password);
          setIsLoading(false);
          setShowPassword(false);
          navigate("/login"); // Replace '/dashboard' with your post-login page (to be decided)
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
          {/* <FormControl fullWidth required>
            <FormLabel>First Name</FormLabel>
            <TextField
              type="text"
              value={firstname}
              onChange={(event) =>
                setFirstName(event.target.value.replace(/[^a-z]/gi, ''))
              }
            />
          </FormControl>
          <FormControl fullWidth required>
            <FormLabel>Last Name</FormLabel>
            <TextField
              type="text"
              value={lastname}
              onChange={(event) =>
                setLastName(event.target.value.replace(/[^a-z]/gi, ''))
              }
            />
          </FormControl> */}
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
          <Link onClick={handleLoginClick}>Log In</Link>
        </Typography>
      </Box>
    </Container>
  );
}
