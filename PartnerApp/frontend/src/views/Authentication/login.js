import React, { useState } from "react";
import { Button, TextField, Grid, Typography, Paper } from "@mui/material";
import { Lock, Person } from "@mui/icons-material";
import { auth } from "../../utils/Firebase"; 
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(">>>> Login done!!");
      console.log(user);
      setCookie("id", user.id, 7);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/home");
    } catch (error) {
      setError("Authentication failed. Please check your credentials.");
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      console.log("Google Sign-In Successful", userCredential.user);
      localStorage.setItem("user", JSON.stringify(userCredential.user));
      // Redirect the user to the desired page after successful login
      navigate("/home");
    } catch (error) {
      // Handle Google Sign-In errors
      console.error("Google Sign-In Error:", error);
    }
  };

  function setCookie(name, value, daysToExpire) {
    const date = new Date();
    date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  }

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: "100vh" }}>
      <Grid item xs={12} sm={8} md={6}>
        <Paper elevation={3} style={{ padding: "20px" }}>
          {error && <Typography variant="subtitle1" color="error">{error}</Typography>}
          <Typography variant="h5" align="center">Login</Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: <Person color="action" />,
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: <Lock color="action" />,
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              style={{ marginTop: "10px" }}
            >
              Sign In
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
  );
}


