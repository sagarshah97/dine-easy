import React from "react";

const BookingItem = ({ booking }) => {
  const { start_time, end_time, table, restaurant_name, status } = booking;

  return (
    <div>
      <h3>
        {restaurant_name} - Table {table}
      </h3>
      <p>Start Time: {start_time.toLocaleString()}</p>
      <p>End Time: {end_time.toLocaleString()}</p>
      <p>Status: {status}</p>
    </div>
  );
};
export default BookingItem;
