// LogoutButton.js
import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { auth } from "../../utils/Firebase.js";
import { Box } from "@mui/material";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Implement your logout logic here, e.g., sign out the user
      await auth.signOut();
      localStorage.removeItem("user"); // Remove user information from local storage
      navigate("/login"); // Redirect to the login page after logging out
    } catch (error) {
      
      console.error("Logout error:", error);
    }
  };

  return (
    <Button variant="contained" color="error" onClick={handleLogout}>
      Log Out
    </Button>
  );
};

export default LogoutButton;
