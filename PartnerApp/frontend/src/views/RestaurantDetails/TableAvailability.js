import React from "react";
import {
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
} from "@mui/material";

const TableAvailability = ({ availabilityData }) => {
  const isFullyBooked = availabilityData.isFullyBooked;
  const tableAvailability = availabilityData.tableAvailability;

  return (
    <div>
      <Box sx={{ marginTop: "5%" }}>
        {availabilityData.message ? (
          <>
            <Typography variant="subtitle1">
              Overall Availability:{" "}
              <Chip label={availabilityData.message} color="error" />
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="subtitle1">
              Overall Availability:{" "}
              <Chip
                label={
                  isFullyBooked ? "Fully Booked" : "Accepting Reservations"
                }
                color={isFullyBooked ? "error" : "success"}
              />
            </Typography>
            <Typography variant="subtitle1">Table Availability:</Typography>
            <Paper sx={{ marginTop: "2%" }}>
              <List sx={{ padding: 0 }}>
                {Object.keys(tableAvailability).map((tableNumber) => (
                  <>
                    <ListItem key={tableNumber}>
                      <ListItemText
                        primary={`Table ${tableNumber}: ${tableAvailability[tableNumber][tableNumber]}`}
                      />
                    </ListItem>
                    <Divider />
                  </>
                ))}
              </List>
            </Paper>
          </>
        )}
      </Box>
    </div>
  );
};

export default TableAvailability;
