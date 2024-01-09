import React, { useState } from "react";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Typography,
  TextField,
  Link,
  Container,
  Box,
} from "@mui/material";
import { Lock, Person } from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import ErrorMessage from "../../utils/Messages/ErrorMessage";
import Logo from "../../assets/images/dineLogo.png";
import { auth } from "../../utils/Firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleShowClick = () => setShowPassword(!showPassword);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Authentication was successful
      const user = userCredential.user;
      console.log(user);
      setCookie("id", user.id, 7);
      // localStorage.setItem('id',"Bearer "+ data.user.id);
      //localStorage.setItem('user', user);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/home");
    } catch (error) {
      // Handle authentication error
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to set a cookie with a given name, value, and expiration date
  function setCookie(name, value, daysToExpire) {
    const date = new Date();
    date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      // User is signed in with Google.
      // You can access user information via userCredential.user
      console.log("Google Sign-In Successful", userCredential.user);
      localStorage.setItem("user", JSON.stringify(userCredential.user));
      // Redirect the user to the desired page after successful login
      navigate("/home");
    } catch (error) {
      // Handle Google Sign-In errors
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  const handlePassClick = (e) => {
    e.preventDefault();
    navigate("/changepassword");
  };

  return (
    <Container maxWidth="sm">
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        // style={{ minHeight: "100vh" }}
        // sx={{ backgroundColor: "#000C66" }}
      >
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{ p: 2, mt: 8, backgroundColor: "whiteAlpha.900" }}
          >
            {error && <ErrorMessage message={error} />}
            <Typography variant="h5" color="textPrimary" align="center">
              Login
            </Typography>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal" required>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Email Address"
                  type="email"
                  onChange={(event) => setEmail(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
              <FormControl fullWidth margin="normal" required>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  onChange={(event) => setPassword(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowClick}>
                          {showPassword ? "Hide" : "Show"}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormHelperText textAlign="right">
                  <Link variant="body2" onClick={handlePassClick}>
                    Forgot password?
                  </Link>
                </FormHelperText>
              </FormControl>
              <FormControl>
                <FormControlLabel
                  control={<Checkbox color="primary" />}
                  label="Remember Me"
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
                  "Sign In"
                )}
              </Button>
            </form>
            <Typography align="center" color="textPrimary">
              <span>Don't have an account? </span>
              <Link onClick={handleRegisterClick}>Register here</Link>
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ mt: 2 }}
            >
              OR
            </Typography>

            {/* Google Sign-In Button */}
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleGoogleSignIn}
            >
              Sign In with Google
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
