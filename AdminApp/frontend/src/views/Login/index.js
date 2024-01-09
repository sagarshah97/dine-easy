import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "10%",
  },
  paper: {
    padding: "16px",
    textAlign: "center",
    maxWidth: "500px",
  },
  textField: {
    marginBottom: "16px",
  },
  button: {
    marginTop: "16px",
  },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASEURL,
    headers: {
      "X-API-Key": process.env.REACT_APP_API_KEY,
      "Content-Type": "application/json",
    },
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleLogin = () => {
    setLoading(true);
    if (username && password) {
      window.sessionStorage.clear();

      api
        .post("/dev-admin-creds/checkAdminCreds", {
          username,
          password,
        })
        .then((response) => {
          if (response.data.body.message === "Login successful!") {
            window.sessionStorage.setItem("username", username);
            setSnackbarMessage("Login successful");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);

            // Delay navigation by 2 seconds
            setTimeout(() => {
              navigate("/home");
            }, 2000);
          } else {
            setSnackbarMessage("Login failed");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setSnackbarMessage("Error during login");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setSnackbarMessage("Please enter your credentials");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Container style={styles.container}>
      <Paper elevation={3} style={styles.paper}>
        <Typography variant="h5" sx={{ mb: 5, mt: 2 }}>
          LOGIN PAGE
        </Typography>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          style={styles.textField}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          style={styles.textField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          style={styles.button}
          onClick={handleLogin}
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
        </Button>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert severity={snackbarSeverity} onClose={handleSnackbarClose}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default LoginPage;
