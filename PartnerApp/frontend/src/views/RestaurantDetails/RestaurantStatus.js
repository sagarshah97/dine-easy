import React, { useState } from "react";
import {
  Typography,
  Select,
  MenuItem,
  Button,
  Chip,
  Grid,
} from "@mui/material";

const RestaurantStatus = ({ status, onStatusChange, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onStatusChange(newStatus);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (event) => {
    console.log("IN CHILD ", event.target.value);
    setNewStatus(event.target.value);
  };

  return (
    <div style={{ marginBottom: "5%", marginTop: "5%" }}>
      <Typography align="left" sx={{ fontWeight: 100 }}>
        Restaurant Status:
      </Typography>
      {isEditing ? (
        <div style={{ marginTop: "3%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Select
                value={newStatus ? newStatus : status}
                onChange={handleChange}
                sx={{ width: "231px" }}
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Button onClick={handleSave} variant="contained" color="primary">
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="contained"
                color="secondary"
                sx={{ marginLeft: "1%" }}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </div>
      ) : (
        <div style={{ marginTop: "3%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography
                sx={{
                  height: "56px",
                  width: "231px",
                  border: "1px solid lightgrey",
                  borderRadius: "5px",
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  paddingLeft: "1%",
                }}
              >
                {status}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                onClick={handleEdit}
                variant="contained"
                color="primary"
                disabled={disabled}
              >
                Edit
              </Button>
            </Grid>
          </Grid>
        </div>
      )}
    </div>
  );
};

export default RestaurantStatus;
