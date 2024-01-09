import React, { useState } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  DialogContentText,
} from "@mui/material";
import axios from "axios";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const OpeningClosingHours = ({
  operationDetails,
  restaurantData,
  onSave,
  refreshView,
}) => {
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASEURL,
    headers: {
      "X-API-Key": process.env.REACT_APP_API_KEY,
      "Content-Type": "application/json",
    },
  });

  const [editedHours, setEditedHours] = useState([...operationDetails]);
  const [isEditing, setIsEditing] = useState(false);
  const [newDay, setNewDay] = useState({
    day: "",
    opening_time: 0,
    closing_time: 0,
  });
  const [isNewDayModalOpen, setNewDayModalOpen] = useState(false);

  const handleEdit = () => {
    if (editedHours.length > 0) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    // Validate duplicate days
    const daysSet = new Set();
    const hasDuplicate = editedHours.some((dayInfo) => {
      if (daysSet.has(dayInfo.day)) {
        alert("Duplicate days found. Please enter each day only once.");
        return true;
      }
      daysSet.add(dayInfo.day);
      return false;
    });

    if (!hasDuplicate) {
      setIsEditing(false);
      onSave(editedHours);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedHours([...operationDetails]);
  };

  const handleOpeningTimeChange = (day, value) => {
    const updatedHours = [...editedHours];
    const dayIndex = updatedHours.findIndex((item) => item.day === day);
    updatedHours[dayIndex].opening_time = parseInt(value);
    setEditedHours(updatedHours);
  };

  const handleClosingTimeChange = (day, value) => {
    const updatedHours = [...editedHours];
    const dayIndex = updatedHours.findIndex((item) => item.day === day);
    updatedHours[dayIndex].closing_time = parseInt(value);
    setEditedHours(updatedHours);
  };

  const handleNewDayChange = (field, value) => {
    setNewDay({
      ...newDay,
      [field]: value,
    });
  };

  const handleOpenNewDayModal = () => {
    setNewDayModalOpen(true);
  };

  const handleCloseNewDayModal = () => {
    setNewDayModalOpen(false);
    // Clear the new day data when closing the modal
    setNewDay({
      day: "",
      opening_time: 0,
      closing_time: 0,
    });
    refreshView();
  };

  const handleAddNewDay = () => {
    // Validation for duplicate days
    const isDuplicateDay = editedHours.some(
      (dayInfo) => dayInfo.day === newDay.day
    );
    if (isDuplicateDay) {
      alert("Duplicate day found. Please enter each day only once.");
      return;
    }

    // Validation for day
    const validDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    if (!validDays.includes(newDay.day)) {
      alert("Invalid day format. Please enter a valid day of the week.");
      return;
    }

    // Validation for opening and closing time (numeric and in 24hr format)
    const numericOpeningTime = parseInt(newDay.opening_time);
    newDay.opening_time = parseInt(newDay.opening_time);
    const numericClosingTime = parseInt(newDay.closing_time);
    newDay.closing_time = parseInt(newDay.closing_time);

    if (
      isNaN(numericOpeningTime) ||
      isNaN(numericClosingTime) ||
      numericOpeningTime < 0 ||
      numericOpeningTime > 2359 ||
      numericClosingTime < 0 ||
      numericClosingTime > 2359
    ) {
      alert(
        "Invalid time format. Please enter valid opening and closing times in 24hr format. (E.g.: 2000 - which means 08:00 PM)"
      );
      return;
    }

    // Add a new day only if all validations pass
    setEditedHours([...editedHours, newDay]);
    api
      .post("/dev-update-rd/updateRestaurantDetails", {
        restaurant_id: restaurantData.restaurant_id,
        restaurant_operation_details: [...editedHours, newDay],
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          handleCloseNewDayModal();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleRemoveDay = (day) => {
    const updatedHours = editedHours.filter((dayInfo) => dayInfo.day !== day);
    setEditedHours(updatedHours);
    api
      .post("/dev-update-rd/updateRestaurantDetails", {
        restaurant_id: restaurantData.restaurant_id,
        restaurant_operation_details: updatedHours,
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          refreshView();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <div>
      <Typography variant="h5" sx={{ marginTop: "2%" }}>
        Opening and Closing Hours
      </Typography>
      <Typography
        sx={{
          fontWeight: 100,
          marginBottom: "3%",
          marginTop: "1%",
          fontStyle: "italic",
        }}
      >
        Update the restaurant's opening and closing time for each day of the
        week.
      </Typography>
      <TableContainer sx={{ marginTop: "2%" }} component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>DAY</b>
              </TableCell>
              <TableCell>
                <b>OPENING TIME</b>
              </TableCell>
              <TableCell>
                <b>CLOSING TIME</b>
              </TableCell>
              <TableCell sx={{ display: "flex", justifyContent: "center" }}>
                <b>REMOVE AVAILABILITY</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {editedHours.map((dayInfo) => (
              <TableRow key={dayInfo.day}>
                <TableCell>{dayInfo.day}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      value={dayInfo.opening_time}
                      onChange={(e) =>
                        handleOpeningTimeChange(dayInfo.day, e.target.value)
                      }
                      fullWidth
                    />
                  ) : (
                    <>{`${dayInfo.opening_time
                      .toString()
                      .slice(0, 2)}:${dayInfo.opening_time
                      .toString()
                      .slice(2)} HRS`}</>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      value={dayInfo.closing_time}
                      onChange={(e) =>
                        handleClosingTimeChange(dayInfo.day, e.target.value)
                      }
                      fullWidth
                    />
                  ) : (
                    <>{`${dayInfo.closing_time
                      .toString()
                      .slice(0, 2)}:${dayInfo.closing_time
                      .toString()
                      .slice(2)} HRS`}</>
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {isEditing && (
                    <IconButton variant="outlined" color="error" disabled>
                      <DeleteForeverIcon />
                    </IconButton>
                  )}
                  {!isEditing && (
                    <IconButton
                      onClick={() => handleRemoveDay(dayInfo.day)}
                      variant="outlined"
                      color="error"
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {isEditing ? (
        <div style={{ marginTop: "2%" }}>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
          <Button
            onClick={handleCancel}
            variant="link"
            color="secondary"
            sx={{ marginLeft: "1%" }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div>
          <Button
            onClick={handleEdit}
            variant="contained"
            color="primary"
            sx={{ marginTop: "2%" }}
            disabled={editedHours.length === 0}
          >
            Edit
          </Button>
          {!isEditing && (
            <Button
              onClick={handleOpenNewDayModal}
              variant="contained"
              color="primary"
              sx={{ marginTop: "2%", marginLeft: "1%" }}
            >
              Add New Day
            </Button>
          )}
        </div>
      )}

      {/* New Day Modal */}
      <Dialog open={isNewDayModalOpen} onClose={handleCloseNewDayModal}>
        <DialogTitle>Add New Day</DialogTitle>
        <DialogContentText
          sx={{ pl: 3, pr: 3, pt: 1, pb: 1, fontStyle: "italic" }}
        >
          Add the time in a numeric format in 24 Hrs format. For example: If
          restaurant opens at 10 AM in the morning and closes at 10 PM in the
          night, the Opening Time would be <b>1000</b> and Closing Time would be{" "}
          <b>2200</b>.
        </DialogContentText>
        <DialogContent>
          <TextField
            label="Day"
            value={newDay.day}
            onChange={(e) => handleNewDayChange("day", e.target.value)}
            fullWidth
            sx={{ marginBottom: "3%", marginTop: "3%" }}
          />
          <TextField
            label="Opening Time"
            value={newDay.opening_time}
            onChange={(e) => handleNewDayChange("opening_time", e.target.value)}
            fullWidth
            sx={{ marginBottom: "3%" }}
          />
          <TextField
            label="Closing Time"
            value={newDay.closing_time}
            onChange={(e) => handleNewDayChange("closing_time", e.target.value)}
            fullWidth
            sx={{ marginBottom: "3%" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewDayModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddNewDay} color="primary">
            Add Day
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OpeningClosingHours;
